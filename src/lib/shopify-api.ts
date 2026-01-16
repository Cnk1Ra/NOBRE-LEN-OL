/**
 * Shopify API Integration
 *
 * Integração com a API da Shopify para buscar dados de vendas
 * e cruzar com campanhas do Facebook Ads via UTM parameters
 *
 * Documentação: https://shopify.dev/docs/api/admin-rest
 */

const SHOPIFY_API_VERSION = '2024-01'

export interface ShopifyOrder {
  id: number
  order_number: number
  created_at: string
  financial_status: string
  fulfillment_status: string | null
  total_price: string
  subtotal_price: string
  total_tax: string
  total_discounts: string
  currency: string
  line_items: ShopifyLineItem[]
  note_attributes: Array<{ name: string; value: string }>
  landing_site: string | null
  referring_site: string | null
  source_name: string
  tags: string
  discount_codes: Array<{ code: string; amount: string; type: string }>
}

export interface ShopifyLineItem {
  id: number
  product_id: number
  variant_id: number
  title: string
  variant_title: string | null
  quantity: number
  price: string
  sku: string | null
  vendor: string | null
}

export interface ProcessedOrder {
  orderId: number
  orderNumber: string
  createdAt: string
  dateBrt: string
  financialStatus: string
  fulfillmentStatus: string
  totalPrice: number
  subtotalPrice: number
  totalDiscounts: number
  currency: string
  discountCode: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmContent: string | null
  utmTerm: string | null
  fbclid: string | null
  referringSite: string | null
  sourceName: string
  productNames: string
  productSkus: string
  productQuantity: number
  tags: string
}

export interface DailySalesSummary {
  date: string
  totalOrders: number
  grossRevenue: number
  totalDiscounts: number
  netRevenue: number
  averageTicket: number
  productsQuantity: number
  salesBySource: Record<string, { orders: number; revenue: number }>
  salesByCampaign: Record<string, { orders: number; revenue: number }>
}

/**
 * Extrai UTM parameters da URL de landing
 */
export function extractUtmsFromUrl(landingSite: string | null): Record<string, string | null> {
  if (!landingSite) return {}

  try {
    // Adiciona protocolo se não tiver para o URL ser válido
    const urlToParse = landingSite.startsWith('http') ? landingSite : `https://example.com${landingSite}`
    const url = new URL(urlToParse)
    const params = url.searchParams

    return {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_content: params.get('utm_content'),
      utm_term: params.get('utm_term'),
      fbclid: params.get('fbclid'),
      gclid: params.get('gclid'),
    }
  } catch {
    return {}
  }
}

/**
 * Extrai UTMs de note_attributes (UTMify ou scripts customizados)
 */
export function extractUtmsFromNotes(noteAttributes: Array<{ name: string; value: string }> | null): Record<string, string | null> {
  if (!noteAttributes || noteAttributes.length === 0) return {}

  const utms: Record<string, string | null> = {}
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid']

  for (const attr of noteAttributes) {
    const name = attr.name?.toLowerCase()
    if (utmKeys.includes(name)) {
      utms[name] = attr.value || null
    }
  }

  return utms
}

/**
 * Processa um pedido da Shopify e extrai dados relevantes
 */
