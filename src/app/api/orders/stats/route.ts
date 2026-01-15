import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Estatísticas de pedidos para o dashboard
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'
    const countryId = searchParams.get('countryId')

    // Buscar workspace do usuário
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Calcular datas baseado no período
    const now = new Date()
    let startDate: Date
    let previousStartDate: Date
    let previousEndDate: Date

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        previousStartDate = new Date(startDate)
        previousStartDate.setDate(previousStartDate.getDate() - 1)
        previousEndDate = new Date(startDate)
        break
      case 'yesterday':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        previousStartDate = new Date(startDate)
        previousStartDate.setDate(previousStartDate.getDate() - 1)
        previousEndDate = new Date(startDate)
        break
      case 'week':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        previousStartDate = new Date(startDate)
        previousStartDate.setDate(previousStartDate.getDate() - 7)
        previousEndDate = new Date(startDate)
        break
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
        previousEndDate = new Date(startDate)
        break
      case 'max':
        startDate = new Date(2020, 0, 1) // Início de tudo
        previousStartDate = new Date(2019, 0, 1)
        previousEndDate = new Date(2020, 0, 1)
        break
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        previousEndDate = new Date(startDate)
        break
    }

    // Filtro base
    const baseWhere: any = {
      workspaceId: membership.workspaceId,
      orderedAt: { gte: startDate },
    }

    if (countryId) {
      baseWhere.countryId = countryId
    }

    // Filtro para período anterior
    const previousWhere: any = {
      ...baseWhere,
      orderedAt: {
        gte: previousStartDate,
        lt: previousEndDate,
      },
    }

    // Buscar estatísticas atuais
    const [
      ordersAgg,
      deliveredCount,
      inTransitCount,
      returnedCount,
      pendingCount,
      failedCount,
      previousOrdersAgg,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: baseWhere,
        _sum: {
          total: true,
          profit: true,
        },
        _count: true,
        _avg: {
          total: true,
        },
      }),
      prisma.order.count({
        where: { ...baseWhere, deliveryStatus: 'DELIVERED' },
      }),
      prisma.order.count({
        where: { ...baseWhere, deliveryStatus: 'IN_TRANSIT' },
      }),
      prisma.order.count({
        where: { ...baseWhere, deliveryStatus: 'RETURNED' },
      }),
      prisma.order.count({
        where: { ...baseWhere, deliveryStatus: 'PENDING' },
      }),
      prisma.order.count({
        where: { ...baseWhere, deliveryStatus: 'FAILED' },
      }),
      prisma.order.aggregate({
        where: previousWhere,
        _sum: {
          total: true,
          profit: true,
        },
        _count: true,
        _avg: {
          total: true,
        },
      }),
    ])

    const totalOrders = ordersAgg._count || 0
    const revenue = ordersAgg._sum.total || 0
    const profit = ordersAgg._sum.profit || 0
    const avgTicket = ordersAgg._avg.total || 0

    const previousOrders = previousOrdersAgg._count || 0
    const previousRevenue = previousOrdersAgg._sum.total || 0

    // Calcular taxas
    const deliveryRate = totalOrders > 0 ? (deliveredCount / totalOrders) * 100 : 0
    const returnRate = totalOrders > 0 ? (returnedCount / totalOrders) * 100 : 0

    // Calcular variação
    const revenueChange = previousRevenue > 0
      ? ((revenue - previousRevenue) / previousRevenue) * 100
      : revenue > 0 ? 100 : 0

    const ordersChange = previousOrders > 0
      ? ((totalOrders - previousOrders) / previousOrders) * 100
      : totalOrders > 0 ? 100 : 0

    return NextResponse.json({
      revenue,
      profit,
      orders: totalOrders,
      avgTicket,
      deliveryRate: Math.round(deliveryRate * 10) / 10,
      returnRate: Math.round(returnRate * 10) / 10,
      roas: 0, // Será calculado com dados de ads
      visitors: 0, // Será integrado com tracking
      delivered: deliveredCount,
      inTransit: inTransitCount,
      returned: returnedCount,
      pending: pendingCount,
      failed: failedCount,
      total: totalOrders,
      changes: {
        revenue: Math.round(revenueChange * 10) / 10,
        orders: Math.round(ordersChange * 10) / 10,
      },
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 })
  }
}
