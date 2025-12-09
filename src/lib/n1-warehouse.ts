// N1 Warehouse API Integration Service
// Provides methods to interact with N1 Warehouse API

import crypto from 'crypto'

export interface N1Order {
  id: string
  externalRef?: string
  status: string
  statusLabel: string
  customerName?: string
  trackingCode?: string
  carrierName?: string
  country?: string
  total?: number
  currency?: string
  createdAt?: string
  updatedAt?: string
  shippedAt?: string
  deliveredAt?: string
}

export interface N1WebhookPayload {
  event: 'order.created' | 'order.updated' | 'order.status_changed' | 'order.shipped' | 'order.delivered'
  timestamp: string
  data: {
    orderId: string
    externalRef?: string
    status: string
    statusLabel?: string
    trackingCode?: string
    carrierName?: string
    previousStatus?: string
  }
}

export interface N1SyncResult {
  success: boolean
  synced: number
  errors: number
  orders: N1Order[]
  lastSyncAt: string
}

export interface N1Config {
  apiUrl: string
  apiToken: string
  webhookSecret?: string
}

// Status mapping from N1 to internal status
export const N1_STATUS_MAP: Record<string, { label: string; color: string }> = {
  'PENDENTE': { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-500' },
  'EM_SEPARACAO': { label: 'Em Separação', color: 'bg-blue-500/10 text-blue-500' },
  'SEPARADO': { label: 'Separado', color: 'bg-indigo-500/10 text-indigo-500' },
  'EMBALADO': { label: 'Embalado', color: 'bg-violet-500/10 text-violet-500' },
  'ENVIADO': { label: 'Enviado', color: 'bg-purple-500/10 text-purple-500' },
  'EM_TRANSITO': { label: 'Em Trânsito', color: 'bg-cyan-500/10 text-cyan-500' },
  'SAIU_ENTREGA': { label: 'Saiu para Entrega', color: 'bg-orange-500/10 text-orange-500' },
  'ENTREGUE': { label: 'Entregue', color: 'bg-green-500/10 text-green-500' },
  'DEVOLVIDO': { label: 'Devolvido', color: 'bg-red-500/10 text-red-500' },
  'CANCELADO': { label: 'Cancelado', color: 'bg-gray-500/10 text-gray-500' },
  'ERRO': { label: 'Erro', color: 'bg-red-500/10 text-red-500' },
}

export class N1WarehouseClient {
  private apiUrl: string
  private apiToken: string
  private webhookSecret?: string

  constructor(config: N1Config) {
    this.apiUrl = config.apiUrl.replace(/\/$/, '') // Remove trailing slash
    this.apiToken = config.apiToken
    this.webhookSecret = config.webhookSecret
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiToken}`,
        'X-API-Version': '1.0',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`N1 API Error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  // Fetch all orders from N1
  async getOrders(params?: {
    page?: number
    limit?: number
    status?: string
    since?: string
    country?: string
  }): Promise<{ orders: N1Order[]; total: number; page: number; pages: number }> {
    const searchParams = new URLSearchParams()

    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.status) searchParams.set('status', params.status)
    if (params?.since) searchParams.set('since', params.since)
    if (params?.country) searchParams.set('country', params.country)

    const query = searchParams.toString()
    return this.request(`/orders${query ? `?${query}` : ''}`)
  }

  // Fetch a single order by ID
  async getOrder(orderId: string): Promise<N1Order> {
    return this.request(`/orders/${orderId}`)
  }

  // Fetch order by external reference (DOD order ID)
  async getOrderByExternalRef(externalRef: string): Promise<N1Order | null> {
    try {
      const result = await this.request<{ orders: N1Order[] }>(
        `/orders?external_ref=${encodeURIComponent(externalRef)}`
      )
      return result.orders[0] || null
    } catch {
      return null
    }
  }

  // Create a new order in N1
  async createOrder(order: {
    externalRef: string
    customerName: string
    customerEmail?: string
    customerPhone?: string
    address: {
      street: string
      city: string
      state?: string
      zip: string
      country: string
    }
    items: Array<{
      sku: string
      name: string
      quantity: number
      unitPrice: number
    }>
    total: number
    currency?: string
    notes?: string
  }): Promise<N1Order> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    })
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: string): Promise<N1Order> {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) return false

    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  }

  // Sync all orders (full sync)
  async syncOrders(since?: string): Promise<N1SyncResult> {
    const allOrders: N1Order[] = []
    let page = 1
    let hasMore = true
    let errors = 0

    while (hasMore) {
      try {
        const result = await this.getOrders({
          page,
          limit: 100,
          since,
        })

        allOrders.push(...result.orders)
        hasMore = page < result.pages
        page++
      } catch (error) {
        errors++
        hasMore = false
        console.error('N1 sync error:', error)
      }
    }

    return {
      success: errors === 0,
      synced: allOrders.length,
      errors,
      orders: allOrders,
      lastSyncAt: new Date().toISOString(),
    }
  }

  // Test connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.request('/ping')
      return { success: true, message: 'Conexão estabelecida com sucesso' }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro de conexão',
      }
    }
  }
}

// Helper to create client from environment
export function createN1Client(): N1WarehouseClient | null {
  const apiUrl = process.env.N1_API_URL
  const apiToken = process.env.N1_API_TOKEN

  if (!apiUrl || !apiToken) {
    return null
  }

  return new N1WarehouseClient({
    apiUrl,
    apiToken,
    webhookSecret: process.env.N1_WEBHOOK_SECRET,
  })
}

