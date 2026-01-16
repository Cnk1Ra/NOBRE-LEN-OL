/**
 * Facebook Ads API Integration
 *
 * Integração com a API do Facebook Marketing para buscar dados de gastos
 *
 * Documentação: https://developers.facebook.com/docs/marketing-api/
 */

const FACEBOOK_GRAPH_API_VERSION = 'v18.0'
const FACEBOOK_GRAPH_API_BASE = `https://graph.facebook.com/${FACEBOOK_GRAPH_API_VERSION}`

export interface FacebookAdInsight {
  date_start: string
  date_stop: string
  account_id: string
  account_name?: string
  campaign_id?: string
  campaign_name?: string
  adset_id?: string
  adset_name?: string
  ad_id?: string
  ad_name?: string
  spend: string
  impressions: string
  clicks: string
  reach: string
  frequency?: string
  cpm?: string
  cpc?: string
  ctr?: string
  actions?: Array<{ action_type: string; value: string }>
  cost_per_action_type?: Array<{ action_type: string; value: string }>
}

export interface FacebookAdAccount {
  id: string
  account_id: string
  name: string
  currency: string
  timezone_name: string
  account_status: number
  spend_cap?: string
  amount_spent?: string
}

export interface FacebookApiError {
  error: {
    message: string
    type: string
    code: number
    error_subcode?: number
    fbtrace_id?: string
  }
}

/**
 * Buscar insights de gastos de uma conta de anúncios
 */
export async function getAdAccountInsights(
  accessToken: string,
  adAccountId: string,
  datePreset: 'today' | 'yesterday' | 'last_7d' | 'last_30d' = 'today',
  level: 'account' | 'campaign' | 'adset' | 'ad' = 'account'
): Promise<FacebookAdInsight[] | null> {
  try {
    // Garantir que o ID começa com act_
    const accountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`

    const fields = [
      'account_id',
      'account_name',
      'campaign_id',
      'campaign_name',
      'adset_id',
      'adset_name',
      'spend',
      'impressions',
      'clicks',
      'reach',
      'frequency',
      'cpm',
      'cpc',
      'ctr',
      'actions',
      'cost_per_action_type',
    ].join(',')

    const url = `${FACEBOOK_GRAPH_API_BASE}/${accountId}/insights?` +
      `fields=${fields}&` +
      `date_preset=${datePreset}&` +
      `level=${level}&` +
      `time_increment=1&` + // Dados diários
      `access_token=${accessToken}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.error) {
      console.error('Facebook API Error:', data.error)
      return null
    }

    return data.data || []
  } catch (error) {
    console.error('Error fetching Facebook insights:', error)
    return null
  }
}

/**
 * Buscar insights com datas específicas
 */
export async function getAdAccountInsightsByDateRange(
  accessToken: string,
  adAccountId: string,
  startDate: string, // YYYY-MM-DD
  endDate: string,   // YYYY-MM-DD
  level: 'account' | 'campaign' | 'adset' | 'ad' = 'account'
): Promise<FacebookAdInsight[] | null> {
  try {
    const accountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`

    const fields = [
      'account_id',
      'account_name',
      'campaign_id',
      'campaign_name',
      'adset_id',
      'adset_name',
      'spend',
      'impressions',
      'clicks',
      'reach',
      'frequency',
      'cpm',
      'cpc',
      'ctr',
      'actions',
      'cost_per_action_type',
    ].join(',')

    const timeRange = JSON.stringify({
      since: startDate,
      until: endDate,
    })

    const url = `${FACEBOOK_GRAPH_API_BASE}/${accountId}/insights?` +
      `fields=${fields}&` +
      `time_range=${encodeURIComponent(timeRange)}&` +
      `level=${level}&` +
      `time_increment=1&` +
      `access_token=${accessToken}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.error) {
      console.error('Facebook API Error:', data.error)
      return null
    }

    return data.data || []
  } catch (error) {
    console.error('Error fetching Facebook insights:', error)
    return null
  }
}

/**
 * Buscar lista de contas de anúncios do usuário
 */
