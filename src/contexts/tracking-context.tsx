'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

// ============ COD-SPECIFIC INTERFACES ============

// Delivery Status Flow for COD
export type CODStatus =
  | 'pending'           // Pedido criado, aguardando confirmação
  | 'confirmed'         // Confirmado via ligação/WhatsApp
  | 'processing'        // Em separação no warehouse
  | 'shipped'           // Enviado para transportadora
  | 'in_transit'        // Em trânsito
  | 'out_for_delivery'  // Saiu para entrega
  | 'delivered'         // Entregue e PAGO
  | 'partial_delivery'  // Entrega parcial
  | 'returned'          // Devolvido
  | 'refused'           // Cliente recusou
  | 'not_found'         // Não encontrado
  | 'rescheduled'       // Reagendado
  | 'cancelled'         // Cancelado antes do envio

export interface TrackingSource {
  // UTM Parameters (UTMify/Otimizey style)
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content: string
  utm_term: string

  // Platform IDs (extracted from UTM)
  campaign_id: string
  campaign_name: string
  adset_id: string
  adset_name: string
  ad_id: string
  ad_name: string

  // Click IDs
  fbclid: string
  gclid: string
  ttclid: string
  kwai_click_id: string

  // Facebook Browser/Click IDs
  fbp: string
  fbc: string

  // Cloaker Parameters (The White Rabbit, Keitaro, etc)
  subid: string
  sub1: string
  sub2: string
  sub3: string
  sub4: string
  sub5: string
  clickid: string
  cwr: string
  xid: string
  external_id: string

  // Additional Tracking
  placement: string
  device: 'mobile' | 'desktop' | 'tablet'
  browser: string
  os: string
  country: string
  region: string
  city: string
  domain: string
  landing_page: string
  referrer: string
  ip: string
  user_agent: string
}

export interface VisitorData {
  visitor_id: string
  fingerprint: string
  first_visit: string
  last_visit: string
  visit_count: number
  source: TrackingSource
  attribution_model: 'first-click' | 'last-click'
  events: TrackingEvent[]
}

export interface TrackingEvent {
  id: string
  type: 'PageView' | 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Lead' | 'SubmitForm' | 'Purchase' | 'Click' | 'ScrollDepth' | 'TimeOnPage' | 'PhoneClick' | 'WhatsAppClick'
  timestamp: string
  url: string
  data: Record<string, any>
}

// COD Order - The main entity
export interface CODOrder {
  // Identifiers
  order_id: string
  external_id?: string // Shopify, Yampi, etc

  // Timestamps
  created_at: string
  confirmed_at?: string
  shipped_at?: string
  delivered_at?: string
  returned_at?: string

  // Status
  status: CODStatus
  status_history: {
    status: CODStatus
    timestamp: string
    note?: string
  }[]

  // Order Value
  subtotal: number
  shipping_cost: number
  discount: number
  total: number
  currency: string

  // Products
  products: {
    id: string
    name: string
    sku?: string
    price: number
    quantity: number
    variant?: string
  }[]

  // Customer (COD specific - phone is critical)
  customer: {
    name: string
    phone: string
    phone_hash: string
    email?: string
    email_hash?: string
    country: string
    region: string
    city: string
    address: string
    postal_code: string
  }

  // Delivery
  delivery: {
    carrier: string
    tracking_code?: string
    attempts: number
    last_attempt?: string
    estimated_date?: string
    delivered_value?: number // Value actually collected
  }

  // Attribution - WHERE IT CAME FROM
  attribution: {
    source: string
    platform: 'facebook' | 'google' | 'tiktok' | 'kwai' | 'taboola' | 'organic' | 'direct' | 'whatsapp' | 'referral' | 'unknown'
    campaign_id: string
    campaign_name: string
    adset_id: string
    adset_name: string
    ad_id: string
    ad_name: string
    placement: string
    device: string
    landing_page: string
    attribution_model: 'first-click' | 'last-click'
    attribution_window: number
  }

  // Tracking Data
  tracking: {
    visitor_id: string
    session_id: string
    fbclid: string
    fbp: string
    fbc: string
    gclid: string
    ttclid: string
    ip: string
    user_agent: string
    fingerprint: string
  }

  // CAPI Status
  capi: {
    lead_sent: boolean
    purchase_sent: boolean
    delivery_sent: boolean
    return_sent: boolean
    last_event_id?: string
  }

