'use client'

import { useState, useEffect, useCallback } from 'react'
import { StatCard } from '@/components/dashboard/stat-card'
import { DeliveryStats } from '@/components/dashboard/delivery-stats'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { TrafficSources } from '@/components/dashboard/traffic-sources'
import { RecentOrders } from '@/components/dashboard/recent-orders'
import { useDateFilter } from '@/contexts/date-filter-context'
import { useCountry } from '@/contexts/country-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DollarSign,
  ShoppingCart,
  Truck,
  TrendingUp,
  Target,
  Users,
  RotateCcw,
  Percent,
  ArrowRight,
  Sparkles,
  Zap,
  Loader2,
} from 'lucide-react'

interface DashboardStats {
  revenue: number
  profit: number
  orders: number
  avgTicket: number
  deliveryRate: number
  returnRate: number
  roas: number
  adSpend: number
  visitors: number
  delivered: number
  inTransit: number
  returned: number
  pending: number
  failed: number
  total: number
  chartData: { date: string; revenue: number; profit: number; orders: number }[]
  trafficSources: {
    name: string
    platform: 'FACEBOOK' | 'INSTAGRAM' | 'GOOGLE' | 'TIKTOK' | 'ORGANIC'
    sessions: number
    orders: number
    revenue: number
    adSpend?: number
    conversionRate: number
  }[]
}

interface RecentOrder {
  id: string
  customerName: string
  total: number
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'RETURNED' | 'OUT_FOR_DELIVERY'
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED'
  createdAt: string
  country: string
}

const initialStats: DashboardStats = {
  revenue: 0,
  profit: 0,
  orders: 0,
  avgTicket: 0,
  deliveryRate: 0,
  returnRate: 0,
  roas: 0,
  adSpend: 0,
  visitors: 0,
  delivered: 0,
  inTransit: 0,
  returned: 0,
  pending: 0,
  failed: 0,
  total: 0,
  chartData: [],
  trafficSources: [],
}