export async function getAdAccounts(
  accessToken: string
): Promise<FacebookAdAccount[] | null> {
  try {
    const url = `${FACEBOOK_GRAPH_API_BASE}/me/adaccounts?` +
      `fields=id,account_id,name,currency,timezone_name,account_status,spend_cap,amount_spent&` +
      `access_token=${accessToken}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.error) {
      console.error('Facebook API Error:', data.error)
      return null
    }

    return data.data || []
  } catch (error) {
    console.error('Error fetching ad accounts:', error)
    return null
  }
}

/**
 * Validar token de acesso
 */
export async function validateAccessToken(
  accessToken: string
): Promise<{ valid: boolean; appId?: string; userId?: string; expiresAt?: number }> {
  try {
    const url = `${FACEBOOK_GRAPH_API_BASE}/debug_token?` +
      `input_token=${accessToken}&` +
      `access_token=${accessToken}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.error || !data.data?.is_valid) {
      return { valid: false }
    }

    return {
      valid: true,
      appId: data.data.app_id,
      userId: data.data.user_id,
      expiresAt: data.data.expires_at,
    }
  } catch (error) {
    console.error('Error validating token:', error)
    return { valid: false }
  }
}

/**
 * Extrair resultados (conversões) dos dados de actions
 */
export function extractResults(actions?: Array<{ action_type: string; value: string }>): number {
  if (!actions) return 0

  // Prioridade de tipos de ação para considerar como "resultado"
  const resultTypes = [
    'purchase',
    'omni_purchase',
    'lead',
    'complete_registration',
    'add_to_cart',
    'initiate_checkout',
  ]

  for (const type of resultTypes) {
    const action = actions.find(a => a.action_type === type)
    if (action) {
      return parseInt(action.value) || 0
    }
  }

  return 0
}

/**
 * Extrair custo por resultado
 */
export function extractCostPerResult(
  costPerAction?: Array<{ action_type: string; value: string }>
): number | null {
  if (!costPerAction) return null

  const resultTypes = [
    'purchase',
    'omni_purchase',
    'lead',
    'complete_registration',
  ]

  for (const type of resultTypes) {
    const cost = costPerAction.find(a => a.action_type === type)
    if (cost) {
      return parseFloat(cost.value) || null
    }
  }

  return null
}

/**
 * Converter insight do Facebook para formato do banco de dados
 */
export function convertInsightToSpend(insight: FacebookAdInsight, usdToBrlRate: number = 5.0) {
  const spendUsd = parseFloat(insight.spend) || 0
  const spendBrl = spendUsd * usdToBrlRate
  const impressions = parseInt(insight.impressions) || 0
  const clicks = parseInt(insight.clicks) || 0
  const reach = parseInt(insight.reach) || 0

  return {
    date: insight.date_start,
    adAccountId: insight.account_id.startsWith('act_')
      ? insight.account_id
      : `act_${insight.account_id}`,
    adAccountName: insight.account_name,
    campaignId: insight.campaign_id,
    campaignName: insight.campaign_name,
    adsetId: insight.adset_id,
    adsetName: insight.adset_name,
    spendUsd,
    spendBrl,
    impressions,
    clicks,
    reach,
    cpm: parseFloat(insight.cpm || '0') || null,
    cpc: parseFloat(insight.cpc || '0') || null,
    ctr: parseFloat(insight.ctr || '0') || null,
    frequency: parseFloat(insight.frequency || '0') || null,
    results: extractResults(insight.actions),
    costPerResult: extractCostPerResult(insight.cost_per_action_type),
  }
}

// ==================== FUNÇÕES PARA DADOS HORÁRIOS ====================

/**
 * Interface para insight horário do Facebook
 * Inclui o campo de breakdown por hora
 */
export interface FacebookHourlyInsight extends FacebookAdInsight {
  hourly_stats_aggregated_by_advertiser_time_zone?: string // Formato: "00:00:00 - 00:59:59"
}

