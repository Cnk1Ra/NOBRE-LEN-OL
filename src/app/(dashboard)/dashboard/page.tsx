'use client'

import { useMemo } from 'react'
import { StatCard } from '@/components/dashboard/stat-card'
import { DeliveryStats } from '@/components/dashboard/delivery-stats'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { TrafficSources } from '@/components/dashboard/traffic-sources'
import { RecentOrders } from '@/components/dashboard/recent-orders'
import { useDateFilter } from '@/contexts/date-filter-context'
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

// Dados mock por periodo - em producao viriam do banco de dados
const mockDataByPeriod = {
  today: {
    revenue: 8500,
    profit: 2850,
    orders: 28,
    avgTicket: 303.57,
    deliveryRate: 82.1,
    returnRate: 10.5,
    roas: 4.2,
    visitors: 890,
    chartData: [
      { date: '08:00', revenue: 1200, profit: 400, orders: 4 },
      { date: '10:00', revenue: 2100, profit: 720, orders: 7 },
      { date: '12:00', revenue: 1800, profit: 600, orders: 6 },
      { date: '14:00', revenue: 1500, profit: 510, orders: 5 },
      { date: '16:00', revenue: 1900, profit: 620, orders: 6 },
    ],
    delivered: 18, inTransit: 5, returned: 3, pending: 2, failed: 0, total: 28,
  },
  yesterday: {
    revenue: 12400,
    profit: 4200,
    orders: 42,
    avgTicket: 295.24,
    deliveryRate: 79.5,
    returnRate: 11.8,
    roas: 3.9,
    visitors: 1250,
    chartData: [
      { date: '08:00', revenue: 1800, profit: 600, orders: 6 },
      { date: '10:00', revenue: 2800, profit: 950, orders: 9 },
      { date: '12:00', revenue: 2400, profit: 820, orders: 8 },
      { date: '14:00', revenue: 2200, profit: 740, orders: 7 },
      { date: '16:00', revenue: 3200, profit: 1090, orders: 12 },
    ],
    delivered: 28, inTransit: 6, returned: 5, pending: 2, failed: 1, total: 42,
  },
  week: {
    revenue: 65200,
    profit: 22100,
    orders: 218,
    avgTicket: 299.08,
    deliveryRate: 78.9,
    returnRate: 12.1,
    roas: 4.1,
    visitors: 6780,
    chartData: [
      { date: 'Seg', revenue: 8500, profit: 2900, orders: 28 },
      { date: 'Ter', revenue: 9200, profit: 3100, orders: 31 },
      { date: 'Qua', revenue: 10500, profit: 3600, orders: 35 },
      { date: 'Qui', revenue: 9800, profit: 3300, orders: 33 },
      { date: 'Sex', revenue: 11200, profit: 3800, orders: 38 },
      { date: 'Sab', revenue: 8500, profit: 2900, orders: 28 },
      { date: 'Dom', revenue: 7500, profit: 2500, orders: 25 },
    ],
    delivered: 172, inTransit: 22, returned: 15, pending: 6, failed: 3, total: 218,
  },
  month: {
    revenue: 126300,
    profit: 43500,
    orders: 427,
    avgTicket: 295.81,
    deliveryRate: 78.5,
    returnRate: 12.3,
    roas: 3.72,
    visitors: 13060,
    chartData: [
      { date: '01/12', revenue: 12500, profit: 4200, orders: 45 },
      { date: '02/12', revenue: 15800, profit: 5100, orders: 52 },
      { date: '03/12', revenue: 14200, profit: 4800, orders: 48 },
      { date: '04/12', revenue: 18500, profit: 6200, orders: 62 },
      { date: '05/12', revenue: 21000, profit: 7500, orders: 71 },
      { date: '06/12', revenue: 19800, profit: 6800, orders: 67 },
      { date: '07/12', revenue: 24500, profit: 8900, orders: 82 },
    ],
    delivered: 335, inTransit: 42, returned: 52, pending: 28, failed: 12, total: 427,
  },
  last_month: {
    revenue: 112500,
    profit: 38200,
    orders: 385,
    avgTicket: 292.21,
    deliveryRate: 76.2,
    returnRate: 13.8,
    roas: 3.45,
    visitors: 11800,
    chartData: [
      { date: 'Sem 1', revenue: 25000, profit: 8500, orders: 85 },
      { date: 'Sem 2', revenue: 28500, profit: 9700, orders: 98 },
      { date: 'Sem 3', revenue: 30200, profit: 10200, orders: 102 },
      { date: 'Sem 4', revenue: 28800, profit: 9800, orders: 100 },
    ],
    delivered: 293, inTransit: 0, returned: 53, pending: 0, failed: 39, total: 385,
  },
  max: {
    revenue: 1850000,
    profit: 628000,
    orders: 6250,
    avgTicket: 296.00,
    deliveryRate: 77.8,
    returnRate: 13.2,
    roas: 3.65,
    visitors: 185000,
    chartData: [
      { date: 'Jan', revenue: 95000, profit: 32000, orders: 320 },
      { date: 'Fev', revenue: 102000, profit: 34500, orders: 345 },
      { date: 'Mar', revenue: 125000, profit: 42500, orders: 420 },
      { date: 'Abr', revenue: 145000, profit: 49000, orders: 490 },
      { date: 'Mai', revenue: 168000, profit: 57000, orders: 565 },
      { date: 'Jun', revenue: 178000, profit: 60500, orders: 600 },
      { date: 'Jul', revenue: 195000, profit: 66000, orders: 655 },
      { date: 'Ago', revenue: 210000, profit: 71500, orders: 710 },
      { date: 'Set', revenue: 198000, profit: 67000, orders: 665 },
      { date: 'Out', revenue: 185000, profit: 63000, orders: 625 },
      { date: 'Nov', revenue: 125000, profit: 42500, orders: 425 },
      { date: 'Dez', revenue: 124000, profit: 42500, orders: 430 },
    ],
    delivered: 4863, inTransit: 42, returned: 825, pending: 28, failed: 492, total: 6250,
  },
  custom: {
    revenue: 45000,
    profit: 15300,
    orders: 152,
    avgTicket: 296.05,
    deliveryRate: 79.0,
    returnRate: 11.5,
    roas: 3.8,
    visitors: 4500,
    chartData: [
      { date: 'Dia 1', revenue: 9000, profit: 3050, orders: 30 },
      { date: 'Dia 2', revenue: 9500, profit: 3200, orders: 32 },
      { date: 'Dia 3', revenue: 8500, profit: 2900, orders: 28 },
      { date: 'Dia 4', revenue: 9200, profit: 3100, orders: 31 },
      { date: 'Dia 5', revenue: 8800, profit: 3050, orders: 31 },
    ],
    delivered: 120, inTransit: 15, returned: 10, pending: 5, failed: 2, total: 152,
  },
}

