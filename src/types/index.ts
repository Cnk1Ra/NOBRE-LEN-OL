// Types for the Dash On Delivery application

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'RETURNED'
  | 'CANCELLED'
  | 'FAILED_DELIVERY'

export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED'

export type DeliveryStatus =
  | 'PENDING'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'RETURNED'
  | 'FAILED'

export type Platform =
  | 'FACEBOOK'
  | 'INSTAGRAM'
  | 'GOOGLE'
  | 'TIKTOK'
  | 'YOUTUBE'
  | 'ORGANIC'
  | 'DIRECT'
  | 'EMAIL'
  | 'OTHER'

export type PartnerType = 'FOUNDER' | 'PARTNER' | 'INVESTOR' | 'SILENT'

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'CANCELLED'

export type TaskCategory =
  | 'GENERAL'
  | 'SHIPPING'
  | 'INVENTORY'
  | 'CUSTOMER'
  | 'FINANCIAL'
  | 'MARKETING'

export interface DashboardMetrics {
  revenue: number
  profit: number
  orders: number
  averageTicket: number
  deliveryRate: number
  returnRate: number
  adSpend: number
  roas: number
  visitors: number
  conversionRate: number
}

export interface DeliveryMetrics {
  delivered: number
  inTransit: number
  returned: number
  pending: number
  failed: number
  total: number
}

export interface TrafficSource {
  name: string
  platform: Platform
  sessions: number
  orders: number
  revenue: number
  adSpend?: number
  conversionRate: number
}

export interface ChartDataPoint {
  date: string
  revenue: number
  profit: number
  orders: number
  adSpend?: number
}

export interface Order {
  id: string
  shopifyId?: string
  shopifyOrderNumber?: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  shippingAddress?: string
  shippingCity?: string
  shippingState?: string
  shippingZip?: string
  shippingCountry?: string
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  costOfGoods: number
  profit: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  deliveryStatus: DeliveryStatus
  trackingCode?: string
  carrierName?: string
  orderedAt: string
  shippedAt?: string
  deliveredAt?: string
  returnedAt?: string
  cancelledAt?: string
  deliveryAttempts: number
  lastAttemptAt?: string
  failureReason?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  referrer?: string
  landingPage?: string
  country?: {
    code: string
    name: string
    currency: string
    currencySymbol: string
  }
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  name: string
  sku?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  costPrice: number
}

export interface Product {
  id: string
  shopifyId?: string
  sku: string
  name: string
  description?: string
  costPrice: number
  salePrice: number
  weight?: number
  isActive: boolean
  imageUrl?: string
}

export interface Partner {
  id: string
  name: string
  email?: string
  phone?: string
  type: PartnerType
  profitPercentage: number
  investedAmount?: number
  isActive: boolean
  notes?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  priority: TaskPriority
  status: TaskStatus
  dueDate?: string
  completedAt?: string
  category: TaskCategory
  relatedOrderId?: string
  assignee?: {
    id: string
    name: string
    image?: string
  }
}

export interface InventoryItem {
  id: string
  product: Product
  quantity: number
  minQuantity: number
  location?: string
  lastRestockAt?: string
}

export interface Campaign {
  id: string
  name: string
  platform: Platform
  externalId?: string
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'
  budget?: number
  spent: number
  startDate?: string
  endDate?: string
  metrics?: {
    impressions: number
    clicks: number
    conversions: number
    revenue: number
    ctr: number
    cpc: number
    cpa: number
    roas: number
  }
}

export interface DateRange {
  from: Date
  to: Date
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  message: string
  code?: string
  details?: Record<string, any>
}
