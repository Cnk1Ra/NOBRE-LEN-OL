'use client'

import { useMemo } from 'react'
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

// Dados zerados - em producao viriam do banco de dados
const emptyData = {
  revenue: 0,
  profit: 0,
  orders: 0,
  avgTicket: 0,
  deliveryRate: 0,
  returnRate: 0,
  roas: 0,
  visitors: 0,
  chartData: [] as { date: string; revenue: number; profit: number; orders: number }[],
  delivered: 0, inTransit: 0, returned: 0, pending: 0, failed: 0, total: 0,
}

const mockDataByPeriod = {
  today: { ...emptyData },
  yesterday: { ...emptyData },
  week: { ...emptyData },
  month: { ...emptyData },
  last_month: { ...emptyData },
  max: { ...emptyData },
  custom: { ...emptyData },
}

// Fontes de trafego zeradas - dados reais virao das integracoes
const mockTrafficSources: {
  name: string
  platform: 'FACEBOOK' | 'INSTAGRAM' | 'GOOGLE' | 'TIKTOK' | 'ORGANIC'
  sessions: number
  orders: number
  revenue: number
  adSpend?: number
  conversionRate: number
}[] = []

// Pedidos zerados - dados reais virao do banco
const mockOrders: {
  id: string
  customerName: string
  total: number
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'RETURNED' | 'OUT_FOR_DELIVERY'
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED'
  createdAt: string
  country: string
}[] = []

// Calcula variacao percentual entre periodos
function calculateChange(current: number, previous: number): number {
  if (previous === 0 && current === 0) return 0
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
  const { selectedCountry, isAllSelected, getCountryData, formatCurrency: formatCurrencyGlobal, defaultCurrency } = useCountry()

  // Obtem dados baseados no periodo e pais selecionado
  const currentData = useMemo(() => {
    const countryCode = isAllSelected ? 'ALL' : (selectedCountry?.code || 'ALL')
    const countryData = getCountryData(countryCode)

    // Aplica multiplicador baseado no periodo
    const periodMultipliers: Record<string, number> = {
      today: 0.035,
      yesterday: 0.04,
      week: 0.25,
      month: 1,
      last_month: 0.95,
      max: 12,
      custom: 0.5,
    }

    const multiplier = periodMultipliers[period] || 1
    const baseData = {
      ...mockDataByPeriod[period],
      revenue: Math.round(countryData.revenue * multiplier),
      profit: Math.round(countryData.profit * multiplier),
      orders: Math.round(countryData.orders * multiplier),
      avgTicket: countryData.avgTicket,
      deliveryRate: countryData.deliveryRate,
      returnRate: countryData.returnRate,
      roas: countryData.roas,
      visitors: Math.round(countryData.visitors * multiplier),
    }

    return addRandomVariation(baseData, refreshKey)
  }, [period, refreshKey, selectedCountry, isAllSelected, getCountryData])

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

  // Formata valores monetarios usando a moeda global selecionada
  const formatCurrency = (value: number) => {
    // Primeiro converte o valor usando a funcao global
    const convertedValue = value * (defaultCurrency.code === 'BRL' ? 1 :
      defaultCurrency.code === 'EUR' ? 0.18 :
      defaultCurrency.code === 'USD' ? 0.20 :
      defaultCurrency.code === 'AOA' ? 166.50 : 1)

    // Formata com abreviacao para valores grandes
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
          value={`${currencySymbol} ${currentData.avgTicket.toFixed(2)}`}
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
