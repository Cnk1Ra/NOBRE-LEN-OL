'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Eye,
  MousePointer,
  ShoppingCart,
  BarChart3,
  Pause,
  Play,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Users,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Globe,
  Layers,
} from 'lucide-react'
import { useCountry } from '@/contexts/country-context'
import { useMeta } from '@/contexts/meta-context'
import { cn } from '@/lib/utils'

// Traffic Source Types
type TrafficSource = 'overview' | 'meta' | 'google' | 'tiktok'

// Campaign interface
interface Campaign {
  id: string
  name: string
  source: 'meta' | 'google' | 'tiktok'
  status: 'active' | 'paused' | 'ended'
  budget: number
  spent: number
  revenue: number
  impressions: number
  clicks: number
  conversions: number
  reach: number
  ctr: number
  cpc: number
  cpm: number
  cpa: number
  roas: number
  profit: number
  startDate: string
  endDate?: string
}

// Campaigns data - starts empty, will be populated from API when integrations are connected
const mockCampaigns: Campaign[] = [
  /* Data removed - connect Meta, Google or TikTok integrations to see campaigns */
]

// Source configuration
const sourceConfig = {
  meta: {
    name: 'Meta Ads',
    shortName: 'Meta',
    icon: '📘',
    color: 'bg-[#1877F2]',
    textColor: 'text-[#1877F2]',
    bgLight: 'bg-[#1877F2]/10',
  },
  google: {
    name: 'Google Ads',
    shortName: 'Google',
    icon: '🔍',
    color: 'bg-[#EA4335]',
    textColor: 'text-[#EA4335]',
    bgLight: 'bg-[#EA4335]/10',
  },
  tiktok: {
    name: 'TikTok Ads',
    shortName: 'TikTok',
    icon: '🎵',
    color: 'bg-black',
    textColor: 'text-black dark:text-white',
    bgLight: 'bg-black/10 dark:bg-white/10',
  },
}

const statusConfig = {
  active: { label: 'Ativa', variant: 'success' as const, color: 'bg-green-500' },
  paused: { label: 'Pausada', variant: 'warning' as const, color: 'bg-yellow-500' },
  ended: { label: 'Finalizada', variant: 'secondary' as const, color: 'bg-gray-500' },
}

