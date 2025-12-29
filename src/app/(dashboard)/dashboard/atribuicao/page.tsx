'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  ShoppingCart,
  Truck,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Users,
  MapPin,
  Smartphone,
  Monitor,
  RefreshCw,
  Bell,
  ChevronDown,
  ChevronRight,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Facebook,
  Globe,
  Phone,
  MessageCircle,
  AlertTriangle,
  Eye,
  MousePointer,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  X,
  Volume2,
  ExternalLink,
} from 'lucide-react'
import { useTracking, CODOrder, CODStatus, CODCampaignMetrics } from '@/contexts/tracking-context'
import { cn } from '@/lib/utils'

// Status configuration
const statusConfig: Record<CODStatus, { label: string; color: string; icon: typeof Clock; bgColor: string }> = {
  pending: { label: 'Pendente', color: 'text-yellow-600', icon: Clock, bgColor: 'bg-yellow-500/10' },
  confirmed: { label: 'Confirmado', color: 'text-blue-600', icon: Phone, bgColor: 'bg-blue-500/10' },
  processing: { label: 'Separando', color: 'text-purple-600', icon: Package, bgColor: 'bg-purple-500/10' },
  shipped: { label: 'Enviado', color: 'text-indigo-600', icon: Truck, bgColor: 'bg-indigo-500/10' },
  in_transit: { label: 'Em Trânsito', color: 'text-cyan-600', icon: Truck, bgColor: 'bg-cyan-500/10' },
  out_for_delivery: { label: 'Saiu p/ Entrega', color: 'text-orange-600', icon: Truck, bgColor: 'bg-orange-500/10' },
  delivered: { label: 'Entregue', color: 'text-green-600', icon: CheckCircle, bgColor: 'bg-green-500/10' },
  partial_delivery: { label: 'Entrega Parcial', color: 'text-amber-600', icon: Package, bgColor: 'bg-amber-500/10' },
  returned: { label: 'Devolvido', color: 'text-red-600', icon: XCircle, bgColor: 'bg-red-500/10' },
  refused: { label: 'Recusado', color: 'text-red-600', icon: XCircle, bgColor: 'bg-red-500/10' },
  not_found: { label: 'Não Encontrado', color: 'text-gray-600', icon: AlertTriangle, bgColor: 'bg-gray-500/10' },
  rescheduled: { label: 'Reagendado', color: 'text-amber-600', icon: Clock, bgColor: 'bg-amber-500/10' },
  cancelled: { label: 'Cancelado', color: 'text-gray-600', icon: X, bgColor: 'bg-gray-500/10' },
}

const platformConfig: Record<string, { label: string; color: string; icon: typeof Facebook }> = {
  facebook: { label: 'Facebook', color: 'text-[#1877F2]', icon: Facebook },
  google: { label: 'Google', color: 'text-[#EA4335]', icon: Globe },
  tiktok: { label: 'TikTok', color: 'text-black dark:text-white', icon: Activity },
  kwai: { label: 'Kwai', color: 'text-[#FF7E00]', icon: Activity },
  taboola: { label: 'Taboola', color: 'text-[#005BE2]', icon: Globe },
  organic: { label: 'Orgânico', color: 'text-green-600', icon: Users },
  direct: { label: 'Direto', color: 'text-gray-600', icon: Globe },
  whatsapp: { label: 'WhatsApp', color: 'text-[#25D366]', icon: MessageCircle },
  referral: { label: 'Referência', color: 'text-purple-600', icon: Users },
  unknown: { label: 'Desconhecido', color: 'text-gray-400', icon: Globe },
}

