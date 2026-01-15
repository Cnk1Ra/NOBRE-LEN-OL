import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obter métricas consolidadas
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
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

    const metrics = await prisma.dailyMetrics.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit,
    })

    // Calcular totais e médias
    const totals = metrics.reduce(
      (acc, metric) => ({
        totalSpendUsd: acc.totalSpendUsd + metric.totalSpendUsd,
        totalSpendBrl: acc.totalSpendBrl + metric.totalSpendBrl,
        totalSales: acc.totalSales + metric.totalSales,
        totalGrossRevenue: acc.totalGrossRevenue + metric.grossRevenue,
        totalNetRevenue: acc.totalNetRevenue + metric.netRevenue,
        totalGrossProfit: acc.totalGrossProfit + metric.grossProfit,
        totalNetProfit: acc.totalNetProfit + metric.netProfit,
      }),
      {
        totalSpendUsd: 0,
        totalSpendBrl: 0,
        totalSales: 0,
        totalGrossRevenue: 0,
        totalNetRevenue: 0,
        totalGrossProfit: 0,
        totalNetProfit: 0,
      }
    )

    // Calcular ROI, ROAS e CPA agregados
    const avgRoi = totals.totalSpendBrl > 0
      ? ((totals.totalGrossProfit / totals.totalSpendBrl) * 100)
      : null
    const avgRoas = totals.totalSpendBrl > 0
      ? (totals.totalGrossRevenue / totals.totalSpendBrl)
      : null
    const avgCpa = totals.totalSales > 0
      ? (totals.totalSpendBrl / totals.totalSales)
      : null

    return NextResponse.json({
      data: metrics,
      totals: {
        ...totals,
        avgRoi,
        avgRoas,
        avgCpa,
        daysCount: metrics.length,
      },
    })
  } catch (error) {
    console.error('Erro ao buscar métricas:', error)
    return NextResponse.json({ error: 'Erro ao buscar métricas' }, { status: 500 })
  }
}

// POST - Calcular e salvar métricas do dia
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

    const usdToBrlRate = body.usdToBrlRate || 5.0
    const totalSpendUsd = body.totalSpendUsd || 0
    const totalSpendBrl = body.totalSpendBrl || (totalSpendUsd * usdToBrlRate)
    const totalSales = body.totalSales || 0
    const grossRevenue = body.grossRevenue || 0
    const netRevenue = body.netRevenue || grossRevenue

    // Calcular lucro
    const grossProfit = grossRevenue - totalSpendBrl
    const netProfit = netRevenue - totalSpendBrl

    // Calcular métricas
    const roi = totalSpendBrl > 0 ? ((grossProfit / totalSpendBrl) * 100) : null
    const roas = totalSpendBrl > 0 ? (grossRevenue / totalSpendBrl) : null
    const cpa = totalSales > 0 ? (totalSpendBrl / totalSales) : null

    // Upsert - criar ou atualizar
    const metric = await prisma.dailyMetrics.upsert({
      where: {
        workspaceId_date: {
          workspaceId: membership.workspaceId,
          date,
        },
      },
      update: {
        totalSpendUsd,
        totalSpendBrl,
        totalSales,
        grossRevenue,
        netRevenue,
        grossProfit,
        netProfit,
        roi,
        roas,
        cpa,
        usdToBrlRate,
      },
      create: {
        workspaceId: membership.workspaceId,
        date,
        totalSpendUsd,
        totalSpendBrl,
        totalSales,
        grossRevenue,
        netRevenue,
        grossProfit,
        netProfit,
        roi,
        roas,
        cpa,
        usdToBrlRate,
      },
    })

    return NextResponse.json(metric, { status: 201 })
  } catch (error) {
    console.error('Erro ao salvar métricas:', error)
    return NextResponse.json({ error: 'Erro ao salvar métricas' }, { status: 500 })
  }
}

// PUT - Recalcular métricas a partir de gastos e vendas
export async function PUT(request: Request) {
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

    if (!body.date) {
      return NextResponse.json({ error: 'Data é obrigatória' }, { status: 400 })
    }

    const date = new Date(body.date)
    date.setUTCHours(0, 0, 0, 0)

    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)

    // Buscar gastos do dia
    const spends = await prisma.dailyAdSpend.findMany({
      where: {
        workspaceId: membership.workspaceId,
        date: {
          gte: date,
          lt: nextDay,
        },
      },
    })

    // Buscar vendas do dia
    const sales = await prisma.dailySales.findMany({
      where: {
        workspaceId: membership.workspaceId,
        date: {
          gte: date,
          lt: nextDay,
        },
      },
    })

    // Calcular totais
    const totalSpendUsd = spends.reduce((acc, s) => acc + s.spendUsd, 0)
    const totalSpendBrl = spends.reduce((acc, s) => acc + s.spendBrl, 0)
    const totalSales = sales.reduce((acc, s) => acc + s.ordersCount, 0)
    const grossRevenue = sales.reduce((acc, s) => acc + s.grossRevenue, 0)
    const netRevenue = sales.reduce((acc, s) => acc + s.netRevenue, 0)

    const usdToBrlRate = body.usdToBrlRate || (totalSpendUsd > 0 ? totalSpendBrl / totalSpendUsd : 5.0)

    // Calcular lucro
    const grossProfit = grossRevenue - totalSpendBrl
    const netProfit = netRevenue - totalSpendBrl

    // Calcular métricas
    const roi = totalSpendBrl > 0 ? ((grossProfit / totalSpendBrl) * 100) : null
    const roas = totalSpendBrl > 0 ? (grossRevenue / totalSpendBrl) : null
    const cpa = totalSales > 0 ? (totalSpendBrl / totalSales) : null

    // Upsert - criar ou atualizar
    const metric = await prisma.dailyMetrics.upsert({
      where: {
        workspaceId_date: {
          workspaceId: membership.workspaceId,
          date,
        },
      },
      update: {
        totalSpendUsd,
        totalSpendBrl,
        totalSales,
        grossRevenue,
        netRevenue,
        grossProfit,
        netProfit,
        roi,
        roas,
        cpa,
        usdToBrlRate,
      },
      create: {
        workspaceId: membership.workspaceId,
        date,
        totalSpendUsd,
        totalSpendBrl,
        totalSales,
        grossRevenue,
        netRevenue,
        grossProfit,
        netProfit,
        roi,
        roas,
        cpa,
        usdToBrlRate,
      },
    })

    return NextResponse.json({
      metric,
      sources: {
        spendsCount: spends.length,
        salesCount: sales.length,
      },
    })
  } catch (error) {
    console.error('Erro ao recalcular métricas:', error)
    return NextResponse.json({ error: 'Erro ao recalcular métricas' }, { status: 500 })
  }
}