  // Confirmation (COD specific)
  confirmation: {
    method: 'phone' | 'whatsapp' | 'sms' | 'auto' | 'none'
    attempts: number
    confirmed: boolean
    confirmed_at?: string
    confirmed_by?: string
    notes?: string
  }

  // Financials
  financials: {
    ad_cost?: number // Cost attributed to this sale
    shipping_paid?: number
    cod_fee?: number
    net_profit?: number
  }
}

// Campaign Metrics for COD
export interface CODCampaignMetrics {
  campaign_id: string
  campaign_name: string
  platform: string

  // Orders
  orders_total: number
  orders_confirmed: number
  orders_shipped: number
  orders_delivered: number
  orders_returned: number
  orders_pending: number

  // Rates (COD Specific)
  confirmation_rate: number  // confirmed / total
  delivery_rate: number      // delivered / shipped
  return_rate: number        // returned / shipped

  // Revenue
  revenue_expected: number   // Total de pedidos criados
  revenue_delivered: number  // Apenas entregas confirmadas
  revenue_returned: number   // Valor devolvido

  // Costs
  ad_cost: number
  shipping_cost: number
  return_cost: number
  total_cost: number

  // Real Metrics (COD Important!)
  cpa_order: number         // Custo por pedido criado
  cpa_delivered: number     // Custo por pedido ENTREGUE (mais importante!)
  roas_expected: number     // ROAS baseado em pedidos
  roas_real: number         // ROAS baseado em ENTREGAS

  // Ticket
  average_ticket: number

  // Breakdown
  adsets: CODAdsetMetrics[]
}

export interface CODAdsetMetrics {
  adset_id: string
  adset_name: string
  orders_total: number
  orders_delivered: number
  orders_returned: number
  delivery_rate: number
  revenue_delivered: number
  ad_cost: number
  cpa_delivered: number
  roas_real: number
  ads: CODAdMetrics[]
}

export interface CODAdMetrics {
  ad_id: string
  ad_name: string
  orders_total: number
  orders_delivered: number
  orders_returned: number
  delivery_rate: number
  revenue_delivered: number
  ad_cost: number
  cpa_delivered: number
  roas_real: number
}

// Dashboard Stats
export interface CODDashboardStats {
  // Today
  today: {
    orders: number
    confirmed: number
    shipped: number
    delivered: number
    returned: number
    revenue: number
    revenue_delivered: number
    delivery_rate: number
  }

  // By Period
  period: {
    orders: number
    delivered: number
    returned: number
    revenue_expected: number
    revenue_delivered: number
    delivery_rate: number
    return_rate: number
    average_ticket: number
  }

  // By Platform
  byPlatform: Record<string, {
    orders: number
    delivered: number
    returned: number
    revenue: number
    delivery_rate: number
  }>

  // By Country
  byCountry: Record<string, {
    orders: number
    delivered: number
    delivery_rate: number
    revenue: number
  }>
}

// ============ MOCK DATA GENERATOR ============

