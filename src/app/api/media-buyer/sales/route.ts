import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Listar vendas diárias
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const source = searchParams.get('source')
    const limit = parseInt(searchParams.get('limit') || '30')

    // Buscar workspace do usuário
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Construir filtros
    const where: any = {
      workspaceId: membership.workspaceId,
    }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    if (source) where.source = source

    const sales = await prisma.dailySales.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit,
    })

    // Calcular totais
    const totals = sales.reduce(
      (acc, sale) => ({
        totalOrders: acc.totalOrders + sale.ordersCount,
        totalGrossRevenue: acc.totalGrossRevenue + sale.grossRevenue,
        totalNetRevenue: acc.totalNetRevenue + sale.netRevenue,
        totalRefunds: acc.totalRefunds + sale.refunds,
        totalChargebacks: acc.totalChargebacks + sale.chargebacks,
      }),
      { totalOrders: 0, totalGrossRevenue: 0, totalNetRevenue: 0, totalRefunds: 0, totalChargebacks: 0 }
    )

    // Calcular ticket médio geral
    const averageTicket = totals.totalOrders > 0 ? totals.totalGrossRevenue / totals.totalOrders : 0

    return NextResponse.json({
      data: sales,
      totals: { ...totals, averageTicket },
    })
  } catch (error) {
    console.error('Erro ao buscar vendas:', error)
    return NextResponse.json({ error: 'Erro ao buscar vendas' }, { status: 500 })
  }
}

// POST - Criar/atualizar venda diária
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()

    // Buscar workspace do usuário
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Validar campos obrigatórios
    if (!body.date) {
      return NextResponse.json({ error: 'Data é obrigatória' }, { status: 400 })
    }

    const date = new Date(body.date)
    date.setUTCHours(0, 0, 0, 0)

    const source = body.source || 'manual'

    // Calcular ticket médio
    const ordersCount = body.ordersCount || 0
    const grossRevenue = body.grossRevenue || 0
    const averageTicket = ordersCount > 0 ? grossRevenue / ordersCount : 0

    // Upsert - criar ou atualizar
    const sale = await prisma.dailySales.upsert({
      where: {
        workspaceId_date_source: {
          workspaceId: membership.workspaceId,
          date,
          source,
        },
      },
      update: {
        ordersCount,
        averageTicket,
        grossRevenue,
        netRevenue: body.netRevenue || 0,
        refunds: body.refunds || 0,
        chargebacks: body.chargebacks || 0,
        notes: body.notes,
      },
      create: {
        workspaceId: membership.workspaceId,
        date,
        source,
        ordersCount,
        averageTicket,
        grossRevenue,
        netRevenue: body.netRevenue || 0,
        refunds: body.refunds || 0,
        chargebacks: body.chargebacks || 0,
        notes: body.notes,
      },
    })

    return NextResponse.json(sale, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar venda:', error)
    return NextResponse.json({ error: 'Erro ao criar venda' }, { status: 500 })
  }
}

// DELETE - Remover venda
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    // Buscar workspace do usuário
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Verificar se a venda pertence ao workspace
    const sale = await prisma.dailySales.findFirst({
      where: { id, workspaceId: membership.workspaceId },
    })

    if (!sale) {
      return NextResponse.json({ error: 'Venda não encontrada' }, { status: 404 })
    }

    await prisma.dailySales.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao remover venda:', error)
    return NextResponse.json({ error: 'Erro ao remover venda' }, { status: 500 })
  }
}