const mockTrafficSources = [
  {
    name: 'Facebook Ads',
    platform: 'FACEBOOK' as const,
    sessions: 4520,
    orders: 156,
    revenue: 45600,
    adSpend: 12500,
    conversionRate: 3.45,
  },
  {
    name: 'Instagram',
    platform: 'INSTAGRAM' as const,
    sessions: 2890,
    orders: 98,
    revenue: 28400,
    adSpend: 8200,
    conversionRate: 3.39,
  },
  {
    name: 'Google Ads',
    platform: 'GOOGLE' as const,
    sessions: 1560,
    orders: 45,
    revenue: 15200,
    adSpend: 5800,
    conversionRate: 2.88,
  },
  {
    name: 'TikTok Ads',
    platform: 'TIKTOK' as const,
    sessions: 3200,
    orders: 72,
    revenue: 21500,
    adSpend: 7500,
    conversionRate: 2.25,
  },
  {
    name: 'Organico',
    platform: 'ORGANIC' as const,
    sessions: 890,
    orders: 28,
    revenue: 8400,
    conversionRate: 3.15,
  },
]

const mockOrders = [
  {
    id: 'ord_a1b2c3d4',
    customerName: 'Joao Silva',
    total: 289.90,
    status: 'SHIPPED' as const,
    paymentStatus: 'PENDING' as const,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    country: 'BR',
  },
  {
    id: 'ord_e5f6g7h8',
    customerName: 'Maria Santos',
    total: 459.90,
    status: 'DELIVERED' as const,
    paymentStatus: 'PAID' as const,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    country: 'BR',
  },
  {
    id: 'ord_i9j0k1l2',
    customerName: 'Pedro Oliveira',
    total: 189.90,
    status: 'PENDING' as const,
    paymentStatus: 'PENDING' as const,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    country: 'PT',
  },
  {
    id: 'ord_m3n4o5p6',
    customerName: 'Ana Costa',
    total: 599.90,
    status: 'RETURNED' as const,
    paymentStatus: 'REFUNDED' as const,
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    country: 'BR',
  },
  {
    id: 'ord_q7r8s9t0',
    customerName: 'Carlos Ferreira',
    total: 349.90,
    status: 'OUT_FOR_DELIVERY' as const,
    paymentStatus: 'PENDING' as const,
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    country: 'BR',
  },
]

// Calcula variacao percentual entre periodos
function calculateChange(current: number, previous: number): number {
  if (previous === 0) return 100
  return ((current - previous) / previous) * 100
}

// Funcao para gerar variacao aleatoria nos dados (simula refresh)
function addRandomVariation(data: typeof mockDataByPeriod.month, seed: number) {
  const variation = (value: number, percent: number = 5) => {
    const random = Math.sin(seed * value) * 0.5 + 0.5 // Deterministic random based on seed
    const change = value * (percent / 100) * (random * 2 - 1)
    return Math.round(value + change)
  }
  return {
    ...data,
    revenue: variation(data.revenue, 3),
    profit: variation(data.profit, 3),
    orders: variation(data.orders, 2),
    visitors: variation(data.visitors, 4),
  }
}