export function processOrder(order: ShopifyOrder): ProcessedOrder {
  // Extrair UTMs - primeiro tenta note_attributes (mais confiável), depois landing_site
  const utmsFromNotes = extractUtmsFromNotes(order.note_attributes)
  const utmsFromUrl = extractUtmsFromUrl(order.landing_site)

  // Prioriza UTMs do note_attributes
  const utms = { ...utmsFromUrl, ...utmsFromNotes }

  // Processar produtos
  const lineItems = order.line_items || []
  const productNames = lineItems.map(item => item.title).join(', ')
  const productSkus = lineItems.map(item => item.sku || '').filter(Boolean).join(', ')
  const totalQuantity = lineItems.reduce((sum, item) => sum + item.quantity, 0)

  // Processar cupom
  const discountCode = order.discount_codes?.[0]?.code || null

  // Converter data para formato BRT
  const createdAt = order.created_at || ''
  const dateBrt = createdAt.split('T')[0] || ''

  return {
    orderId: order.id,
    orderNumber: `#${order.order_number}`,
    createdAt,
    dateBrt,
    financialStatus: order.financial_status,
    fulfillmentStatus: order.fulfillment_status || 'unfulfilled',
    totalPrice: parseFloat(order.total_price) || 0,
    subtotalPrice: parseFloat(order.subtotal_price) || 0,
    totalDiscounts: parseFloat(order.total_discounts) || 0,
    currency: order.currency,
    discountCode,
    utmSource: utms.utm_source || null,
    utmMedium: utms.utm_medium || null,
    utmCampaign: utms.utm_campaign || null,
    utmContent: utms.utm_content || null,
    utmTerm: utms.utm_term || null,
    fbclid: utms.fbclid || null,
    referringSite: order.referring_site || null,
    sourceName: order.source_name || 'web',
    productNames,
    productSkus,
    productQuantity: totalQuantity,
    tags: order.tags || '',
  }
}

/**
 * Busca pedidos da Shopify por data
 */
export async function getOrdersByDate(
  storeUrl: string,
  accessToken: string,
  dateStr: string, // YYYY-MM-DD
  timezone: string = '-03:00'
): Promise<ShopifyOrder[]> {
  const orders: ShopifyOrder[] = []

  const createdAtMin = `${dateStr}T00:00:00${timezone}`
  const createdAtMax = `${dateStr}T23:59:59${timezone}`

  const fields = [
    'id', 'order_number', 'created_at', 'financial_status',
    'fulfillment_status', 'total_price', 'subtotal_price',
    'total_tax', 'total_discounts', 'currency', 'line_items',
    'note_attributes', 'landing_site', 'referring_site',
    'source_name', 'tags', 'discount_codes'
  ].join(',')

  const baseUrl = `https://${storeUrl}/admin/api/${SHOPIFY_API_VERSION}/orders.json`
  let url: string | null = `${baseUrl}?status=any&financial_status=paid&created_at_min=${encodeURIComponent(createdAtMin)}&created_at_max=${encodeURIComponent(createdAtMax)}&limit=250&fields=${fields}`

  const headers = {
    'X-Shopify-Access-Token': accessToken,
    'Content-Type': 'application/json',
  }

  let currentUrl: string | null = url

  while (currentUrl) {
    const res: Response = await fetch(currentUrl, { headers })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Shopify API Error:', res.status, errorText)
      throw new Error(`Shopify API Error: ${res.status}`)
    }

    const data = await res.json()
    orders.push(...(data.orders || []))

    // Paginação via Link header
    const linkHeader = res.headers.get('Link') || ''
    currentUrl = null

    if (linkHeader.includes('rel="next"')) {
      const matches = linkHeader.match(/<([^>]+)>;\s*rel="next"/)
      if (matches) {
        currentUrl = matches[1]
      }
    }
  }

  return orders
}

/**
 * Busca pedidos de um range de datas
 */
