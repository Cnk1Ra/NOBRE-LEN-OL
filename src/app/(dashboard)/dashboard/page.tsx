'use client'

import { StatCard } from '@/components/dashboard/stat-card'
import { DeliveryStats } from '@/components/dashboard/delivery-stats'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { TrafficSources } from '@/components/dashboard/traffic-sources'
import { RecentOrders } from '@/components/dashboard/recent-orders'
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
} from 'lucide-react'

// Dados de exemplo - em produção viriam do banco de dados
const mockChartData = [
  { date: '01/12', revenue: 12500, profit: 4200, orders: 45 },
  { date: '02/12', revenue: 15800, profit: 5100, orders: 52 },
  { date: '03/12', revenue: 14200, profit: 4800, orders: 48 },
  { date: '04/12', revenue: 18500, profit: 6200, orders: 62 },
  { date: '05/12', revenue: 21000, profit: 7500, orders: 71 },
  { date: '06/12', revenue: 19800, profit: 6800, orders: 67 },
  { date: '07/12', revenue: 24500, profit: 8900, orders: 82 },
]

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
    name: 'Orgânico',
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
    customerName: 'João Silva',
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

export default function DashboardPage() {
  const totalRevenue = 126300
  const totalAdSpend = 34000
  const roas = totalRevenue / totalAdSpend

  return (
    <div className="space-y-8 animate-fade-in">
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
            Visão geral das suas operações de Cash on Delivery
          </p>
        </div>

        {/* AI Insights Banner */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Insight:</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Suas vendas cresceram 12% esta semana
            </span>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:text-primary">
              Ver mais
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children">
        <StatCard
          title="Faturamento"
          value="R$ 126.300"
          change={12.5}
          icon={DollarSign}
          color="success"
        />
        <StatCard
          title="Lucro Líquido"
          value="R$ 43.500"
          change={8.2}
          icon={TrendingUp}
          color="primary"
        />
        <StatCard
          title="Total de Pedidos"
          value="427"
          change={15.3}
          icon={ShoppingCart}
          color="info"
        />
        <StatCard
          title="Ticket Médio"
          value="R$ 295,81"
          change={-2.1}
          icon={Target}
          color="accent"
        />
      </div>

      {/* COD Specific Metrics */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Truck className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Métricas COD</h2>
          <Badge variant="secondary" className="text-xs">Cash on Delivery</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children">
          <StatCard
            title="Taxa de Entrega"
            value="78.5%"
            change={3.2}
            icon={Truck}
            color="success"
            description="Pedidos entregues com sucesso"
          />
          <StatCard
            title="Taxa de Devolução"
            value="12.3%"
            change={-1.8}
            icon={RotateCcw}
            color="warning"
            description="Menor é melhor"
          />
          <StatCard
            title="ROAS"
            value={`${roas.toFixed(2)}x`}
            change={5.4}
            icon={Percent}
            color="primary"
            description="Retorno sobre investimento"
          />
          <StatCard
            title="Visitantes"
            value="13.060"
            change={22.1}
            icon={Users}
            color="info"
            description="Total de sessões"
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
            <p className="font-semibold">12 pedidos pendentes</p>
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
            <p className="text-sm text-muted-foreground">Requer atenção</p>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-warning group-hover:translate-x-1 transition-all" />
        </button>

        <button className="group flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card hover:border-success/50 hover:bg-success/5 transition-all duration-300">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success group-hover:scale-110 transition-transform">
            <Truck className="h-6 w-6" />
          </div>
          <div className="text-left">
            <p className="font-semibold">42 em trânsito</p>
            <p className="text-sm text-muted-foreground">Saindo para entrega hoje</p>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-success group-hover:translate-x-1 transition-all" />
        </button>
      </div>

      {/* Charts and Detailed Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={mockChartData} />
        </div>
        <DeliveryStats
          delivered={335}
          inTransit={42}
          returned={52}
          pending={28}
          failed={12}
          total={427}
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