export default function DashboardPage() {
  // Usa o contexto global de filtro de data
  const { period, refreshKey, isRefreshing } = useDateFilter()

  // Obtem dados baseados no periodo selecionado (com variacao no refresh)
  const currentData = useMemo(() => {
    const baseData = mockDataByPeriod[period] || mockDataByPeriod.month
    return addRandomVariation(baseData, refreshKey)
  }, [period, refreshKey])

  // Obtem dados do periodo anterior para calcular variacao
  const previousData = useMemo(() => {
    switch (period) {
      case 'today': return mockDataByPeriod.yesterday
      case 'week': return mockDataByPeriod.last_month
      case 'month': return mockDataByPeriod.last_month
      default: return mockDataByPeriod.last_month
    }
  }, [period])

  // Calcula variacoes
  const changes = useMemo(() => ({
    revenue: calculateChange(currentData.revenue, previousData.revenue),
    profit: calculateChange(currentData.profit, previousData.profit),
    orders: calculateChange(currentData.orders, previousData.orders),
    avgTicket: calculateChange(currentData.avgTicket, previousData.avgTicket),
    deliveryRate: currentData.deliveryRate - previousData.deliveryRate,
    returnRate: previousData.returnRate - currentData.returnRate,
    roas: calculateChange(currentData.roas, previousData.roas),
    visitors: calculateChange(currentData.visitors, previousData.visitors),
  }), [currentData, previousData])

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(2)}M`
    }
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}K`
    }
    return `R$ ${value.toFixed(2)}`
  }

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Loading Overlay */}
      {isRefreshing && (
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
            <Badge variant="outline" className="gap-1 border-success/30 bg-success/10 text-success">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              Ao vivo
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Visao geral das suas operacoes de Cash on Delivery
          </p>
        </div>

        {/* AI Insights Banner */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Insight:</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {period === 'max'
              ? `Total acumulado: ${formatCurrency(currentData.revenue)} com ${currentData.orders.toLocaleString()} pedidos!`
              : `Variacao: ${changes.revenue >= 0 ? '+' : ''}${changes.revenue.toFixed(1)}% vs periodo anterior`
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
          value={formatCurrency(currentData.revenue)}
          change={changes.revenue}
          icon={DollarSign}
          color="success"
        />
        <StatCard
          title="Lucro Liquido"
          value={formatCurrency(currentData.profit)}
          change={changes.profit}
          icon={TrendingUp}
          color="primary"
        />
        <StatCard
          title="Total de Pedidos"
          value={currentData.orders.toLocaleString()}
          change={changes.orders}
          icon={ShoppingCart}
          color="info"
        />
        <StatCard
          title="Ticket Medio"
          value={`R$ ${currentData.avgTicket.toFixed(2)}`}
          change={changes.avgTicket}
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
            value={`${currentData.deliveryRate}%`}
            change={changes.deliveryRate}
            icon={Truck}
            color="success"
            description="Pedidos entregues com sucesso"
          />
          <StatCard
            title="Taxa de Devolucao"
            value={`${currentData.returnRate}%`}
            change={changes.returnRate}
            icon={RotateCcw}
            color="warning"
            description="Menor e melhor"
          />
          <StatCard
            title="ROAS"
            value={`${currentData.roas.toFixed(2)}x`}
            change={changes.roas}
            icon={Percent}
            color="primary"
            description="Retorno sobre investimento"
          />
          <StatCard
            title="Visitantes"
            value={currentData.visitors.toLocaleString()}
            change={changes.visitors}
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
            <p className="font-semibold">{currentData.pending} pedidos pendentes</p>
            <p className="text-sm text-muted-foreground">Aguardando processamento</p>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </button>

        <button className="group flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card hover:border-warning/50 hover:bg-warning/5 transition-all duration-300">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10 text-warning group-hover:scale-110 transition-transform">
            <Zap className="h-6 w-6" />
          </div>
          <div className="text-left">
            <p className="font-semibold">3 produtos em estoque baixo</p>
            <p className="text-sm text-muted-foreground">Requer atencao</p>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-warning group-hover:translate-x-1 transition-all" />
        </button>

        <button className="group flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card hover:border-success/50 hover:bg-success/5 transition-all duration-300">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success group-hover:scale-110 transition-transform">
            <Truck className="h-6 w-6" />
          </div>
          <div className="text-left">
            <p className="font-semibold">{currentData.inTransit} em transito</p>
            <p className="text-sm text-muted-foreground">Saindo para entrega hoje</p>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-success group-hover:translate-x-1 transition-all" />
        </button>
      </div>

      {/* Charts and Detailed Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={currentData.chartData} />
        </div>
        <DeliveryStats
          delivered={currentData.delivered}
          inTransit={currentData.inTransit}
          returned={currentData.returned}
          pending={currentData.pending}
          failed={currentData.failed}
          total={currentData.total}
        />
      </div>

      {/* Traffic and Orders */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TrafficSources sources={mockTrafficSources} />
        <RecentOrders orders={mockOrders} />
      </div>
    </div>
  )
}
