import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  getAdAccountInsights,
  getAdAccountInsightsByDateRange,
  validateAccessToken,
  convertInsightToSpend,
} from '@/lib/facebook-ads'

// POST - Sincronizar dados do Facebook
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

    const accountId = body.accountId
    const datePreset = body.datePreset || 'today'
    const startDate = body.startDate
    const endDate = body.endDate
    const usdToBrlRate = parseFloat(body.usdToBrlRate) || 5.0

    if (!accountId) {
      return NextResponse.json({ error: 'ID da conta é obrigatório' }, { status: 400 })
    }

    // Verificar se a conta existe e pertence ao workspace
    const account = await prisma.facebookAdAccount.findFirst({
      where: {
        id: accountId,
        workspaceId: membership.workspaceId,
      },
    })

    if (!account) {
      return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 })
    }

    // Verificar se tem token de acesso
    if (!account.accessToken) {
      return NextResponse.json({
        error: 'Token de acesso não configurado',
        message: 'Configure o token de acesso da conta para habilitar a sincronização automática.',
      }, { status: 400 })
    }

    // Validar o token
    const tokenValidation = await validateAccessToken(account.accessToken)
    if (!tokenValidation.valid) {
      return NextResponse.json({
        error: 'Token de acesso inválido ou expirado',
        message: 'Por favor, gere um novo token de acesso no Facebook Business.',
      }, { status: 401 })
    }

    // Buscar insights da API do Facebook
    let insights
    if (startDate && endDate) {
      insights = await getAdAccountInsightsByDateRange(
        account.accessToken,
        account.accountId,
        startDate,
        endDate,
        'account'
      )
    } else {
      insights = await getAdAccountInsights(
        account.accessToken,
        account.accountId,
        datePreset as 'today' | 'yesterday' | 'last_7d' | 'last_30d',
        'account'
      )
    }

    if (!insights) {
      return NextResponse.json({
        error: 'Erro ao buscar dados do Facebook',
        message: 'Não foi possível obter os dados da API. Verifique as permissões do token.',
      }, { status: 500 })
    }

    // Converter e salvar cada insight
    const savedSpends = []
    for (const insight of insights) {
      const spendData = convertInsightToSpend(insight, usdToBrlRate)
      const dateObj = new Date(spendData.date)
      dateObj.setUTCHours(0, 0, 0, 0)

      // Upsert do gasto diário (unique: workspaceId + date + adAccountId + campaignId + adsetId)
      const dailySpend = await prisma.dailyAdSpend.upsert({
        where: {
          workspaceId_date_adAccountId_campaignId_adsetId: {
            workspaceId: membership.workspaceId,
            date: dateObj,
            adAccountId: spendData.adAccountId,
            campaignId: spendData.campaignId || '',
            adsetId: spendData.adsetId || '',
          },
        },
        update: {
          spendUsd: spendData.spendUsd,
          spendBrl: spendData.spendBrl,
          impressions: spendData.impressions,
          clicks: spendData.clicks,
          reach: spendData.reach,
          cpm: spendData.cpm,
          cpc: spendData.cpc,
          ctr: spendData.ctr,
          frequency: spendData.frequency,
          results: spendData.results,
          costPerResult: spendData.costPerResult,
          adAccountName: spendData.adAccountName,
          campaignName: spendData.campaignName,
          adsetName: spendData.adsetName,
        },
        create: {
          workspaceId: membership.workspaceId,
          date: dateObj,
          dateOriginal: new Date(),
          adAccountId: spendData.adAccountId,
          adAccountName: spendData.adAccountName,
          campaignId: spendData.campaignId || '',
          campaignName: spendData.campaignName,
          adsetId: spendData.adsetId || '',
          adsetName: spendData.adsetName,
          spendUsd: spendData.spendUsd,
          spendBrl: spendData.spendBrl,
          impressions: spendData.impressions,
          clicks: spendData.clicks,
          reach: spendData.reach,
          cpm: spendData.cpm,
          cpc: spendData.cpc,
          ctr: spendData.ctr,
          frequency: spendData.frequency,
          results: spendData.results,
          costPerResult: spendData.costPerResult,
        },
      })

      savedSpends.push(dailySpend)
    }

    // Atualizar lastSyncAt da conta
    await prisma.facebookAdAccount.update({
      where: { id: accountId },
      data: { lastSyncAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      message: `Sincronização concluída! ${savedSpends.length} registro(s) atualizado(s).`,
      accountId: account.accountId,
      accountName: account.accountName,
      lastSyncAt: new Date().toISOString(),
      recordsUpdated: savedSpends.length,
      data: savedSpends,
    })
  } catch (error) {
    console.error('Erro ao sincronizar:', error)
    return NextResponse.json({ error: 'Erro ao sincronizar' }, { status: 500 })
  }
}

// GET - Status da última sincronização
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')

    // Buscar workspace do usuário
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })

    if (!membership?.workspaceId) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Buscar contas
    const where: any = {
      workspaceId: membership.workspaceId,
    }

    if (accountId) {
      where.id = accountId
    }

    const accounts = await prisma.facebookAdAccount.findMany({
      where,
      select: {
        id: true,
        accountId: true,
        accountName: true,
        isActive: true,
        lastSyncAt: true,
        timezone: true,
        currency: true,
      },
      orderBy: { accountName: 'asc' },
    })

    // Adicionar status de sincronização
    const accountsWithStatus = accounts.map(account => {
      const hasToken = Boolean(account)
      const lastSync = account.lastSyncAt
      const needsSync = !lastSync || (new Date().getTime() - new Date(lastSync).getTime() > 3600000) // 1 hora

      return {
        ...account,
        syncStatus: {
          hasToken,
          lastSync,
          needsSync,
          status: !hasToken ? 'no_token' : needsSync ? 'needs_sync' : 'synced',
        },
      }
    })

    return NextResponse.json({ data: accountsWithStatus })
  } catch (error) {
    console.error('Erro ao buscar status:', error)
    return NextResponse.json({ error: 'Erro ao buscar status' }, { status: 500 })
  }
}