/**
 * Buscar insights HORÁRIOS de uma conta de anúncios
 * Usado para correção de timezone (PT -> BRT)
 *
 * @param accessToken - Token de acesso do Facebook
 * @param adAccountId - ID da conta de anúncios
 * @param startDate - Data inicial (YYYY-MM-DD) no timezone da conta
 * @param endDate - Data final (YYYY-MM-DD) no timezone da conta
 * @param level - Nível de agregação
 * @returns Array de insights horários ou null em caso de erro
 */
export async function getHourlyAdAccountInsights(
  accessToken: string,
  adAccountId: string,
  startDate: string,
  endDate: string,
  level: 'account' | 'campaign' | 'adset' | 'ad' = 'account'
): Promise<FacebookHourlyInsight[] | null> {
  try {
    const accountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`

    const fields = [
      'account_id',
      'account_name',
      'campaign_id',
      'campaign_name',
      'adset_id',
      'adset_name',
      'spend',
      'impressions',
      'clicks',
      'reach',
      'frequency',
      'cpm',
      'cpc',
      'ctr',
      'actions',
      'cost_per_action_type',
    ].join(',')

    const timeRange = JSON.stringify({
      since: startDate,
      until: endDate,
    })

    // Usar breakdowns para obter dados por hora no timezone da conta
    const url = `${FACEBOOK_GRAPH_API_BASE}/${accountId}/insights?` +
      `fields=${fields}&` +
      `time_range=${encodeURIComponent(timeRange)}&` +
      `level=${level}&` +
      `time_increment=1&` +
      `breakdowns=hourly_stats_aggregated_by_advertiser_time_zone&` +
      `access_token=${accessToken}`

    console.log('Fetching hourly insights from:', startDate, 'to', endDate)

    const response = await fetch(url)
    const data = await response.json()

    if (data.error) {
      console.error('Facebook API Error (hourly):', data.error)
      return null
    }

    console.log('Received', data.data?.length || 0, 'hourly records')
    return data.data || []
  } catch (error) {
    console.error('Error fetching hourly Facebook insights:', error)
    return null
  }
}

/**
 * Parse string de hora do Facebook para número de hora (0-23)
 * Formato do Facebook: "00:00:00 - 00:59:59" ou "23:00:00 - 23:59:59"
 *
 * @param timeStr - String de hora do Facebook
 * @returns Número da hora (0-23)
 */
export function parseHourFromFacebookFormat(timeStr: string | undefined): number {
  if (!timeStr) return 0
  const match = timeStr.match(/^(\d{2}):\d{2}:\d{2}/)
  return match ? parseInt(match[1], 10) : 0
}

/**
 * Converter insight horário do Facebook para formato de armazenamento
 *
 * @param insight - Insight horário do Facebook
 * @param usdToBrlRate - Taxa de conversão USD/BRL
 * @returns Dados formatados para armazenamento
 */
export function convertHourlyInsightToSpend(
  insight: FacebookHourlyInsight,
  usdToBrlRate: number = 5.0
) {
  const spendUsd = parseFloat(insight.spend) || 0
  const spendBrl = spendUsd * usdToBrlRate
  const impressions = parseInt(insight.impressions) || 0
  const clicks = parseInt(insight.clicks) || 0
  const reach = parseInt(insight.reach) || 0

  // Extrair hora do formato do Facebook
  const hourPt = parseHourFromFacebookFormat(insight.hourly_stats_aggregated_by_advertiser_time_zone)

  // Criar timestamp PT combinando data e hora
  const dateStr = insight.date_start
  const dateTimePt = new Date(`${dateStr}T${String(hourPt).padStart(2, '0')}:00:00`)

  return {
    dateStr,
    dateTimePt,
    hourPt,
    adAccountId: insight.account_id.startsWith('act_')
      ? insight.account_id
      : `act_${insight.account_id}`,
    adAccountName: insight.account_name,
    campaignId: insight.campaign_id || '',
    campaignName: insight.campaign_name,
    adsetId: insight.adset_id || '',
    adsetName: insight.adset_name,
    spendUsd,
    spendBrl,
    impressions,
    clicks,
    reach,
    results: extractResults(insight.actions),
    costPerResult: extractCostPerResult(insight.cost_per_action_type),
  }
}
