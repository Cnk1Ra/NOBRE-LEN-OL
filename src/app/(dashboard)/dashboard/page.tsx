import { StatCard } from '@/components/dashboard/stat-card'
import { DeliveryStats } from '@/components/dashboard/delivery-stats'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { TrafficSources } from '@/components/dashboard/traffic-sources'
import { RecentOrders } from '@/components/dashboard/recent-orders'
import {
  DollarSign,
  ShoppingCart,
  Truck,
  TrendingUp,
  Target,
  Users,
  RotateCcw,
  Percent,
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
  // Métricas calculadas (em produção, viriam de queries agregadas)
  const totalRevenue = 126300
  const totalProfit = 43500
  const totalOrders = 427
  const deliveryRate = 78.5
  const returnRate = 12.3
  const averageTicket = totalRevenue / totalOrders
  const totalAdSpend = 34000
  const roas = totalRevenue / totalAdSpend

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral das suas operações de Cash on Delivery
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Faturamento"
          value="R$ 126.300,00"
          change={12.5}
          icon={DollarSign}
          iconColor="text-green-500"
        />
        <StatCard
          title="Lucro Líquido"
          value="R$ 43.500,00"
          change={8.2}
          icon={TrendingUp}
          iconColor="text-emerald-500"
        />
        <StatCard
          title="Total de Pedidos"
          value="427"
          change={15.3}
          icon={ShoppingCart}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Ticket Médio"
          value="R$ 295,81"
          change={-2.1}
          icon={Target}
          iconColor="text-purple-500"
        />
      </div>

      {/* COD Specific Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Taxa de Entrega"
          value="78.5%"
          change={3.2}
          icon={Truck}
          iconColor="text-green-500"
          description="Pedidos entregues com sucesso"
        />
        <StatCard
          title="Taxa de Devolução"
          value="12.3%"
          change={-1.8}
          icon={RotateCcw}
          iconColor="text-orange-500"
          description="Menor é melhor"
        />
        <StatCard
          title="ROAS"
          value={`${roas.toFixed(2)}x`}
          change={5.4}
          icon={Percent}
          iconColor="text-indigo-500"
          description="Retorno sobre investimento em ads"
        />
        <StatCard
          title="Visitantes"
          value="13.060"
          change={22.1}
          icon={Users}
          iconColor="text-cyan-500"
          description="Total de sessões no período"
        />
      </div>

      {/* Charts and Detailed Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        <RevenueChart data={mockChartData} />
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