export async function getOrdersByDateRange(
  storeUrl: string,
  accessToken: string,
  startDate: string,
  endDate: string,
  timezone: string = '-03:00'
): Promise<ShopifyOrder[]> {
  const orders: ShopifyOrder[] = []

  const createdAtMin = `${startDate}T00:00:00${timezone}`
  const createdAtMax = `${endDate}T23:59:59${timezone}`

  const fields = [
    'id', 'order_number', 'created_at', 'financial_status',
    'fulfillment_status', 'total_price', 'subtotal_price',
    'total_tax', 'total_discounts', 'currency', 'line_items',
    'note_attributes', 'landing_site', 'referring_site',
    'source_name', 'tags', 'discount_codes'
  ].join(',')

  const baseUrl = `https://${storeUrl}/admin/api/${SHOPIFY_API_VERSION}/orders.json`
  const initialUrl = `${baseUrl}?status=any&financial_status=paid&created_at_min=${encodeURIComponent(createdAtMin)}&created_at_max=${encodeURIComponent(createdAtMax)}&limit=250&fields=${fields}`

  const headers = {
    'X-Shopify-Access-Token': accessToken,
    'Content-Type': 'application/json',
  }

  let currentUrl: string | null = initialUrl

  while (currentUrl) {
    const res: Response = await fetch(currentUrl, { headers })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Shopify API Error:', res.status, errorText)
      throw new Error(`Shopify API Error: ${res.status}`)
    }

    const data = await res.json()
    orders.push(...(data.orders || []))

    // Paginação
    const linkHeader = res.headers.get('Link') || ''
    currentUrl = null

    if (linkHeader.includes('rel="next"')) {
      const matches = linkHeader.match(/<([^>]+)>;\s*rel="next"/)
      if (matches) {
        currentUrl = matches[1]
      }
    }
  }

  return orders
}

/**
 * Gera resumo diário de vendas agrupado
 */
export function generateDailySummary(orders: ProcessedOrder[]): DailySalesSummary {
  const date = orders[0]?.dateBrt || ''

  const totalOrders = orders.length
  const grossRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0)
  const totalDiscounts = orders.reduce((sum, o) => sum + o.totalDiscounts, 0)
  const netRevenue = grossRevenue - totalDiscounts
  const averageTicket = totalOrders > 0 ? grossRevenue / totalOrders : 0
  const productsQuantity = orders.reduce((sum, o) => sum + o.productQuantity, 0)

  // Agrupar por fonte (utm_source)
  const salesBySource: Record<string, { orders: number; revenue: number }> = {}
  for (const order of orders) {
    const source = order.utmSource || 'organic'
    if (!salesBySource[source]) {
      salesBySource[source] = { orders: 0, revenue: 0 }
    }
    salesBySource[source].orders++
    salesBySource[source].revenue += order.totalPrice
  }

  // Agrupar por campanha (utm_campaign)
  const salesByCampaign: Record<string, { orders: number; revenue: number }> = {}
  for (const order of orders) {
    const campaign = order.utmCampaign || 'direct'
    if (!salesByCampaign[campaign]) {
      salesByCampaign[campaign] = { orders: 0, revenue: 0 }
    }
    salesByCampaign[campaign].orders++
    salesByCampaign[campaign].revenue += order.totalPrice
  }

  return {
    date,
    totalOrders,
    grossRevenue,
    totalDiscounts,
    netRevenue,
    averageTicket,
    productsQuantity,
    salesBySource,
    salesByCampaign,
  }
}

/**
 * Agrupa pedidos processados por dia
 */
export function groupOrdersByDate(orders: ProcessedOrder[]): Record<string, ProcessedOrder[]> {
  const grouped: Record<string, ProcessedOrder[]> = {}

  for (const order of orders) {
    const date = order.dateBrt
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(order)
  }

  return grouped
}

/**
 * Valida credenciais da Shopify
 */
export async function validateShopifyCredentials(
  storeUrl: string,
  accessToken: string
): Promise<{ valid: boolean; shopName?: string; error?: string }> {
  try {
    const url = `https://${storeUrl}/admin/api/${SHOPIFY_API_VERSION}/shop.json`
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        return { valid: false, error: 'Token de acesso inválido' }
      }
      if (response.status === 404) {
        return { valid: false, error: 'Loja não encontrada' }
      }
      return { valid: false, error: `Erro HTTP: ${response.status}` }
    }

    const data = await response.json()
    return {
      valid: true,
      shopName: data.shop?.name,
    }
  } catch (error) {
    console.error('Error validating Shopify credentials:', error)
    return { valid: false, error: 'Erro de conexão' }
  }
}
