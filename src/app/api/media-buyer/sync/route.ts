import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  getAdAccountInsights,
  getAdAccountInsightsByDateRange,
  getHourlyAdAccountInsights,
  validateAccessToken,
  convertInsightToSpend,
  convertHourlyInsightToSpend,
} from '@/lib/facebook-ads'
import {
  getPtDateRangeForBrtRange,
  convertPtDateTimeToBrt,
  regroupHourlyDataByBrtDay,
  getPtBrtOffset,
  type HourlySpendData,
} from '@/lib/timezone'
import { format, subDays } from 'date-fns'

/**
 * Calcular datas BRT baseado no preset
 */
function getDateRangeFromPreset(preset: string): { startBrt: string; endBrt: string } {
  const today = new Date()
  const formatDate = (d: Date) => format(d, 'yyyy-MM-dd')

  switch (preset) {
    case 'today':
      return { startBrt: formatDate(today), endBrt: formatDate(today) }
    case 'yesterday':
      const yesterday = subDays(today, 1)
      return { startBrt: formatDate(yesterday), endBrt: formatDate(yesterday) }
    case 'last_7d':
      return { startBrt: formatDate(subDays(today, 6)), endBrt: formatDate(today) }
    case 'last_30d':
      return { startBrt: formatDate(subDays(today, 29)), endBrt: formatDate(today) }
    default:
      return { startBrt: formatDate(today), endBrt: formatDate(today) }
  }
}