// Mock client for development/demo
export class N1WarehouseMockClient extends N1WarehouseClient {
  private mockOrders: N1Order[] = [
    { id: 'N1-001', externalRef: 'DOD-001', status: 'EM_SEPARACAO', statusLabel: 'Em Separação', customerName: 'João Silva', trackingCode: 'PT123456789', country: 'PT', total: 289.90, currency: 'EUR', createdAt: '2024-12-07T10:00:00Z', updatedAt: '2024-12-07T14:30:00Z' },
    { id: 'N1-002', externalRef: 'DOD-002', status: 'ENTREGUE', statusLabel: 'Entregue', customerName: 'María García', trackingCode: 'ES987654321', country: 'ES', total: 459.90, currency: 'EUR', createdAt: '2024-12-06T09:00:00Z', updatedAt: '2024-12-06T18:45:00Z', deliveredAt: '2024-12-06T18:45:00Z' },
    { id: 'N1-003', externalRef: 'DOD-004', status: 'ENVIADO', statusLabel: 'Enviado', customerName: 'Marco Rossi', trackingCode: 'IT456789123', country: 'IT', total: 599.90, currency: 'EUR', createdAt: '2024-12-05T08:00:00Z', updatedAt: '2024-12-05T09:15:00Z', shippedAt: '2024-12-05T09:15:00Z' },
    { id: 'N1-004', externalRef: 'DOD-005', status: 'ENTREGUE', statusLabel: 'Entregue', customerName: 'Carlos López', trackingCode: 'ES321654987', country: 'ES', total: 349.90, currency: 'EUR', createdAt: '2024-12-04T11:00:00Z', updatedAt: '2024-12-04T16:20:00Z', deliveredAt: '2024-12-04T16:20:00Z' },
    { id: 'N1-005', externalRef: 'DOD-006', status: 'EM_SEPARACAO', statusLabel: 'Em Separação', customerName: 'Lucia Ferreira', trackingCode: 'PT147258369', country: 'PT', total: 279.90, currency: 'EUR', createdAt: '2024-12-07T10:30:00Z', updatedAt: '2024-12-07T11:00:00Z' },
    { id: 'N1-006', externalRef: 'DOD-008', status: 'ENVIADO', statusLabel: 'Enviado', customerName: 'Ana Martínez', trackingCode: 'ES963852741', country: 'ES', total: 199.90, currency: 'EUR', createdAt: '2024-12-06T09:30:00Z', updatedAt: '2024-12-06T10:30:00Z', shippedAt: '2024-12-06T10:30:00Z' },
    { id: 'N1-007', externalRef: 'DOD-010', status: 'ENTREGUE', statusLabel: 'Entregue', customerName: 'Francesca Romano', trackingCode: 'IT741852963', country: 'IT', total: 319.90, currency: 'EUR', createdAt: '2024-12-05T12:00:00Z', updatedAt: '2024-12-05T15:45:00Z', deliveredAt: '2024-12-05T15:45:00Z' },
    { id: 'N1-008', externalRef: 'DOD-011', status: 'EM_TRANSITO', statusLabel: 'Em Trânsito', customerName: 'Roberto Santos', trackingCode: 'BR123789456', country: 'BR', total: 389.90, currency: 'BRL', createdAt: '2024-12-07T08:00:00Z', updatedAt: '2024-12-07T12:00:00Z', shippedAt: '2024-12-07T09:00:00Z' },
  ]

  constructor() {
    super({ apiUrl: 'https://mock.n1warehouse.com', apiToken: 'mock-token' })
  }

  async getOrders(params?: {
    page?: number
    limit?: number
    status?: string
    since?: string
    country?: string
  }): Promise<{ orders: N1Order[]; total: number; page: number; pages: number }> {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay

    let filtered = [...this.mockOrders]

    if (params?.status) {
      filtered = filtered.filter(o => o.status === params.status)
    }
    if (params?.country) {
      filtered = filtered.filter(o => o.country === params.country)
    }

    const page = params?.page || 1
    const limit = params?.limit || 50
    const start = (page - 1) * limit
    const paged = filtered.slice(start, start + limit)

    return {
      orders: paged,
      total: filtered.length,
      page,
      pages: Math.ceil(filtered.length / limit),
    }
  }

  async getOrder(orderId: string): Promise<N1Order> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const order = this.mockOrders.find(o => o.id === orderId)
    if (!order) throw new Error('Order not found')
    return order
  }

  async getOrderByExternalRef(externalRef: string): Promise<N1Order | null> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return this.mockOrders.find(o => o.externalRef === externalRef) || null
  }

  async syncOrders(): Promise<N1SyncResult> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      success: true,
      synced: this.mockOrders.length,
      errors: 0,
      orders: this.mockOrders,
      lastSyncAt: new Date().toISOString(),
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return { success: true, message: 'Conexão mock estabelecida' }
  }

  // Add a simulated status update for demo
  simulateStatusUpdate(orderId: string, newStatus: string): N1Order | null {
    const order = this.mockOrders.find(o => o.id === orderId)
    if (order) {
      order.status = newStatus
      order.statusLabel = N1_STATUS_MAP[newStatus]?.label || newStatus
      order.updatedAt = new Date().toISOString()
      return order
    }
    return null
  }
}

// Export singleton mock client for development
export const mockN1Client = new N1WarehouseMockClient()