export default function CampaignsPage() {
  const { formatCurrency } = useCountry()
  const { isConnected: metaConnected } = useMeta()

  const [activeSource, setActiveSource] = useState<TrafficSource>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('30d')

  // Filter campaigns based on source and search
  const filteredCampaigns = useMemo(() => {
    return mockCampaigns.filter(campaign => {
      const matchesSource = activeSource === 'overview' || campaign.source === activeSource
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
      return matchesSource && matchesSearch && matchesStatus
    })
  }, [activeSource, searchTerm, statusFilter])

  // Calculate totals for each source
  const calculateSourceTotals = (source?: 'meta' | 'google' | 'tiktok') => {
    const campaigns = source
      ? mockCampaigns.filter(c => c.source === source)
      : mockCampaigns

    const spent = campaigns.reduce((sum, c) => sum + c.spent, 0)
    const revenue = campaigns.reduce((sum, c) => sum + c.revenue, 0)
    const profit = campaigns.reduce((sum, c) => sum + c.profit, 0)
    const conversions = campaigns.reduce((sum, c) => sum + c.conversions, 0)
    const impressions = campaigns.reduce((sum, c) => sum + c.impressions, 0)
    const clicks = campaigns.reduce((sum, c) => sum + c.clicks, 0)
    const reach = campaigns.reduce((sum, c) => sum + c.reach, 0)

    const ctr = clicks > 0 ? (clicks / impressions) * 100 : 0
    const cpc = clicks > 0 ? spent / clicks : 0
    const cpm = impressions > 0 ? (spent / impressions) * 1000 : 0
    const cpa = conversions > 0 ? spent / conversions : 0
    const roas = spent > 0 ? revenue / spent : 0

    return {
      spent,
      revenue,
      profit,
      conversions,
      impressions,
      clicks,
      reach,
      ctr,
      cpc,
      cpm,
      cpa,
      roas,
      campaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    }
  }

  const overviewTotals = calculateSourceTotals()
  const metaTotals = calculateSourceTotals('meta')
  const googleTotals = calculateSourceTotals('google')
  const tiktokTotals = calculateSourceTotals('tiktok')

  // Get current totals based on active source
  const currentTotals = activeSource === 'overview'
    ? overviewTotals
    : activeSource === 'meta'
      ? metaTotals
      : activeSource === 'google'
        ? googleTotals
        : tiktokTotals

  // Render metric card
  const MetricCard = ({
    title,
    value,
    icon: Icon,
    color,
    trend,
    subtitle,
  }: {
    title: string
    value: string | number
    icon: React.ElementType
    color: string
    trend?: number
    subtitle?: string
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", color)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 mt-2 text-xs",
            trend >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            <span>{Math.abs(trend).toFixed(1)}% vs periodo anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  )

  // Render source card for overview
  const SourceCard = ({
    source,
    totals,
  }: {
    source: 'meta' | 'google' | 'tiktok'
    totals: ReturnType<typeof calculateSourceTotals>
  }) => {
    const config = sourceConfig[source]

    return (
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]",
          activeSource === source && "ring-2 ring-primary"
        )}
        onClick={() => setActiveSource(source)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl text-2xl", config.bgLight)}>
                {config.icon}
              </div>
              <div>
                <CardTitle className="text-lg">{config.name}</CardTitle>
                <CardDescription>{totals.activeCampaigns} campanhas ativas</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={(e) => {
              e.stopPropagation()
              setActiveSource(source)
            }}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Gasto Total</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(totals.spent)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Receita</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(totals.revenue)}</p>
            </div>
          </div>

          {/* Profit */}
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Lucro</span>
              <span className={cn(
                "text-lg font-bold",
                totals.profit >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {formatCurrency(totals.profit)}
              </span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">ROAS</p>
              <p className={cn(
                "font-bold",
                totals.roas >= 3 ? "text-green-600" : totals.roas >= 2 ? "text-yellow-600" : "text-red-600"
              )}>
                {totals.roas.toFixed(1)}x
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">CPA</p>
              <p className="font-semibold">{formatCurrency(totals.cpa)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">CTR</p>
              <p className="font-semibold">{totals.ctr.toFixed(2)}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">CPM</p>
              <p className="font-semibold">{formatCurrency(totals.cpm)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campanhas</h1>
          <p className="text-muted-foreground">
            Gerencie suas campanhas de trafego pago e acompanhe o desempenho
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Ultimos 7 dias</SelectItem>
              <SelectItem value="30d">Ultimos 30 dias</SelectItem>
              <SelectItem value="90d">Ultimos 90 dias</SelectItem>
              <SelectItem value="all">Todo periodo</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Campanha
          </Button>
        </div>
      </div>

      {/* Source Tabs */}
      <Tabs value={activeSource} onValueChange={(v) => setActiveSource(v as TrafficSource)}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2">
            <Layers className="h-4 w-4" />
            Visao Geral
          </TabsTrigger>
          <TabsTrigger value="meta" className="gap-2">
            <span>📘</span>
            Meta Ads
          </TabsTrigger>
          <TabsTrigger value="google" className="gap-2">
            <span>🔍</span>
            Google Ads
          </TabsTrigger>
          <TabsTrigger value="tiktok" className="gap-2">
            <span>🎵</span>
            TikTok Ads
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Investido"
              value={formatCurrency(overviewTotals.spent)}
              icon={DollarSign}
              color="bg-red-500"
              trend={-5.2}
            />
            <MetricCard
              title="Receita Gerada"
              value={formatCurrency(overviewTotals.revenue)}
              icon={TrendingUp}
              color="bg-green-500"
              trend={12.8}
            />
            <MetricCard
              title="Lucro Total"
              value={formatCurrency(overviewTotals.profit)}
              icon={Zap}
              color={overviewTotals.profit >= 0 ? "bg-emerald-500" : "bg-red-500"}
              trend={8.5}
            />
            <MetricCard
              title="ROAS Medio"
              value={`${overviewTotals.roas.toFixed(2)}x`}
              icon={Target}
              color="bg-purple-500"
              subtitle={`${overviewTotals.conversions} conversoes`}
            />
          </div>

          {/* Source Cards */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Fontes de Trafego</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <SourceCard source="meta" totals={metaTotals} />
              <SourceCard source="google" totals={googleTotals} />
              <SourceCard source="tiktok" totals={tiktokTotals} />
            </div>
          </div>

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Comparativo de Fontes</CardTitle>
              <CardDescription>
                Veja as metricas principais de cada fonte de trafego lado a lado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fonte</TableHead>
                    <TableHead className="text-right">Gasto</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                    <TableHead className="text-right">Lucro</TableHead>
                    <TableHead className="text-right">ROAS</TableHead>
                    <TableHead className="text-right">CPA</TableHead>
                    <TableHead className="text-right">CPM</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                    <TableHead className="text-right">Conversoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(['meta', 'google', 'tiktok'] as const).map(source => {
                    const totals = source === 'meta' ? metaTotals : source === 'google' ? googleTotals : tiktokTotals
                    const config = sourceConfig[source]

                    return (
                      <TableRow key={source} className="cursor-pointer hover:bg-muted/50" onClick={() => setActiveSource(source)}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{config.icon}</span>
                            <span className="font-medium">{config.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          {formatCurrency(totals.spent)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(totals.revenue)}
                        </TableCell>
                        <TableCell className={cn(
                          "text-right font-bold",
                          totals.profit >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {formatCurrency(totals.profit)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className={cn(
                            totals.roas >= 3 ? "bg-green-500" : totals.roas >= 2 ? "bg-yellow-500" : "bg-red-500",
                            "text-white"
                          )}>
                            {totals.roas.toFixed(1)}x
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(totals.cpa)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(totals.cpm)}</TableCell>
                        <TableCell className="text-right">{totals.ctr.toFixed(2)}%</TableCell>
                        <TableCell className="text-right font-medium">{totals.conversions}</TableCell>
                      </TableRow>
                    )
                  })}
                  {/* Total Row */}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        <span>TOTAL</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-red-600">{formatCurrency(overviewTotals.spent)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(overviewTotals.revenue)}</TableCell>
                    <TableCell className={cn(
                      "text-right",
                      overviewTotals.profit >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {formatCurrency(overviewTotals.profit)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-purple-500 text-white">{overviewTotals.roas.toFixed(1)}x</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(overviewTotals.cpa)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(overviewTotals.cpm)}</TableCell>
                    <TableCell className="text-right">{overviewTotals.ctr.toFixed(2)}%</TableCell>
                    <TableCell className="text-right">{overviewTotals.conversions}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Source Specific Tabs */}
        {(['meta', 'google', 'tiktok'] as const).map(source => {
          const config = sourceConfig[source]
          const totals = source === 'meta' ? metaTotals : source === 'google' ? googleTotals : tiktokTotals
          const sourceCampaigns = mockCampaigns.filter(c => c.source === source)

          return (
            <TabsContent key={source} value={source} className="space-y-6">
              {/* Source Header */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className={cn("flex h-14 w-14 items-center justify-center rounded-xl text-3xl", config.bgLight)}>
                  {config.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{config.name}</h2>
                  <p className="text-muted-foreground">
                    {totals.campaigns} campanhas • {totals.activeCampaigns} ativas
                  </p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
                <MetricCard title="Gasto" value={formatCurrency(totals.spent)} icon={DollarSign} color="bg-red-500" />
                <MetricCard title="Receita" value={formatCurrency(totals.revenue)} icon={TrendingUp} color="bg-green-500" />
                <MetricCard title="Lucro" value={formatCurrency(totals.profit)} icon={Zap} color={totals.profit >= 0 ? "bg-emerald-500" : "bg-red-500"} />
                <MetricCard title="ROAS" value={`${totals.roas.toFixed(2)}x`} icon={Target} color="bg-purple-500" />
                <MetricCard title="CPA" value={formatCurrency(totals.cpa)} icon={ShoppingCart} color="bg-blue-500" />
                <MetricCard title="CPM" value={formatCurrency(totals.cpm)} icon={Eye} color="bg-orange-500" />
                <MetricCard title="CPC" value={formatCurrency(totals.cpc)} icon={MousePointer} color="bg-cyan-500" />
                <MetricCard title="CTR" value={`${totals.ctr.toFixed(2)}%`} icon={Percent} color="bg-pink-500" />
              </div>

              {/* Additional Metrics */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                        <Eye className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Impressoes</p>
                        <p className="text-lg font-bold">{(totals.impressions / 1000).toFixed(0)}k</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                        <MousePointer className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Cliques</p>
                        <p className="text-lg font-bold">{totals.clicks.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                        <Users className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Alcance</p>
                        <p className="text-lg font-bold">{(totals.reach / 1000).toFixed(0)}k</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                        <ShoppingCart className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Conversoes</p>
                        <p className="text-lg font-bold">{totals.conversions}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar campanha..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativas</SelectItem>
                    <SelectItem value="paused">Pausadas</SelectItem>
                    <SelectItem value="ended">Finalizadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Campaigns Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Campanhas</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campanha</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Gasto</TableHead>
                        <TableHead className="text-right">Receita</TableHead>
                        <TableHead className="text-right">Lucro</TableHead>
                        <TableHead className="text-right">ROAS</TableHead>
                        <TableHead className="text-right">CPA</TableHead>
                        <TableHead className="text-right">CTR</TableHead>
                        <TableHead className="text-right">Conv.</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sourceCampaigns
                        .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .filter(c => statusFilter === 'all' || c.status === statusFilter)
                        .map(campaign => (
                          <TableRow key={campaign.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{campaign.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Inicio: {new Date(campaign.startDate).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={cn(
                                statusConfig[campaign.status].color,
                                "text-white"
                              )}>
                                {statusConfig[campaign.status].label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium text-red-600">
                              {formatCurrency(campaign.spent)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-green-600">
                              {formatCurrency(campaign.revenue)}
                            </TableCell>
                            <TableCell className={cn(
                              "text-right font-bold",
                              campaign.profit >= 0 ? "text-green-600" : "text-red-600"
                            )}>
                              {formatCurrency(campaign.profit)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge className={cn(
                                campaign.roas >= 3 ? "bg-green-500" : campaign.roas >= 2 ? "bg-yellow-500" : "bg-red-500",
                                "text-white"
                              )}>
                                {campaign.roas.toFixed(1)}x
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(campaign.cpa)}</TableCell>
                            <TableCell className="text-right">{campaign.ctr.toFixed(2)}%</TableCell>
                            <TableCell className="text-right font-medium">{campaign.conversions}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Ver Relatorio
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    {campaign.status === 'active' ? (
                                      <>
                                        <Pause className="mr-2 h-4 w-4" />
                                        Pausar
                                      </>
                                    ) : (
                                      <>
                                        <Play className="mr-2 h-4 w-4" />
                                        Ativar
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