// POST - Sincronizar dados do Facebook com correção de timezone
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
    const startDateBrt = body.startDate // Data em BRT (São Paulo)
    const endDateBrt = body.endDate     // Data em BRT (São Paulo)
    const usdToBrlRate = parseFloat(body.usdToBrlRate) || 5.0
    const useTimezoneCorrection = body.useTimezoneCorrection !== false // Default: true

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

    // Determinar range de datas BRT
    let finalStartBrt: string
    let finalEndBrt: string

    if (startDateBrt && endDateBrt) {
      finalStartBrt = startDateBrt
      finalEndBrt = endDateBrt
    } else {
      const { startBrt, endBrt } = getDateRangeFromPreset(datePreset)
      finalStartBrt = startBrt
      finalEndBrt = endBrt
    }

    // Verificar se a conta está em PT (Los Angeles) - requer conversão
    const needsTimezoneConversion = useTimezoneCorrection &&
      account.timezone === 'America/Los_Angeles'

    let savedSpends: any[] = []
    let savedHourly: any[] = []
    let timezoneInfo = {
      accountTimezone: account.timezone,
      targetTimezone: 'America/Sao_Paulo',
      offset: 5,
      isDst: false,
      converted: false,
    }

    if (needsTimezoneConversion) {
      // ========== MODO COM CONVERSÃO DE TIMEZONE (PT -> BRT) ==========
      console.log('Usando conversão de timezone PT -> BRT')

      // Calcular quais datas PT são necessárias para cobrir o range BRT
      const { ptStart, ptEnd } = getPtDateRangeForBrtRange(finalStartBrt, finalEndBrt)
      console.log(`Range BRT: ${finalStartBrt} a ${finalEndBrt}`)
      console.log(`Range PT necessário: ${ptStart} a ${ptEnd}`)

      // Buscar dados HORÁRIOS do Facebook
      const hourlyInsights = await getHourlyAdAccountInsights(
        account.accessToken,
        account.accountId,
        ptStart,
        ptEnd,
        'account'
      )

      if (!hourlyInsights) {
        return NextResponse.json({
          error: 'Erro ao buscar dados horários do Facebook',
          message: 'Não foi possível obter os dados horários. Verifique as permissões do token.',
        }, { status: 500 })
      }

      console.log(`Recebidos ${hourlyInsights.length} registros horários`)

      // Converter cada insight horário
      const hourlySpendData: HourlySpendData[] = []

      for (const insight of hourlyInsights) {
        const converted = convertHourlyInsightToSpend(insight, usdToBrlRate)
        const { brtDateTime, brtDateStr, hourBrt, offset, isDst } = convertPtDateTimeToBrt(
          converted.dateTimePt
        )

        // Salvar dados horários para auditoria
        const hourlyRecord = await prisma.hourlyAdSpend.upsert({
          where: {
            workspaceId_dateTimePt_adAccountId_campaignId_adsetId: {
              workspaceId: membership.workspaceId,
              dateTimePt: converted.dateTimePt,
              adAccountId: converted.adAccountId,
              campaignId: converted.campaignId,
              adsetId: converted.adsetId,
            },
          },
          update: {
            dateTimeBrt: brtDateTime,
            dateBrt: new Date(brtDateStr),
            hourPt: converted.hourPt,
            hourBrt,
            spendUsd: converted.spendUsd,
            spendBrl: converted.spendBrl,
            impressions: converted.impressions,
            clicks: converted.clicks,
            reach: converted.reach,
            results: converted.results,
            timezoneOffset: offset,
            adAccountName: converted.adAccountName,
            campaignName: converted.campaignName,
            adsetName: converted.adsetName,
          },
          create: {
            workspaceId: membership.workspaceId,
            dateTimePt: converted.dateTimePt,
            dateTimeBrt: brtDateTime,
            dateBrt: new Date(brtDateStr),
            hourPt: converted.hourPt,
            hourBrt,
            adAccountId: converted.adAccountId,
            adAccountName: converted.adAccountName,
            campaignId: converted.campaignId,
            campaignName: converted.campaignName,
            adsetId: converted.adsetId,
            adsetName: converted.adsetName,
            spendUsd: converted.spendUsd,
            spendBrl: converted.spendBrl,
            impressions: converted.impressions,
            clicks: converted.clicks,
            reach: converted.reach,
            results: converted.results,
            timezoneOffset: offset,
          },
        })

        savedHourly.push(hourlyRecord)

        // Adicionar ao array para agregação
        hourlySpendData.push({
          dateTimePt: converted.dateTimePt,
          dateTimeBrt: brtDateTime,
          dateBrt: brtDateStr,
          hourPt: converted.hourPt,
          hourBrt,
          spendUsd: converted.spendUsd,
          spendBrl: converted.spendBrl,
          impressions: converted.impressions,
          clicks: converted.clicks,
          reach: converted.reach,
          results: converted.results,
          adAccountId: converted.adAccountId,
          adAccountName: converted.adAccountName,
          campaignId: converted.campaignId,
          campaignName: converted.campaignName,
          adsetId: converted.adsetId,
          adsetName: converted.adsetName,
        })
      }

      // Agrupar por dia BRT
      const dailyDataByBrt = regroupHourlyDataByBrtDay(hourlySpendData)
      console.log(`Agrupados em ${dailyDataByBrt.size} dias BRT`)

      // Obter offset atual para info
      const currentOffset = getPtBrtOffset(new Date())
      timezoneInfo.offset = currentOffset.offset
      timezoneInfo.isDst = currentOffset.isDst
      timezoneInfo.converted = true

      // Salvar dados diários agregados (filtrar apenas o range solicitado)
      for (const [brtDateStr, dayData] of Array.from(dailyDataByBrt.entries())) {
        // Filtrar apenas datas dentro do range solicitado
        if (brtDateStr < finalStartBrt || brtDateStr > finalEndBrt) {
          console.log(`Ignorando ${brtDateStr} (fora do range ${finalStartBrt} - ${finalEndBrt})`)
          continue
        }

        const dateObj = new Date(brtDateStr + 'T12:00:00') // Meio-dia para evitar problemas de timezone
        dateObj.setUTCHours(0, 0, 0, 0)

        // Calcular métricas derivadas
        const cpm = dayData.totalImpressions > 0
          ? (dayData.totalSpendUsd / dayData.totalImpressions) * 1000
          : null
        const cpc = dayData.totalClicks > 0
          ? dayData.totalSpendUsd / dayData.totalClicks
          : null
        const ctr = dayData.totalImpressions > 0
          ? (dayData.totalClicks / dayData.totalImpressions) * 100
          : null
        const costPerResult = dayData.totalResults > 0
          ? dayData.totalSpendUsd / dayData.totalResults
          : null

        const dailySpend = await prisma.dailyAdSpend.upsert({
          where: {
            workspaceId_date_adAccountId_campaignId_adsetId: {
              workspaceId: membership.workspaceId,
              date: dateObj,
              adAccountId: account.accountId.startsWith('act_')
                ? account.accountId
                : `act_${account.accountId}`,
              campaignId: '',
              adsetId: '',
            },
          },
          update: {
            spendUsd: dayData.totalSpendUsd,
            spendBrl: dayData.totalSpendBrl,
            impressions: dayData.totalImpressions,
            clicks: dayData.totalClicks,
            reach: dayData.totalReach,
            results: dayData.totalResults,
            cpm,
            cpc,
            ctr,
            costPerResult,
            timezoneOffset: dayData.offset,
            isDstActive: dayData.isDst,
            syncedAt: new Date(),
            adAccountName: account.accountName,
          },
          create: {
            workspaceId: membership.workspaceId,
            date: dateObj,
            dateOriginal: new Date(),
            adAccountId: account.accountId.startsWith('act_')
              ? account.accountId
              : `act_${account.accountId}`,
            adAccountName: account.accountName,
            campaignId: '',
            campaignName: null,
            adsetId: '',
            adsetName: null,
            spendUsd: dayData.totalSpendUsd,
            spendBrl: dayData.totalSpendBrl,
            impressions: dayData.totalImpressions,
            clicks: dayData.totalClicks,
            reach: dayData.totalReach,
            results: dayData.totalResults,
            cpm,
            cpc,
            ctr,
            costPerResult,
            timezoneOffset: dayData.offset,
            isDstActive: dayData.isDst,
            syncedAt: new Date(),
          },
        })

        savedSpends.push(dailySpend)

        // Atualizar DailyMetrics
        await updateDailyMetrics(
          membership.workspaceId,
          dateObj,
          dayData.totalSpendUsd,
          dayData.totalSpendBrl,
          usdToBrlRate
        )
      }
    } else {
      // ========== MODO SEM CONVERSÃO (dados diários diretos) ==========
      console.log('Usando dados diários sem conversão de timezone')

      let insights
      if (startDateBrt && endDateBrt) {
        insights = await getAdAccountInsightsByDateRange(
          account.accessToken,
          account.accountId,
          startDateBrt,
          endDateBrt,
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

      // Processar dados diários (modo legado)
      for (const insight of insights) {
        const spendData = convertInsightToSpend(insight, usdToBrlRate)
        const dateObj = new Date(spendData.date)
        dateObj.setUTCHours(0, 0, 0, 0)

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
            syncedAt: new Date(),
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
            syncedAt: new Date(),
          },
        })

        savedSpends.push(dailySpend)

        // Atualizar DailyMetrics
        await updateDailyMetrics(
          membership.workspaceId,
          dateObj,
          spendData.spendUsd,
          spendData.spendBrl,
          usdToBrlRate
        )
      }
    }

    // Atualizar lastSyncAt da conta
    await prisma.facebookAdAccount.update({
      where: { id: accountId },
      data: { lastSyncAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      message: needsTimezoneConversion
        ? `Sincronização com correção de timezone concluída! ${savedSpends.length} dia(s) em BRT.`
        : `Sincronização concluída! ${savedSpends.length} registro(s) de gasto.`,
      accountId: account.accountId,
      accountName: account.accountName,
      lastSyncAt: new Date().toISOString(),
      recordsUpdated: savedSpends.length,
      hourlyRecords: savedHourly.length,
      datesUpdated: savedSpends.map(s => format(new Date(s.date), 'yyyy-MM-dd')),
      timezone: timezoneInfo,
      data: savedSpends,
    })
  } catch (error) {
    console.error('Erro ao sincronizar:', error)
    return NextResponse.json({ error: 'Erro ao sincronizar' }, { status: 500 })
  }
}