export default function AtribuicaoPage() {
  const {
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
    newOrderAlert,
    clearNewOrderAlert,
    refreshData,
  } = useTracking()

  const [activeTab, setActiveTab] = useState('overview')
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set())
  const [expandedAdsets, setExpandedAdsets] = useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewOrderAlert, setShowNewOrderAlert] = useState(false)

  // Handle new order alert
  useEffect(() => {
    if (newOrderAlert) {
      setShowNewOrderAlert(true)
      const timer = setTimeout(() => {
        setShowNewOrderAlert(false)
        clearNewOrderAlert()
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [newOrderAlert, clearNewOrderAlert])

  const toggleCampaign = (id: string) => {
    setExpandedCampaigns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const toggleAdset = (id: string) => {
    setExpandedAdsets(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // Filter orders
  const filteredOrders = recentOrders.filter(order => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false
    if (platformFilter !== 'all' && order.attribution.platform !== platformFilter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        order.order_id.toLowerCase().includes(query) ||
        order.customer.name.toLowerCase().includes(query) ||
        order.customer.phone.includes(query) ||
        order.attribution.campaign_name.toLowerCase().includes(query)
      )
    }
    return true
  })

  const formatCurrency = (value: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
    }).format(value)
  }

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
    return `${Math.floor(seconds / 86400)}d`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // COD Funnel Stats
  const funnelStats = {
    total: stats.period.orders,
    confirmed: orders.filter(o => o.confirmation.confirmed).length,
    shipped: orders.filter(o => ['shipped', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'refused', 'not_found'].includes(o.status)).length,
    delivered: stats.period.delivered,
    returned: stats.period.returned,
  }

  return (
    <div className="space-y-6">
      {/* New Order Alert */}
      {showNewOrderAlert && newOrderAlert && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
          <Card className="border-green-500 bg-green-500/10 w-80">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
                    <ShoppingCart className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-600">Novo Pedido!</p>
                    <p className="text-sm font-bold">{formatCurrency(newOrderAlert.total)}</p>
                    <p className="text-xs text-muted-foreground">
                      {newOrderAlert.attribution.campaign_name || 'Orgânico'}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowNewOrderAlert(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Atribuição COD</h1>
          <p className="text-muted-foreground">
            Tracking e atribuição de vendas Cash On Delivery em tempo real
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={attributionWindow.toString()} onValueChange={(v) => setAttributionWindow(parseInt(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 dia</SelectItem>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="14">14 dias</SelectItem>
              <SelectItem value="28">28 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
            </SelectContent>
          </Select>
          <Select value={attributionModel} onValueChange={(v: 'first-click' | 'last-click') => setAttributionModel(v)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-click">Último Clique</SelectItem>
              <SelectItem value="first-click">Primeiro Clique</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* COD Stats Cards - Today */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Pedidos Hoje</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.today.orders}</p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.today.revenue)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-indigo-500" />
                <span className="text-sm text-muted-foreground">Confirmados</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.today.confirmed}</p>
              <p className="text-xs text-muted-foreground">
                {stats.today.orders > 0 ? ((stats.today.confirmed / stats.today.orders) * 100).toFixed(0) : 0}% taxa
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-cyan-500" />
                <span className="text-sm text-muted-foreground">Enviados</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.today.shipped}</p>
              <p className="text-xs text-muted-foreground">em trânsito</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-green-500/50">
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Entregues</span>
              </div>
              <p className="text-2xl font-bold mt-1 text-green-600">{stats.today.delivered}</p>
              <p className="text-xs text-green-600 font-medium">
                {formatCurrency(stats.today.revenue_delivered)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-red-500/50">
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-muted-foreground">Devolvidos</span>
              </div>
              <p className="text-2xl font-bold mt-1 text-red-600">{stats.today.returned}</p>
              <p className="text-xs text-red-600">
                {stats.today.shipped > 0 ? ((stats.today.returned / stats.today.shipped) * 100).toFixed(0) : 0}% taxa
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-muted-foreground">Taxa Entrega</span>
              </div>
              <p className="text-2xl font-bold mt-1 text-emerald-600">
                {stats.today.delivery_rate.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">entregas/enviados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* COD Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Funil COD - Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2">
            {/* Pedidos */}
            <div className="flex-1 text-center">
              <div className="h-24 bg-blue-500/10 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 bg-blue-500/30 transition-all" style={{ height: '100%' }} />
                <ShoppingCart className="h-6 w-6 text-blue-500 relative z-10" />
                <p className="text-2xl font-bold relative z-10">{funnelStats.total}</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Pedidos</p>
              <p className="text-xs text-muted-foreground">100%</p>
            </div>

            <ChevronRight className="h-5 w-5 text-muted-foreground" />

            {/* Confirmados */}
            <div className="flex-1 text-center">
              <div className="h-24 bg-indigo-500/10 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-indigo-500/30 transition-all"
                  style={{ height: `${(funnelStats.confirmed / funnelStats.total) * 100}%` }}
                />
                <Phone className="h-6 w-6 text-indigo-500 relative z-10" />
                <p className="text-2xl font-bold relative z-10">{funnelStats.confirmed}</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Confirmados</p>
              <p className="text-xs text-muted-foreground">
                {((funnelStats.confirmed / funnelStats.total) * 100).toFixed(0)}%
              </p>
            </div>

            <ChevronRight className="h-5 w-5 text-muted-foreground" />

            {/* Enviados */}
            <div className="flex-1 text-center">
              <div className="h-24 bg-cyan-500/10 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-cyan-500/30 transition-all"
                  style={{ height: `${(funnelStats.shipped / funnelStats.total) * 100}%` }}
                />
                <Truck className="h-6 w-6 text-cyan-500 relative z-10" />
                <p className="text-2xl font-bold relative z-10">{funnelStats.shipped}</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Enviados</p>
              <p className="text-xs text-muted-foreground">
                {((funnelStats.shipped / funnelStats.total) * 100).toFixed(0)}%
              </p>
            </div>

            <ChevronRight className="h-5 w-5 text-muted-foreground" />

            {/* Entregues */}
            <div className="flex-1 text-center">
              <div className="h-24 bg-green-500/10 rounded-lg flex flex-col items-center justify-center relative overflow-hidden border-2 border-green-500/30">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-green-500/30 transition-all"
                  style={{ height: `${(funnelStats.delivered / funnelStats.total) * 100}%` }}
                />
                <CheckCircle className="h-6 w-6 text-green-500 relative z-10" />
                <p className="text-2xl font-bold relative z-10 text-green-600">{funnelStats.delivered}</p>
              </div>
              <p className="text-sm font-medium text-green-600 mt-2">Entregues</p>
              <p className="text-xs text-green-600 font-medium">
                {((funnelStats.delivered / funnelStats.total) * 100).toFixed(0)}%
              </p>
            </div>

            <ChevronRight className="h-5 w-5 text-muted-foreground" />

            {/* Devolvidos */}
            <div className="flex-1 text-center">
              <div className="h-24 bg-red-500/10 rounded-lg flex flex-col items-center justify-center relative overflow-hidden border-2 border-red-500/30">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-red-500/30 transition-all"
                  style={{ height: `${(funnelStats.returned / funnelStats.total) * 100}%` }}
                />
                <XCircle className="h-6 w-6 text-red-500 relative z-10" />
                <p className="text-2xl font-bold relative z-10 text-red-600">{funnelStats.returned}</p>
              </div>
              <p className="text-sm font-medium text-red-600 mt-2">Devolvidos</p>
              <p className="text-xs text-red-600 font-medium">
                {((funnelStats.returned / funnelStats.total) * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Receita Esperada</p>
              <p className="text-xl font-bold">{formatCurrency(stats.period.revenue_expected)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Receita Real (Entregue)</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(stats.period.revenue_delivered)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Taxa de Entrega</p>
              <p className="text-xl font-bold text-emerald-600">{stats.period.delivery_rate.toFixed(1)}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Taxa de Devolução</p>
              <p className="text-xl font-bold text-red-600">{stats.period.return_rate.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="mr-2 h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="realtime">
            <Activity className="mr-2 h-4 w-4" />
            Tempo Real
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            <Target className="mr-2 h-4 w-4" />
            Campanhas
          </TabsTrigger>
          <TabsTrigger value="platforms">
            <PieChart className="mr-2 h-4 w-4" />
            Plataformas
          </TabsTrigger>
          <TabsTrigger value="countries">
            <MapPin className="mr-2 h-4 w-4" />
            Países
          </TabsTrigger>
        </TabsList>

        {/* VISÃO GERAL */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle>Top Campanhas (ROAS Real)</CardTitle>
                <CardDescription>Baseado em entregas confirmadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaignMetrics.slice(0, 5).map((campaign, index) => (
                    <div key={campaign.campaign_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                        <div>
                          <p className="font-medium">{campaign.campaign_name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {platformConfig[campaign.platform]?.label || campaign.platform}
                            </Badge>
                            <span>{campaign.orders_delivered} entregas</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-lg font-bold",
                          campaign.roas_real >= 2 ? "text-green-600" : campaign.roas_real >= 1 ? "text-yellow-600" : "text-red-600"
                        )}>
                          {campaign.roas_real.toFixed(2)}x
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(campaign.revenue_delivered)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Platform Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance por Plataforma</CardTitle>
                <CardDescription>Taxa de entrega e receita</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.byPlatform)
                    .sort(([,a], [,b]) => b.revenue - a.revenue)
                    .map(([platform, data]) => {
                      const config = platformConfig[platform]
                      const Icon = config?.icon || Globe
                      return (
                        <div key={platform} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center bg-muted")}>
                              <Icon className={cn("h-4 w-4", config?.color)} />
                            </div>
                            <div>
                              <p className="font-medium">{config?.label || platform}</p>
                              <p className="text-xs text-muted-foreground">
                                {data.orders} pedidos • {data.delivered} entregues
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(data.revenue)}</p>
                            <p className={cn(
                              "text-xs font-medium",
                              data.delivery_rate >= 70 ? "text-green-600" : data.delivery_rate >= 50 ? "text-yellow-600" : "text-red-600"
                            )}>
                              {data.delivery_rate.toFixed(0)}% entrega
                            </p>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Deliveries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-500" />
                Últimas Entregas Confirmadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orders
                  .filter(o => o.status === 'delivered')
                  .slice(0, 10)
                  .map(order => (
                    <div key={order.order_id} className="flex items-center justify-between p-3 bg-green-500/5 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">{order.order_id}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{order.customer.city}, {order.customer.country}</span>
                            <span>•</span>
                            <span>{order.attribution.campaign_name || 'Orgânico'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(order.total)}</p>
                        <p className="text-xs text-muted-foreground">{formatTimeAgo(order.delivered_at!)}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TEMPO REAL */}
        <TabsContent value="realtime" className="space-y-6 mt-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por ID, nome, telefone, campanha..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Status</SelectItem>
                    {Object.entries(statusConfig).map(([value, config]) => (
                      <SelectItem key={value} value={value}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Plataformas</SelectItem>
                    {Object.entries(platformConfig).map(([value, config]) => (
                      <SelectItem key={value} value={value}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Pedidos em Tempo Real
                <Badge variant="secondary" className="ml-2">
                  {filteredOrders.length} pedidos
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredOrders.map(order => {
                  const statusCfg = statusConfig[order.status]
                  const platformCfg = platformConfig[order.attribution.platform]
                  const StatusIcon = statusCfg.icon
                  const PlatformIcon = platformCfg?.icon || Globe

                  return (
                    <div
                      key={order.order_id}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border transition-colors",
                        order.status === 'delivered' && "bg-green-500/5 border-green-500/20",
                        ['returned', 'refused', 'not_found'].includes(order.status) && "bg-red-500/5 border-red-500/20",
                        order.status === 'pending' && "bg-yellow-500/5 border-yellow-500/20"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        {/* Status Icon */}
                        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", statusCfg.bgColor)}>
                          <StatusIcon className={cn("h-5 w-5", statusCfg.color)} />
                        </div>

                        {/* Order Info */}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{order.order_id}</p>
                            <Badge variant="outline" className={statusCfg.color}>
                              {statusCfg.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <PlatformIcon className={cn("h-3 w-3", platformCfg?.color)} />
                              {order.attribution.campaign_name || 'Orgânico'}
                            </span>
                            <span>•</span>
                            <span>{order.customer.city}, {order.customer.country}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              {order.attribution.device === 'mobile' ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                              {order.attribution.device}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Product */}
                        <div className="text-right">
                          <p className="text-sm font-medium">{order.products[0]?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.products[0]?.quantity}x {formatCurrency(order.products[0]?.price || 0)}
                          </p>
                        </div>

                        {/* Total */}
                        <div className="text-right min-w-[80px]">
                          <p className={cn(
                            "text-lg font-bold",
                            order.status === 'delivered' && "text-green-600"
                          )}>
                            {formatCurrency(order.total)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(order.created_at)}
                          </p>
                        </div>

                        {/* CAPI Status */}
                        <div className="flex items-center gap-1">
                          {order.capi.purchase_sent && (
                            <div className="h-2 w-2 rounded-full bg-green-500" title="CAPI Enviado" />
                          )}
                          {!order.capi.purchase_sent && (
                            <div className="h-2 w-2 rounded-full bg-gray-300" title="CAPI Pendente" />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CAMPANHAS */}
        <TabsContent value="campaigns" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Métricas por Campanha (COD)</CardTitle>
              <CardDescription>
                Clique na campanha para ver breakdown por Adset e Anúncio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Campanha</TableHead>
                    <TableHead className="text-center">Pedidos</TableHead>
                    <TableHead className="text-center">Entregues</TableHead>
                    <TableHead className="text-center">Devolvidos</TableHead>
                    <TableHead className="text-center">Taxa Entrega</TableHead>
                    <TableHead className="text-right">Receita Real</TableHead>
                    <TableHead className="text-right">Custo Ads</TableHead>
                    <TableHead className="text-right">CPA Entregue</TableHead>
                    <TableHead className="text-right">ROAS Real</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignMetrics.map(campaign => {
                    const platformCfg = platformConfig[campaign.platform]
                    const PlatformIcon = platformCfg?.icon || Globe
                    const isExpanded = expandedCampaigns.has(campaign.campaign_id)

                    return (
                      <>
                        <TableRow
                          key={campaign.campaign_id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleCampaign(campaign.campaign_id)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              <PlatformIcon className={cn("h-4 w-4", platformCfg?.color)} />
                              <span className="font-medium">{campaign.campaign_name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{campaign.orders_total}</TableCell>
                          <TableCell className="text-center text-green-600 font-medium">
                            {campaign.orders_delivered}
                          </TableCell>
                          <TableCell className="text-center text-red-600">
                            {campaign.orders_returned}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={cn(
                              "font-medium",
                              campaign.delivery_rate >= 70 ? "text-green-600" : campaign.delivery_rate >= 50 ? "text-yellow-600" : "text-red-600"
                            )}>
                              {campaign.delivery_rate.toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            {formatCurrency(campaign.revenue_delivered)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatCurrency(campaign.ad_cost)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(campaign.cpa_delivered)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={cn(
                              "font-bold",
                              campaign.roas_real >= 2 ? "text-green-600" : campaign.roas_real >= 1 ? "text-yellow-600" : "text-red-600"
                            )}>
                              {campaign.roas_real.toFixed(2)}x
                            </span>
                          </TableCell>
                        </TableRow>

                        {/* Adsets */}
                        {isExpanded && campaign.adsets.map(adset => {
                          const isAdsetExpanded = expandedAdsets.has(adset.adset_id)

                          return (
                            <>
                              <TableRow
                                key={adset.adset_id}
                                className="bg-muted/30 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleAdset(adset.adset_id)
                                }}
                              >
                                <TableCell className="pl-10">
                                  <div className="flex items-center gap-2">
                                    {isAdsetExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                    <span className="text-sm">{adset.adset_name}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center text-sm">{adset.orders_total}</TableCell>
                                <TableCell className="text-center text-sm text-green-600">{adset.orders_delivered}</TableCell>
                                <TableCell className="text-center text-sm text-red-600">{adset.orders_returned}</TableCell>
                                <TableCell className="text-center text-sm">
                                  <span className={cn(
                                    adset.delivery_rate >= 70 ? "text-green-600" : adset.delivery_rate >= 50 ? "text-yellow-600" : "text-red-600"
                                  )}>
                                    {adset.delivery_rate.toFixed(1)}%
                                  </span>
                                </TableCell>
                                <TableCell className="text-right text-sm text-green-600">{formatCurrency(adset.revenue_delivered)}</TableCell>
                                <TableCell className="text-right text-sm text-muted-foreground">{formatCurrency(adset.ad_cost)}</TableCell>
                                <TableCell className="text-right text-sm">{formatCurrency(adset.cpa_delivered)}</TableCell>
                                <TableCell className="text-right text-sm">
                                  <span className={cn(
                                    adset.roas_real >= 2 ? "text-green-600" : adset.roas_real >= 1 ? "text-yellow-600" : "text-red-600"
                                  )}>
                                    {adset.roas_real.toFixed(2)}x
                                  </span>
                                </TableCell>
                              </TableRow>

                              {/* Ads */}
                              {isAdsetExpanded && adset.ads.map(ad => (
                                <TableRow key={ad.ad_id} className="bg-muted/10">
                                  <TableCell className="pl-16">
                                    <span className="text-xs">{ad.ad_name}</span>
                                  </TableCell>
                                  <TableCell className="text-center text-xs">{ad.orders_total}</TableCell>
                                  <TableCell className="text-center text-xs text-green-600">{ad.orders_delivered}</TableCell>
                                  <TableCell className="text-center text-xs text-red-600">{ad.orders_returned}</TableCell>
                                  <TableCell className="text-center text-xs">
                                    <span className={cn(
                                      ad.delivery_rate >= 70 ? "text-green-600" : ad.delivery_rate >= 50 ? "text-yellow-600" : "text-red-600"
                                    )}>
                                      {ad.delivery_rate.toFixed(1)}%
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right text-xs text-green-600">{formatCurrency(ad.revenue_delivered)}</TableCell>
                                  <TableCell className="text-right text-xs text-muted-foreground">{formatCurrency(ad.ad_cost)}</TableCell>
                                  <TableCell className="text-right text-xs">{formatCurrency(ad.cpa_delivered)}</TableCell>
                                  <TableCell className="text-right text-xs">
                                    <span className={cn(
                                      ad.roas_real >= 2 ? "text-green-600" : ad.roas_real >= 1 ? "text-yellow-600" : "text-red-600"
                                    )}>
                                      {ad.roas_real.toFixed(2)}x
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </>
                          )
                        })}
                      </>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PLATAFORMAS */}
        <TabsContent value="platforms" className="space-y-6 mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(stats.byPlatform)
              .sort(([,a], [,b]) => b.revenue - a.revenue)
              .map(([platform, data]) => {
                const config = platformConfig[platform]
                const Icon = config?.icon || Globe

                return (
                  <Card key={platform}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Icon className={cn("h-5 w-5", config?.color)} />
                        {config?.label || platform}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-2xl font-bold">{data.orders}</p>
                          <p className="text-xs text-muted-foreground">Pedidos</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">{data.delivered}</p>
                          <p className="text-xs text-muted-foreground">Entregues</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-red-600">{data.returned}</p>
                          <p className="text-xs text-muted-foreground">Devolvidos</p>
                        </div>
                        <div>
                          <p className={cn(
                            "text-2xl font-bold",
                            data.delivery_rate >= 70 ? "text-green-600" : data.delivery_rate >= 50 ? "text-yellow-600" : "text-red-600"
                          )}>
                            {data.delivery_rate.toFixed(0)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Taxa Entrega</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">Receita Real</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(data.revenue)}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </TabsContent>

        {/* PAÍSES */}
        <TabsContent value="countries" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance por País</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>País</TableHead>
                    <TableHead className="text-center">Pedidos</TableHead>
                    <TableHead className="text-center">Entregues</TableHead>
                    <TableHead className="text-center">Taxa Entrega</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(stats.byCountry)
                    .sort(([,a], [,b]) => b.orders - a.orders)
                    .map(([country, data]) => (
                      <TableRow key={country}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">
                              {country === 'ES' ? '🇪🇸' : country === 'PT' ? '🇵🇹' : country === 'IT' ? '🇮🇹' : country === 'FR' ? '🇫🇷' : country === 'BR' ? '🇧🇷' : '🌍'}
                            </span>
                            <span className="font-medium">{country}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{data.orders}</TableCell>
                        <TableCell className="text-center text-green-600">{data.delivered}</TableCell>
                        <TableCell className="text-center">
                          <span className={cn(
                            "font-medium",
                            data.delivery_rate >= 70 ? "text-green-600" : data.delivery_rate >= 50 ? "text-yellow-600" : "text-red-600"
                          )}>
                            {data.delivery_rate.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(data.revenue)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