export default function DashboardPage() {
  const { period, refreshKey, isRefreshing } = useDateFilter()
  const { selectedCountry, isAllSelected, defaultCurrency } = useCountry()

  const [stats, setStats] = useState<DashboardStats>(initialStats)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lowStockCount, setLowStockCount] = useState(0)

  // Fetch dashboard stats
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch stats
      const statsResponse = await fetch(`/api/orders/stats?period=${period}`)
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()

        // Calculate delivery metrics
        const deliveredCount = statsData.byStatus?.DELIVERED || 0
        const shippedCount = statsData.byStatus?.SHIPPED || 0
        const outForDeliveryCount = statsData.byStatus?.OUT_FOR_DELIVERY || 0
        const returnedCount = statsData.byStatus?.RETURNED || 0
        const pendingCount = statsData.byStatus?.PENDING || 0
        const failedCount = statsData.byStatus?.FAILED_DELIVERY || 0
        const totalOrders = statsData.totalOrders || 0

        const deliveryRate = totalOrders > 0 ? (deliveredCount / totalOrders) * 100 : 0
        const returnRate = totalOrders > 0 ? (returnedCount / totalOrders) * 100 : 0

        setStats({
          revenue: statsData.totalRevenue || 0,
          profit: statsData.totalProfit || 0,
          orders: totalOrders,
          avgTicket: statsData.avgOrderValue || 0,
          deliveryRate: Math.round(deliveryRate * 10) / 10,
          returnRate: Math.round(returnRate * 10) / 10,
          roas: statsData.roas || 0,
          adSpend: statsData.adSpend || 0,
          visitors: statsData.visitors || 0,
          delivered: deliveredCount,
          inTransit: shippedCount + outForDeliveryCount,
          returned: returnedCount,
          pending: pendingCount,
          failed: failedCount,
          total: totalOrders,
          chartData: statsData.chartData || [],
          trafficSources: statsData.trafficSources || [],
        })
      }

      // Fetch recent orders
      const ordersResponse = await fetch('/api/orders?limit=5')
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        const orders = (ordersData.data || []).map((order: any) => ({
          id: order.id,
          customerName: order.customerName,
          total: order.total,
          status: order.status,
          paymentStatus: order.paymentStatus,
          createdAt: order.orderedAt,
          country: order.country?.code || 'BR',
        }))
        setRecentOrders(orders)
      }

      // Fetch low stock products
      const productsResponse = await fetch('/api/products')
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setLowStockCount(productsData.stats?.lowStock || 0)
      }

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData, refreshKey])

  // Formata valores monetarios usando a moeda global selecionada
  const formatCurrency = (value: number) => {
    const convertedValue = value * (defaultCurrency.code === 'BRL' ? 1 :
      defaultCurrency.code === 'EUR' ? 0.18 :
      defaultCurrency.code === 'USD' ? 0.20 :
      defaultCurrency.code === 'AOA' ? 166.50 : 1)

    if (Math.abs(convertedValue) >= 1000000) {
      return `${defaultCurrency.symbol} ${(convertedValue / 1000000).toFixed(2)}M`
    }
    if (Math.abs(convertedValue) >= 1000) {
      return `${defaultCurrency.symbol} ${(convertedValue / 1000).toFixed(1)}K`
    }
    return `${defaultCurrency.symbol} ${convertedValue.toFixed(2)}`
  }

  const currencySymbol = defaultCurrency.symbol

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Loading Overlay */}
      {(isRefreshing || isLoading) && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-2xl">
          <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-card border shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium">Atualizando dados...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            {selectedCountry && (
              <Badge variant="secondary" className="gap-1.5 text-sm">
                <span>{selectedCountry.flag}</span>
                {selectedCountry.name}
              </Badge>
            )}
            <Badge variant="outline" className="gap-1 border-success/30 bg-success/10 text-success">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              Ao vivo
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {isAllSelected
              ? 'Visao geral de todos os paises'
              : `Operacoes de Cash on Delivery em ${selectedCountry?.name}`
            }
          </p>
        </div>

        {/* AI Insights Banner */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Insight:</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {stats.orders > 0
              ? `${stats.orders} pedidos no periodo com ticket medio de ${formatCurrency(stats.avgTicket)}`
              : 'Comece a receber pedidos para ver insights'
            }
          </span>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:text-primary hidden sm:flex">
            Ver mais
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children">
        <StatCard
          title="Faturamento"
          value={formatCurrency(stats.revenue)}
          change={0}
          icon={DollarSign}
          color="success"
        />
        <StatCard
          title="Lucro Liquido"
          value={formatCurrency(stats.profit)}
          change={0}
          icon={TrendingUp}
          color="primary"
        />
        <StatCard
          title="Total de Pedidos"
          value={stats.orders.toLocaleString()}
          change={0}
          icon={ShoppingCart}
          color="info"
        />
        <StatCard
          title="Ticket Medio"
          value={`${currencySymbol} ${stats.avgTicket.toFixed(2)}`}
          change={0}
          icon={Target}
          color="accent"
        />
      </div>

      {/* COD Specific Metrics */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Truck className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Metricas COD</h2>
          <Badge variant="secondary" className="text-xs">Cash on Delivery</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children">
          <StatCard
            title="Taxa de Entrega"
            value={`${stats.deliveryRate}%`}
            change={0}
            icon={Truck}
            color="success"
            description="Pedidos entregues com sucesso"
          />
          <StatCard
            title="Taxa de Devolucao"
            value={`${stats.returnRate}%`}
            change={0}
            icon={RotateCcw}
            color="warning"
            description="Menor e melhor"
          />
          <StatCard
            title="ROAS"
            value={`${stats.roas.toFixed(2)}x`}
            change={0}
            icon={Percent}
            color="primary"
            description="Retorno sobre investimento"
          />
          <StatCard
            title="Visitantes"
            value={stats.visitors.toLocaleString()}
            change={0}
            icon={Users}
            color="info"
            description="Total de sessoes"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <button className="group flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all duration-300">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div className="text-left">
            <p className="font-semibold">{stats.pending} pedidos pendentes</p>
            <p className="text-sm text-muted-foreground">Aguardando processamento</p>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </button>

        <button className="group flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card hover:border-warning/50 hover:bg-warning/5 transition-all duration-300">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10 text-warning group-hover:scale-110 transition-transform">
            <Zap className="h-6 w-6" />
          </div>
          <div className="text-left">
            <p className="font-semibold">{lowStockCount} produtos em estoque baixo</p>
            <p className="text-sm text-muted-foreground">Requer atencao</p>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-warning group-hover:translate-x-1 transition-all" />
        </button>

        <button className="group flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card hover:border-success/50 hover:bg-success/5 transition-all duration-300">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success group-hover:scale-110 transition-transform">
            <Truck className="h-6 w-6" />
          </div>
          <div className="text-left">
            <p className="font-semibold">{stats.inTransit} em transito</p>
            <p className="text-sm text-muted-foreground">Saindo para entrega hoje</p>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-success group-hover:translate-x-1 transition-all" />
        </button>
      </div>

      {/* Charts and Detailed Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={stats.chartData} />
        </div>
        <DeliveryStats
          delivered={stats.delivered}
          inTransit={stats.inTransit}
          returned={stats.returned}
          pending={stats.pending}
          failed={stats.failed}
          total={stats.total}
        />
      </div>

      {/* Traffic and Orders */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TrafficSources sources={stats.trafficSources} />
        <RecentOrders orders={recentOrders} />
      </div>
    </div>
  )
}
