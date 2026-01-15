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
        // USD
        totalGrossRevenueUsd: acc.totalGrossRevenueUsd + (metric.grossRevenueUsd || 0),
        totalNetRevenueUsd: acc.totalNetRevenueUsd + (metric.netRevenueUsd || 0),
        totalGrossProfitUsd: acc.totalGrossProfitUsd + (metric.grossProfitUsd || 0),
        totalNetProfitUsd: acc.totalNetProfitUsd + (metric.netProfitUsd || 0),
        // BRL
        totalGrossRevenue: acc.totalGrossRevenue + metric.grossRevenue,
        totalNetRevenue: acc.totalNetRevenue + metric.netRevenue,
        totalGrossProfit: acc.totalGrossProfit + metric.grossProfit,
        totalNetProfit: acc.totalNetProfit + metric.netProfit,
      }),
      {
        totalSpendUsd: 0,
        totalSpendBrl: 0,
        totalSales: 0,
        totalGrossRevenueUsd: 0,
        totalNetRevenueUsd: 0,
        totalGrossProfitUsd: 0,
        totalNetProfitUsd: 0,
        totalGrossRevenue: 0,
        totalNetRevenue: 0,
        totalGrossProfit: 0,
        totalNetProfit: 0,
      }
    )

    // Calcular ROI, ROAS e CPA agregados (em BRL)
    const avgRoi = totals.totalSpendBrl > 0
      ? ((totals.totalGrossProfit / totals.totalSpendBrl) * 100)
      : null
    const avgRoas = totals.totalSpendBrl > 0
      ? (totals.totalGrossRevenue / totals.totalSpendBrl)
      : null
    const avgCpa = totals.totalSales > 0
      ? (totals.totalSpendBrl / totals.totalSales)
      : null
    const avgCpaUsd = totals.totalSales > 0
      ? (totals.totalSpendUsd / totals.totalSales)
      : null

    return NextResponse.json({
      data: metrics,
      totals: {
        ...totals,
        avgRoi,
        avgRoas,
        avgCpa,
        avgCpaUsd,
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

    const usdToBrlRate = parseFloat(body.usdToBrlRate) || 5.0
    const totalSpendUsd = parseFloat(body.totalSpendUsd) || 0
    const totalSpendBrl = totalSpendUsd * usdToBrlRate
    const totalSales = parseInt(body.totalSales) || 0

    // Valores em USD (moeda base)
    const grossRevenueUsd = parseFloat(body.grossRevenueUsd) || 0
    const netRevenueUsd = parseFloat(body.netRevenueUsd) || grossRevenueUsd

    // Converter para BRL
    const grossRevenue = grossRevenueUsd * usdToBrlRate
    const netRevenue = netRevenueUsd * usdToBrlRate

    // Calcular lucro em USD
    const grossProfitUsd = grossRevenueUsd - totalSpendUsd
    const netProfitUsd = netRevenueUsd - totalSpendUsd

    // Calcular lucro em BRL
    const grossProfit = grossRevenue - totalSpendBrl
    const netProfit = netRevenue - totalSpendBrl

    // Calcular métricas (baseadas em USD)
    const roi = totalSpendUsd > 0 ? ((grossProfitUsd / totalSpendUsd) * 100) : null
    const roas = totalSpendUsd > 0 ? (grossRevenueUsd / totalSpendUsd) : null
    const cpa = totalSales > 0 ? (totalSpendBrl / totalSales) : null
    const cpaUsd = totalSales > 0 ? (totalSpendUsd / totalSales) : null

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
        grossRevenueUsd,
        netRevenueUsd,
        grossProfitUsd,
        netProfitUsd,
        grossRevenue,
        netRevenue,
        grossProfit,
        netProfit,
        roi,
        roas,
        cpa,
        cpaUsd,
        usdToBrlRate,
      },
      create: {
        workspaceId: membership.workspaceId,
        date,
        totalSpendUsd,
        totalSpendBrl,
        totalSales,
        grossRevenueUsd,
        netRevenueUsd,
        grossProfitUsd,
        netProfitUsd,
        grossRevenue,
        netRevenue,
        grossProfit,
        netProfit,
        roi,
        roas,
        cpa,
        cpaUsd,
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

    // Calcular valores em USD
    const grossRevenueUsd = grossRevenue / usdToBrlRate
    const netRevenueUsd = netRevenue / usdToBrlRate
    const grossProfitUsd = grossRevenueUsd - totalSpendUsd
    const netProfitUsd = netRevenueUsd - totalSpendUsd

    // Calcular lucro em BRL
    const grossProfit = grossRevenue - totalSpendBrl
    const netProfit = netRevenue - totalSpendBrl

    // Calcular métricas
    const roi = totalSpendUsd > 0 ? ((grossProfitUsd / totalSpendUsd) * 100) : null
    const roas = totalSpendUsd > 0 ? (grossRevenueUsd / totalSpendUsd) : null
    const cpa = totalSales > 0 ? (totalSpendBrl / totalSales) : null
    const cpaUsd = totalSales > 0 ? (totalSpendUsd / totalSales) : null

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
        grossRevenueUsd,
        netRevenueUsd,
        grossProfitUsd,
        netProfitUsd,
        grossRevenue,
        netRevenue,
        grossProfit,
        netProfit,
        roi,
        roas,
        cpa,
        cpaUsd,
        usdToBrlRate,
      },
      create: {
        workspaceId: membership.workspaceId,
        date,
        totalSpendUsd,
        totalSpendBrl,
        totalSales,
        grossRevenueUsd,
        netRevenueUsd,
        grossProfitUsd,
        netProfitUsd,
        grossRevenue,
        netRevenue,
        grossProfit,
        netProfit,
        roi,
        roas,
        cpa,
        cpaUsd,
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
