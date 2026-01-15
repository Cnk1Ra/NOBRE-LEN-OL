import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Listar gastos diários
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const adAccountId = searchParams.get('adAccountId')
    const campaignId = searchParams.get('campaignId')
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

    if (adAccountId) where.adAccountId = adAccountId
    if (campaignId) where.campaignId = campaignId

    const spends = await prisma.dailyAdSpend.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit,
    })

    // Calcular totais
    const totals = spends.reduce(
      (acc, spend) => ({
        totalSpendUsd: acc.totalSpendUsd + spend.spendUsd,
        totalSpendBrl: acc.totalSpendBrl + spend.spendBrl,
        totalClicks: acc.totalClicks + spend.clicks,
        totalImpressions: acc.totalImpressions + spend.impressions,
        totalResults: acc.totalResults + spend.results,
      }),
      { totalSpendUsd: 0, totalSpendBrl: 0, totalClicks: 0, totalImpressions: 0, totalResults: 0 }
    )

    return NextResponse.json({
      data: spends,
      totals,
    })
  } catch (error) {
    console.error('Erro ao buscar gastos:', error)
    return NextResponse.json({ error: 'Erro ao buscar gastos' }, { status: 500 })
  }
}

// POST - Criar/atualizar gasto diário
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

    if (!body.adAccountId) {
      return NextResponse.json({ error: 'ID da conta de anúncios é obrigatório' }, { status: 400 })
    }

    const date = new Date(body.date)
    date.setUTCHours(0, 0, 0, 0)

    // Calcular métricas derivadas
    const cpm = body.impressions > 0 ? (body.spendUsd / body.impressions) * 1000 : null
    const cpc = body.clicks > 0 ? body.spendUsd / body.clicks : null
    const ctr = body.impressions > 0 ? (body.clicks / body.impressions) * 100 : null
    const costPerResult = body.results > 0 ? body.spendUsd / body.results : null
    const frequency = body.reach > 0 ? body.impressions / body.reach : null

    // Upsert - criar ou atualizar
    const spend = await prisma.dailyAdSpend.upsert({
      where: {
        workspaceId_date_adAccountId_campaignId_adsetId: {
          workspaceId: membership.workspaceId,
          date,
          adAccountId: body.adAccountId,
          campaignId: body.campaignId || '',
          adsetId: body.adsetId || '',
        },
      },
      update: {
        adAccountName: body.adAccountName,
        campaignName: body.campaignName,
        adsetName: body.adsetName,
        spendUsd: body.spendUsd || 0,
        spendBrl: body.spendBrl || 0,
        impressions: body.impressions || 0,
        clicks: body.clicks || 0,
        cpm,
        cpc,
        ctr,
        results: body.results || 0,
        costPerResult,
        reach: body.reach || 0,
        frequency,
        dateOriginal: body.dateOriginal ? new Date(body.dateOriginal) : date,
      },
      create: {
        workspaceId: membership.workspaceId,
        date,
        dateOriginal: body.dateOriginal ? new Date(body.dateOriginal) : date,
        adAccountId: body.adAccountId,
        adAccountName: body.adAccountName,
        campaignId: body.campaignId || '',
        campaignName: body.campaignName,
        adsetId: body.adsetId || '',
        adsetName: body.adsetName,
        spendUsd: body.spendUsd || 0,
        spendBrl: body.spendBrl || 0,
        impressions: body.impressions || 0,
        clicks: body.clicks || 0,
        cpm,
        cpc,
        ctr,
        results: body.results || 0,
        costPerResult,
        reach: body.reach || 0,
        frequency,
      },
    })

    return NextResponse.json(spend, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar gasto:', error)
    return NextResponse.json({ error: 'Erro ao criar gasto' }, { status: 500 })
  }
}

// DELETE - Remover gasto
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

    // Verificar se o gasto pertence ao workspace
    const spend = await prisma.dailyAdSpend.findFirst({
      where: { id, workspaceId: membership.workspaceId },
    })

    if (!spend) {
      return NextResponse.json({ error: 'Gasto não encontrado' }, { status: 404 })
    }

    await prisma.dailyAdSpend.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao remover gasto:', error)
    return NextResponse.json({ error: 'Erro ao remover gasto' }, { status: 500 })
  }
}
