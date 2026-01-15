import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obter resumo financeiro
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Calcular datas
    const now = new Date()
    let dateFilter: Date

    switch (period) {
      case 'today':
        dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        dateFilter = new Date(now.getFullYear(), 0, 1)
        break
      case 'month':
      default:
        dateFilter = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const where: any = {
      workspaceId: membership.workspaceId,
      orderedAt: { gte: dateFilter },
    }

    if (startDate && endDate) {
      where.orderedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    // Buscar dados de pedidos
    const ordersStats = await prisma.order.aggregate({
      where: { ...where, status: 'DELIVERED' },
      _sum: { total: true, profit: true, costOfGoods: true, shippingCost: true },
      _count: true,
    })

    // Buscar gastos com ads
    const campaignSpent = await prisma.campaign.aggregate({
      where: { workspaceId: membership.workspaceId },
      _sum: { spent: true },
    })

    // Buscar parceiros ativos
    const partners = await prisma.partner.findMany({
      where: { workspaceId: membership.workspaceId, isActive: true },
    })

    const revenue = ordersStats._sum.total || 0
    const profit = ordersStats._sum.profit || 0
    const costOfGoods = ordersStats._sum.costOfGoods || 0
    const shippingCosts = ordersStats._sum.shippingCost || 0
    const adSpend = campaignSpent._sum.spent || 0
    const deliveredOrders = ordersStats._count

    // Calcular distribuição de lucro por parceiro
    const profitDistribution = partners.map(partner => ({
      id: partner.id,
      name: partner.name,
      type: partner.type,
      percentage: partner.profitPercentage,
      amount: profit * (partner.profitPercentage / 100),
    }))

    const totalDistributed = profitDistribution.reduce((sum, p) => sum + p.amount, 0)
    const netProfit = profit - adSpend

    return NextResponse.json({
      summary: {
        revenue,
        profit,
        netProfit,
        costOfGoods,
        shippingCosts,
        adSpend,
        deliveredOrders,
        roas: adSpend > 0 ? revenue / adSpend : 0,
        profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0,
      },
      profitDistribution,
      totalDistributed,
      retainedProfit: netProfit - totalDistributed,
      period,
    })
  } catch (error) {
    console.error('Erro ao buscar dados financeiros:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados financeiros' }, { status: 500 })
  }
}

// POST - Registrar distribuição de lucro
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true, role: true },
    })

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Buscar role do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!['OWNER', 'MATRIX'].includes(user?.role || '') &&
        !['OWNER'].includes(membership.role || '')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    if (!body.partnerId || !body.amount || !body.period) {
      return NextResponse.json({ error: 'Campos obrigatórios: partnerId, amount, period' }, { status: 400 })
    }

    // Verificar se parceiro existe
    const partner = await prisma.partner.findFirst({
      where: { id: body.partnerId, workspaceId: membership.workspaceId },
    })

    if (!partner) {
      return NextResponse.json({ error: 'Parceiro não encontrado' }, { status: 404 })
    }

    const distribution = await prisma.profitDistribution.create({
      data: {
        partnerId: body.partnerId,
        amount: body.amount,
        period: body.period,
        status: body.status || 'PENDING',
        paidAt: body.status === 'PAID' ? new Date() : null,
        notes: body.notes,
      },
      include: {
        partner: true,
      },
    })

    return NextResponse.json(distribution, { status: 201 })
  } catch (error) {
    console.error('Erro ao registrar distribuição:', error)
    return NextResponse.json({ error: 'Erro ao registrar distribuição' }, { status: 500 })
  }
}