const generateMockCODOrders = (): CODOrder[] => {
  const platforms = ['facebook', 'google', 'tiktok', 'organic', 'whatsapp'] as const

  const campaigns = [
    { id: 'fb_120208765432', name: 'COD_BlackFriday_ES', platform: 'facebook' as const },
    { id: 'fb_120208765433', name: 'COD_Retargeting_7d', platform: 'facebook' as const },
    { id: 'fb_120208765434', name: 'COD_Lookalike_1%', platform: 'facebook' as const },
    { id: 'fb_120208765435', name: 'COD_Interesse_Fitness', platform: 'facebook' as const },
    { id: 'g_9876543210', name: 'Brand_Search_ES', platform: 'google' as const },
    { id: 'g_9876543211', name: 'Shopping_ES', platform: 'google' as const },
    { id: 'tt_123456', name: 'TikTok_Viral_V1', platform: 'tiktok' as const },
    { id: 'tt_123457', name: 'TikTok_UGC_Test', platform: 'tiktok' as const },
  ]

  const adsets = [
    { id: 'as_001', name: 'Interesse_25-45_M', campaign: 'fb_120208765432' },
    { id: 'as_002', name: 'Interesse_25-45_F', campaign: 'fb_120208765432' },
    { id: 'as_003', name: 'LAL_Compradores_1%', campaign: 'fb_120208765434' },
    { id: 'as_004', name: 'Retargeting_VC_7d', campaign: 'fb_120208765433' },
    { id: 'as_005', name: 'Fitness_Broad', campaign: 'fb_120208765435' },
  ]

  const ads = [
    { id: 'ad_001', name: 'Video_Unboxing_v1', adset: 'as_001' },
    { id: 'ad_002', name: 'Video_Unboxing_v2', adset: 'as_001' },
    { id: 'ad_003', name: 'Carrossel_Produtos', adset: 'as_002' },
    { id: 'ad_004', name: 'Video_Testimonial', adset: 'as_002' },
    { id: 'ad_005', name: 'DPA_Catalogo', adset: 'as_004' },
    { id: 'ad_006', name: 'Static_Promo', adset: 'as_003' },
  ]

  const countries = [
    { code: 'ES', regions: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla'] },
    { code: 'PT', regions: ['Lisboa', 'Porto', 'Faro', 'Coimbra'] },
    { code: 'IT', regions: ['Roma', 'Milano', 'Napoli', 'Torino'] },
  ]

  const carriers = ['SEUR', 'GLS', 'CTT', 'DHL', 'MRW', 'Correos']

  const products = [
    { id: 'prod_001', name: 'Kit Fitness Pro', price: 49.90 },
    { id: 'prod_002', name: 'Suplemento Premium', price: 39.90 },
    { id: 'prod_003', name: 'Bundle Completo', price: 79.90 },
    { id: 'prod_004', name: 'Produto Upsell', price: 29.90 },
  ]

  const statuses: CODStatus[] = [
    'pending', 'confirmed', 'processing', 'shipped',
    'in_transit', 'out_for_delivery', 'delivered',
    'returned', 'refused', 'not_found', 'rescheduled'
  ]

  const orders: CODOrder[] = []
  const now = new Date()

  // Generate 300 orders for last 30 days
  for (let i = 0; i < 300; i++) {
    const daysAgo = Math.floor(Math.random() * 30)
    const hoursAgo = Math.floor(Math.random() * 24)
    const minutesAgo = Math.floor(Math.random() * 60)

    const orderDate = new Date(now)
    orderDate.setDate(orderDate.getDate() - daysAgo)
    orderDate.setHours(hoursAgo, minutesAgo, 0, 0)

    // Determine status based on age
    let status: CODStatus
    let statusHistory: { status: CODStatus; timestamp: string; note?: string }[] = []

    const ageInDays = daysAgo
    const random = Math.random()

    if (ageInDays < 1) {
      // Today - mostly pending/confirmed
      status = random < 0.6 ? 'pending' : random < 0.9 ? 'confirmed' : 'processing'
    } else if (ageInDays < 3) {
      // 1-3 days - processing/shipped
      status = random < 0.2 ? 'confirmed' : random < 0.5 ? 'processing' : random < 0.9 ? 'shipped' : 'in_transit'
    } else if (ageInDays < 7) {
      // 3-7 days - in transit/delivered
      status = random < 0.1 ? 'shipped' : random < 0.3 ? 'in_transit' : random < 0.5 ? 'out_for_delivery' : random < 0.85 ? 'delivered' : 'returned'
    } else {
      // > 7 days - mostly final statuses
      status = random < 0.75 ? 'delivered' : random < 0.90 ? 'returned' : random < 0.95 ? 'refused' : 'not_found'
    }

    // Build status history
    const baseTime = new Date(orderDate)
    statusHistory.push({ status: 'pending', timestamp: baseTime.toISOString() })

    if (['confirmed', 'processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'refused', 'not_found'].includes(status)) {
      baseTime.setHours(baseTime.getHours() + Math.floor(Math.random() * 6) + 1)
      statusHistory.push({ status: 'confirmed', timestamp: baseTime.toISOString() })
    }
    if (['processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'refused', 'not_found'].includes(status)) {
      baseTime.setHours(baseTime.getHours() + Math.floor(Math.random() * 12) + 1)
      statusHistory.push({ status: 'processing', timestamp: baseTime.toISOString() })
    }
    if (['shipped', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'refused', 'not_found'].includes(status)) {
      baseTime.setHours(baseTime.getHours() + Math.floor(Math.random() * 24) + 1)
      statusHistory.push({ status: 'shipped', timestamp: baseTime.toISOString() })
    }
    if (['in_transit', 'out_for_delivery', 'delivered', 'returned', 'refused', 'not_found'].includes(status)) {
      baseTime.setHours(baseTime.getHours() + Math.floor(Math.random() * 48) + 1)
      statusHistory.push({ status: 'in_transit', timestamp: baseTime.toISOString() })
    }
    if (['out_for_delivery', 'delivered', 'returned', 'refused', 'not_found'].includes(status)) {
      baseTime.setHours(baseTime.getHours() + Math.floor(Math.random() * 24) + 1)
      statusHistory.push({ status: 'out_for_delivery', timestamp: baseTime.toISOString() })
    }
    if (['delivered', 'returned', 'refused', 'not_found'].includes(status)) {
      baseTime.setHours(baseTime.getHours() + Math.floor(Math.random() * 12) + 1)
      statusHistory.push({ status, timestamp: baseTime.toISOString() })
    }

    const campaign = campaigns[Math.floor(Math.random() * campaigns.length)]
    const isOrganic = Math.random() < 0.1
    const relatedAdsets = adsets.filter(a => a.campaign === campaign.id)
    const adset = relatedAdsets.length > 0 ? relatedAdsets[Math.floor(Math.random() * relatedAdsets.length)] : null
    const relatedAds = adset ? ads.filter(a => a.adset === adset.id) : []
    const ad = relatedAds.length > 0 ? relatedAds[Math.floor(Math.random() * relatedAds.length)] : null

    const product = products[Math.floor(Math.random() * products.length)]
    const quantity = Math.random() < 0.8 ? 1 : 2
    const subtotal = product.price * quantity
    const shipping = Math.random() < 0.3 ? 0 : Math.round(Math.random() * 5 + 3)
    const discount = Math.random() < 0.2 ? Math.round(subtotal * 0.1) : 0
    const total = subtotal + shipping - discount

    const country = countries[Math.floor(Math.random() * countries.length)]
    const region = country.regions[Math.floor(Math.random() * country.regions.length)]
    const carrier = carriers[Math.floor(Math.random() * carriers.length)]

    orders.push({
      order_id: `COD-${Date.now()}-${i.toString().padStart(4, '0')}`,
      external_id: `SHOP-${10000 + i}`,
      created_at: orderDate.toISOString(),
      confirmed_at: status !== 'pending' ? statusHistory.find(s => s.status === 'confirmed')?.timestamp : undefined,
      shipped_at: ['shipped', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'refused', 'not_found'].includes(status) ? statusHistory.find(s => s.status === 'shipped')?.timestamp : undefined,
      delivered_at: status === 'delivered' ? statusHistory.find(s => s.status === 'delivered')?.timestamp : undefined,
      returned_at: ['returned', 'refused', 'not_found'].includes(status) ? statusHistory.find(s => ['returned', 'refused', 'not_found'].includes(s.status))?.timestamp : undefined,
      status,
      status_history: statusHistory,
      subtotal,
      shipping_cost: shipping,
      discount,
      total,
      currency: 'EUR',
      products: [{
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
      }],
      customer: {
        name: `Cliente ${i}`,
        phone: `+34${Math.floor(Math.random() * 900000000 + 100000000)}`,
        phone_hash: `hash_phone_${Math.random().toString(36).substr(2, 9)}`,
        email: Math.random() < 0.7 ? `cliente${i}@email.com` : undefined,
        email_hash: `hash_email_${Math.random().toString(36).substr(2, 9)}`,
        country: country.code,
        region,
        city: region,
        address: `Calle Ejemplo ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 10)}`,
        postal_code: `${Math.floor(Math.random() * 90000 + 10000)}`,
      },
      delivery: {
        carrier,
        tracking_code: ['shipped', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'refused', 'not_found'].includes(status) ? `${carrier.toUpperCase()}${Math.floor(Math.random() * 9000000000 + 1000000000)}` : undefined,
        attempts: status === 'delivered' ? 1 : (['returned', 'refused', 'not_found'].includes(status) ? Math.floor(Math.random() * 3) + 1 : 0),
        estimated_date: new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        delivered_value: status === 'delivered' ? total : undefined,
      },
      attribution: {
        source: isOrganic ? 'organic' : campaign.platform,
        platform: isOrganic ? 'organic' : campaign.platform,
        campaign_id: isOrganic ? '' : campaign.id,
        campaign_name: isOrganic ? '' : campaign.name,
        adset_id: adset?.id || '',
        adset_name: adset?.name || '',
        ad_id: ad?.id || '',
        ad_name: ad?.name || '',
        placement: ['feed', 'stories', 'reels', 'search', 'display'][Math.floor(Math.random() * 5)],
        device: Math.random() < 0.75 ? 'mobile' : 'desktop',
        landing_page: '/oferta-especial',
        attribution_model: 'last-click',
        attribution_window: 7,
      },
      tracking: {
        visitor_id: `vis_${Math.random().toString(36).substr(2, 12)}`,
        session_id: `sess_${Math.random().toString(36).substr(2, 12)}`,
        fbclid: campaign.platform === 'facebook' ? `fb.1.${Date.now()}.${Math.random().toString(36).substr(2, 9)}` : '',
        fbp: `fb.1.${Date.now()}.${Math.floor(Math.random() * 1000000000)}`,
        fbc: campaign.platform === 'facebook' ? `fb.1.${Date.now()}.${Math.random().toString(36).substr(2, 9)}` : '',
        gclid: campaign.platform === 'google' ? `Cj0KCQi${Math.random().toString(36).substr(2, 20)}` : '',
        ttclid: campaign.platform === 'tiktok' ? `tt_${Math.random().toString(36).substr(2, 20)}` : '',
        ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
        fingerprint: `fp_${Math.random().toString(36).substr(2, 16)}`,
      },
      capi: {
        lead_sent: status !== 'pending',
        purchase_sent: ['confirmed', 'processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'].includes(status),
        delivery_sent: status === 'delivered',
        return_sent: ['returned', 'refused', 'not_found'].includes(status),
      },
      confirmation: {
        method: status === 'pending' ? 'none' : (['phone', 'whatsapp', 'auto'][Math.floor(Math.random() * 3)] as any),
        attempts: status === 'pending' ? 0 : Math.floor(Math.random() * 3) + 1,
        confirmed: status !== 'pending',
        confirmed_at: status !== 'pending' ? statusHistory.find(s => s.status === 'confirmed')?.timestamp : undefined,
        confirmed_by: status !== 'pending' ? ['Sistema', 'João', 'Maria', 'Auto'][Math.floor(Math.random() * 4)] : undefined,
      },
      financials: {
        ad_cost: !isOrganic ? Math.round((Math.random() * 5 + 2) * 100) / 100 : 0,
        shipping_paid: shipping,
        cod_fee: Math.round(total * 0.02 * 100) / 100,
        net_profit: status === 'delivered' ? Math.round((total - (shipping * 0.5) - (total * 0.02) - (Math.random() * 5 + 2)) * 100) / 100 : undefined,
      },
    })
  }

  return orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

// ============ CONTEXT ============

interface TrackingContextType {
  // Orders
  orders: CODOrder[]
  recentOrders: CODOrder[]

  // Stats
  stats: CODDashboardStats
  campaignMetrics: CODCampaignMetrics[]

  // Settings
  attributionModel: 'first-click' | 'last-click'
  attributionWindow: number
  dateRange: { start: Date; end: Date }

  // Actions
  setAttributionModel: (model: 'first-click' | 'last-click') => void
  setAttributionWindow: (days: number) => void
  setDateRange: (range: { start: Date; end: Date }) => void
  updateOrderStatus: (orderId: string, status: CODStatus) => void
  refreshData: () => void

  // Real-time
  newOrderAlert: CODOrder | null
  clearNewOrderAlert: () => void
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined)

// ============ PROVIDER ============

export function TrackingProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<CODOrder[]>([])
  const [attributionModel, setAttributionModel] = useState<'first-click' | 'last-click'>('last-click')
  const [attributionWindow, setAttributionWindow] = useState(7)
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date(),
  })
  const [newOrderAlert, setNewOrderAlert] = useState<CODOrder | null>(null)

  // Initialize with mock data
  useEffect(() => {
    const mockOrders = generateMockCODOrders()
    setOrders(mockOrders)

    // Simulate new order coming in every 30-60 seconds
    const interval = setInterval(() => {
      const newOrder = generateMockCODOrders()[0]
      newOrder.order_id = `COD-${Date.now()}-NEW`
      newOrder.created_at = new Date().toISOString()
      newOrder.status = 'pending'
      newOrder.status_history = [{ status: 'pending', timestamp: new Date().toISOString() }]

      setOrders(prev => [newOrder, ...prev])
      setNewOrderAlert(newOrder)

      // Play notification sound
      if (typeof window !== 'undefined') {
        const audio = new Audio('/sounds/new-order.mp3')
        audio.volume = 0.5
        audio.play().catch(() => {})
      }
    }, Math.random() * 30000 + 30000)

    return () => clearInterval(interval)
  }, [])

  const recentOrders = orders.slice(0, 50)

  // Calculate dashboard stats
  const stats: CODDashboardStats = React.useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayOrders = orders.filter(o => new Date(o.created_at) >= today)
    const periodOrders = orders.filter(o => {
      const date = new Date(o.created_at)
      return date >= dateRange.start && date <= dateRange.end
    })

    // Today stats
    const todayDelivered = todayOrders.filter(o => o.status === 'delivered')
    const todayReturned = todayOrders.filter(o => ['returned', 'refused', 'not_found'].includes(o.status))
    const todayConfirmed = todayOrders.filter(o => o.confirmation.confirmed)
    const todayShipped = todayOrders.filter(o => ['shipped', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'refused', 'not_found'].includes(o.status))

    // Period stats
    const periodDelivered = periodOrders.filter(o => o.status === 'delivered')
    const periodReturned = periodOrders.filter(o => ['returned', 'refused', 'not_found'].includes(o.status))
    const periodShipped = periodOrders.filter(o => ['shipped', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'refused', 'not_found'].includes(o.status))

    // By platform
    const byPlatform: Record<string, { orders: number; delivered: number; returned: number; revenue: number; delivery_rate: number }> = {}
    periodOrders.forEach(order => {
      const platform = order.attribution.platform
      if (!byPlatform[platform]) {
        byPlatform[platform] = { orders: 0, delivered: 0, returned: 0, revenue: 0, delivery_rate: 0 }
      }
      byPlatform[platform].orders++
      if (order.status === 'delivered') {
        byPlatform[platform].delivered++
        byPlatform[platform].revenue += order.total
      }
      if (['returned', 'refused', 'not_found'].includes(order.status)) {
        byPlatform[platform].returned++
      }
    })
    Object.keys(byPlatform).forEach(p => {
      const shipped = periodOrders.filter(o => o.attribution.platform === p && ['shipped', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'refused', 'not_found'].includes(o.status)).length
      byPlatform[p].delivery_rate = shipped > 0 ? (byPlatform[p].delivered / shipped) * 100 : 0
    })

    // By country
    const byCountry: Record<string, { orders: number; delivered: number; delivery_rate: number; revenue: number }> = {}
    periodOrders.forEach(order => {
      const country = order.customer.country
      if (!byCountry[country]) {
        byCountry[country] = { orders: 0, delivered: 0, delivery_rate: 0, revenue: 0 }
      }
      byCountry[country].orders++
      if (order.status === 'delivered') {
        byCountry[country].delivered++
        byCountry[country].revenue += order.total
      }
    })
    Object.keys(byCountry).forEach(c => {
      const shipped = periodOrders.filter(o => o.customer.country === c && ['shipped', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'refused', 'not_found'].includes(o.status)).length
      byCountry[c].delivery_rate = shipped > 0 ? (byCountry[c].delivered / shipped) * 100 : 0
    })

    return {
      today: {
        orders: todayOrders.length,
        confirmed: todayConfirmed.length,
        shipped: todayShipped.length,
        delivered: todayDelivered.length,
        returned: todayReturned.length,
        revenue: todayOrders.reduce((sum, o) => sum + o.total, 0),
        revenue_delivered: todayDelivered.reduce((sum, o) => sum + o.total, 0),
        delivery_rate: todayShipped.length > 0 ? (todayDelivered.length / todayShipped.length) * 100 : 0,
      },
      period: {
        orders: periodOrders.length,
        delivered: periodDelivered.length,
        returned: periodReturned.length,
        revenue_expected: periodOrders.reduce((sum, o) => sum + o.total, 0),
        revenue_delivered: periodDelivered.reduce((sum, o) => sum + o.total, 0),
        delivery_rate: periodShipped.length > 0 ? (periodDelivered.length / periodShipped.length) * 100 : 0,
        return_rate: periodShipped.length > 0 ? (periodReturned.length / periodShipped.length) * 100 : 0,
        average_ticket: periodOrders.length > 0 ? periodOrders.reduce((sum, o) => sum + o.total, 0) / periodOrders.length : 0,
      },
      byPlatform,
      byCountry,
    }
  }, [orders, dateRange])

  // Calculate campaign metrics
  const campaignMetrics: CODCampaignMetrics[] = React.useMemo(() => {
    const metricsMap = new Map<string, CODCampaignMetrics>()

    const periodOrders = orders.filter(o => {
      const date = new Date(o.created_at)
      return date >= dateRange.start && date <= dateRange.end
    })

    periodOrders.forEach(order => {
      if (!order.attribution.campaign_id) return

      const key = order.attribution.campaign_id
      const existing = metricsMap.get(key)

      const isDelivered = order.status === 'delivered'
      const isReturned = ['returned', 'refused', 'not_found'].includes(order.status)
      const isShipped = ['shipped', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'refused', 'not_found'].includes(order.status)
      const isConfirmed = order.confirmation.confirmed
      const isPending = order.status === 'pending'

      if (existing) {
        existing.orders_total++
        if (isConfirmed) existing.orders_confirmed++
        if (isShipped) existing.orders_shipped++
        if (isDelivered) existing.orders_delivered++
        if (isReturned) existing.orders_returned++
        if (isPending) existing.orders_pending++

        existing.revenue_expected += order.total
        if (isDelivered) existing.revenue_delivered += order.total
        if (isReturned) existing.revenue_returned += order.total

        existing.ad_cost += order.financials.ad_cost || 0
        existing.shipping_cost += order.shipping_cost || 0
        if (isReturned) existing.return_cost += (order.shipping_cost || 0) * 2 // Double shipping for returns

        // Update adset metrics
        if (order.attribution.adset_id) {
          let adset = existing.adsets.find(a => a.adset_id === order.attribution.adset_id)
          if (!adset) {
            adset = {
              adset_id: order.attribution.adset_id,
              adset_name: order.attribution.adset_name,
              orders_total: 0,
              orders_delivered: 0,
              orders_returned: 0,
              delivery_rate: 0,
              revenue_delivered: 0,
              ad_cost: 0,
              cpa_delivered: 0,
              roas_real: 0,
              ads: [],
            }
            existing.adsets.push(adset)
          }
          adset.orders_total++
          if (isDelivered) {
            adset.orders_delivered++
            adset.revenue_delivered += order.total
          }
          if (isReturned) adset.orders_returned++
          adset.ad_cost += order.financials.ad_cost || 0

          // Update ad metrics
          if (order.attribution.ad_id) {
            let ad = adset.ads.find(a => a.ad_id === order.attribution.ad_id)
            if (!ad) {
              ad = {
                ad_id: order.attribution.ad_id,
                ad_name: order.attribution.ad_name,
                orders_total: 0,
                orders_delivered: 0,
                orders_returned: 0,
                delivery_rate: 0,
                revenue_delivered: 0,
                ad_cost: 0,
                cpa_delivered: 0,
                roas_real: 0,
              }
              adset.ads.push(ad)
            }
            ad.orders_total++
            if (isDelivered) {
              ad.orders_delivered++
              ad.revenue_delivered += order.total
            }
            if (isReturned) ad.orders_returned++
            ad.ad_cost += order.financials.ad_cost || 0
          }
        }
      } else {
        metricsMap.set(key, {
          campaign_id: key,
          campaign_name: order.attribution.campaign_name,
          platform: order.attribution.platform,
          orders_total: 1,
          orders_confirmed: isConfirmed ? 1 : 0,
          orders_shipped: isShipped ? 1 : 0,
          orders_delivered: isDelivered ? 1 : 0,
          orders_returned: isReturned ? 1 : 0,
          orders_pending: isPending ? 1 : 0,
          confirmation_rate: 0,
          delivery_rate: 0,
          return_rate: 0,
          revenue_expected: order.total,
          revenue_delivered: isDelivered ? order.total : 0,
          revenue_returned: isReturned ? order.total : 0,
          ad_cost: order.financials.ad_cost || 0,
          shipping_cost: order.shipping_cost || 0,
          return_cost: isReturned ? (order.shipping_cost || 0) * 2 : 0,
          total_cost: 0,
          cpa_order: 0,
          cpa_delivered: 0,
          roas_expected: 0,
          roas_real: 0,
          average_ticket: order.total,
          adsets: order.attribution.adset_id ? [{
            adset_id: order.attribution.adset_id,
            adset_name: order.attribution.adset_name,
            orders_total: 1,
            orders_delivered: isDelivered ? 1 : 0,
            orders_returned: isReturned ? 1 : 0,
            delivery_rate: 0,
            revenue_delivered: isDelivered ? order.total : 0,
            ad_cost: order.financials.ad_cost || 0,
            cpa_delivered: 0,
            roas_real: 0,
            ads: order.attribution.ad_id ? [{
              ad_id: order.attribution.ad_id,
              ad_name: order.attribution.ad_name,
              orders_total: 1,
              orders_delivered: isDelivered ? 1 : 0,
              orders_returned: isReturned ? 1 : 0,
              delivery_rate: 0,
              revenue_delivered: isDelivered ? order.total : 0,
              ad_cost: order.financials.ad_cost || 0,
              cpa_delivered: 0,
              roas_real: 0,
            }] : [],
          }] : [],
        })
      }
    })

    // Calculate rates and ROAS
    const metrics = Array.from(metricsMap.values())
    metrics.forEach(m => {
      m.confirmation_rate = m.orders_total > 0 ? (m.orders_confirmed / m.orders_total) * 100 : 0
      m.delivery_rate = m.orders_shipped > 0 ? (m.orders_delivered / m.orders_shipped) * 100 : 0
      m.return_rate = m.orders_shipped > 0 ? (m.orders_returned / m.orders_shipped) * 100 : 0
      m.total_cost = m.ad_cost + m.shipping_cost + m.return_cost
      m.cpa_order = m.orders_total > 0 ? m.ad_cost / m.orders_total : 0
      m.cpa_delivered = m.orders_delivered > 0 ? m.ad_cost / m.orders_delivered : 0
      m.roas_expected = m.ad_cost > 0 ? m.revenue_expected / m.ad_cost : 0
      m.roas_real = m.ad_cost > 0 ? m.revenue_delivered / m.ad_cost : 0
      m.average_ticket = m.orders_total > 0 ? m.revenue_expected / m.orders_total : 0

      // Calculate adset/ad metrics
      m.adsets.forEach(adset => {
        const adsetShipped = periodOrders.filter(o => o.attribution.adset_id === adset.adset_id && ['shipped', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'refused', 'not_found'].includes(o.status)).length
        adset.delivery_rate = adsetShipped > 0 ? (adset.orders_delivered / adsetShipped) * 100 : 0
        adset.cpa_delivered = adset.orders_delivered > 0 ? adset.ad_cost / adset.orders_delivered : 0
        adset.roas_real = adset.ad_cost > 0 ? adset.revenue_delivered / adset.ad_cost : 0

        adset.ads.forEach(ad => {
          const adShipped = periodOrders.filter(o => o.attribution.ad_id === ad.ad_id && ['shipped', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'refused', 'not_found'].includes(o.status)).length
          ad.delivery_rate = adShipped > 0 ? (ad.orders_delivered / adShipped) * 100 : 0
          ad.cpa_delivered = ad.orders_delivered > 0 ? ad.ad_cost / ad.orders_delivered : 0
          ad.roas_real = ad.ad_cost > 0 ? ad.revenue_delivered / ad.ad_cost : 0
        })
      })
    })

    return metrics.sort((a, b) => b.revenue_delivered - a.revenue_delivered)
  }, [orders, dateRange])

  const updateOrderStatus = useCallback((orderId: string, status: CODStatus) => {
    setOrders(prev => prev.map(order => {
      if (order.order_id === orderId) {
        return {
          ...order,
          status,
          status_history: [...order.status_history, { status, timestamp: new Date().toISOString() }],
        }
      }
      return order
    }))
  }, [])

  const refreshData = useCallback(() => {
    // In real app, would fetch from API
    const mockOrders = generateMockCODOrders()
    setOrders(mockOrders)
  }, [])

  const clearNewOrderAlert = useCallback(() => {
    setNewOrderAlert(null)
  }, [])

  return (
    <TrackingContext.Provider
      value={{
        orders,
        recentOrders,
        stats,
        campaignMetrics,
        attributionModel,
        attributionWindow,
        dateRange,
        setAttributionModel,
        setAttributionWindow,
        setDateRange,
        updateOrderStatus,
        refreshData,
        newOrderAlert,
        clearNewOrderAlert,
      }}
    >
      {children}
    </TrackingContext.Provider>
  )
}

export function useTracking() {
  const context = useContext(TrackingContext)
  if (context === undefined) {
    throw new Error('useTracking must be used within a TrackingProvider')
  }
  return context
}