/**
 * Função auxiliar para atualizar DailyMetrics
 */
async function updateDailyMetrics(
  workspaceId: string,
  dateObj: Date,
  totalSpendUsd: number,
  totalSpendBrl: number,
  usdToBrlRate: number
) {
  // Buscar métricas existentes para manter vendas/receita se já existirem
  const existingMetric = await prisma.dailyMetrics.findUnique({
    where: {
      workspaceId_date: {
        workspaceId,
        date: dateObj,
      },
    },
  })

  const grossRevenueUsd = existingMetric?.grossRevenueUsd || 0
  const netRevenueUsd = existingMetric?.netRevenueUsd || 0
  const totalSales = existingMetric?.totalSales || 0

  const grossRevenue = grossRevenueUsd * usdToBrlRate
  const netRevenue = netRevenueUsd * usdToBrlRate
  const grossProfitUsd = grossRevenueUsd - totalSpendUsd
  const netProfitUsd = netRevenueUsd - totalSpendUsd
  const grossProfit = grossRevenue - totalSpendBrl
  const netProfit = netRevenue - totalSpendBrl

  const roi = totalSpendUsd > 0 ? ((grossProfitUsd / totalSpendUsd) * 100) : null
  const roas = totalSpendUsd > 0 ? (grossRevenueUsd / totalSpendUsd) : null
  const cpa = totalSales > 0 ? (totalSpendBrl / totalSales) : null
  const cpaUsd = totalSales > 0 ? (totalSpendUsd / totalSales) : null

  await prisma.dailyMetrics.upsert({
    where: {
      workspaceId_date: {
        workspaceId,
        date: dateObj,
      },
    },
    update: {
      totalSpendUsd,
      totalSpendBrl,
      grossProfitUsd,
      netProfitUsd,
      grossProfit,
      netProfit,
      roi,
      roas,
      cpa,
      cpaUsd,
      usdToBrlRate,
    },
    create: {
      workspaceId,
      date: dateObj,
      totalSpendUsd,
      totalSpendBrl,
      totalSales: 0,
      grossRevenueUsd: 0,
      netRevenueUsd: 0,
      grossProfitUsd: -totalSpendUsd,
      netProfitUsd: -totalSpendUsd,
      grossRevenue: 0,
      netRevenue: 0,
      grossProfit: -totalSpendBrl,
      netProfit: -totalSpendBrl,
      roi: null,
      roas: null,
      cpa: null,
      cpaUsd: null,
      usdToBrlRate,
    },
  })
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
