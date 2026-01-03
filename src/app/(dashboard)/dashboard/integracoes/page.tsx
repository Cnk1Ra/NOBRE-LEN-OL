'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Facebook,
  Search,
  Music2,
  Link2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Settings,
  Activity,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Zap,
  ArrowRight,
  RefreshCw,
  BarChart3,
  Eye,
  MousePointerClick,
  ShoppingCart,
  Code2,
  Webhook,
  Globe,
} from 'lucide-react'

// Platform configurations
const platforms = [
  {
    id: 'meta',
    name: 'Meta Ads',
    description: 'Facebook & Instagram',
    icon: Facebook,
    color: '#1877F2',
    bgColor: 'from-[#1877F2]/10 to-[#E1306C]/10',
    borderColor: 'border-[#1877F2]/20',
    href: '/dashboard/integracoes/meta',
    connected: true,
    status: 'active',
    accounts: 2,
    spend: 21000,
    currency: 'BRL',
    events: 2140,
    lastSync: '2 min atrás',
  },
  {
    id: 'google',
    name: 'Google Ads',
    description: 'Search & Display',
    icon: Search,
    color: '#EA4335',
    bgColor: 'from-[#4285F4]/10 via-[#EA4335]/10 to-[#FBBC05]/10',
    borderColor: 'border-[#4285F4]/20',
    href: '/dashboard/integracoes/google',
    connected: true,
    status: 'active',
    accounts: 2,
    spend: 40000,
    currency: 'BRL',
    events: 1700,
    lastSync: '5 min atrás',
  },
  {
    id: 'tiktok',
    name: 'TikTok Ads',
    description: 'TikTok for Business',
    icon: Music2,
    color: '#000000',
    bgColor: 'from-[#00F2EA]/10 to-[#FF0050]/10',
    borderColor: 'border-[#00F2EA]/20',
    href: '/dashboard/integracoes/tiktok',
    connected: true,
    status: 'active',
    accounts: 1,
    spend: 8500,
    currency: 'BRL',
    events: 890,
    lastSync: '10 min atrás',
  },
]

// Quick stats
const quickStats = [
  {
    label: 'Gasto Total (30d)',
    value: 'R$ 69.500',
    change: '+12%',
    positive: true,
    icon: DollarSign,
    color: 'text-green-500',
  },
  {
    label: 'Conversões',
    value: '1.847',
    change: '+8%',
    positive: true,
    icon: Target,
    color: 'text-blue-500',
  },
  {
    label: 'ROAS Médio',
    value: '3.2x',
    change: '+0.4x',
    positive: true,
    icon: TrendingUp,
    color: 'text-purple-500',
  },
  {
    label: 'CPA Médio',
    value: 'R$ 37,62',
    change: '-5%',
    positive: true,
    icon: Users,
    color: 'text-orange-500',
  },
]

// Recent events
const recentEvents = [
  { type: 'Purchase', platform: 'Meta', value: 'R$ 197,00', time: '2 min', icon: ShoppingCart },
  { type: 'Lead', platform: 'Google', value: '-', time: '5 min', icon: Users },
  { type: 'AddToCart', platform: 'TikTok', value: 'R$ 89,00', time: '8 min', icon: MousePointerClick },
  { type: 'PageView', platform: 'Meta', value: '-', time: '12 min', icon: Eye },
  { type: 'Purchase', platform: 'Google', value: 'R$ 247,00', time: '15 min', icon: ShoppingCart },
]

export default function IntegracoesPage() {
  const [autoSync, setAutoSync] = useState(true)

  const totalSpend = platforms.reduce((acc, p) => acc + p.spend, 0)
  const totalEvents = platforms.reduce((acc, p) => acc + p.events, 0)
  const connectedPlatforms = platforms.filter(p => p.connected).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Integrações de Ads</h1>
          <p className="text-muted-foreground">
            Gerencie suas conexões com plataformas de anúncios
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
            <RefreshCw className={`h-4 w-4 ${autoSync ? 'text-green-500' : 'text-muted-foreground'}`} />
            <span className="text-sm">Auto-sync</span>
            <Switch checked={autoSync} onCheckedChange={setAutoSync} />
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/integracoes/pixels" className="gap-2">
              <Code2 className="h-4 w-4" />
              Pixels & Scripts
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className={`text-xs mt-1 ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.change} vs mês anterior
                  </p>
                </div>
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="platforms" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="platforms" className="gap-2">
            <Globe className="h-4 w-4" />
            Plataformas
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <Activity className="h-4 w-4" />
            Eventos
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-6">
          {/* Platform Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {platforms.map((platform) => (
              <Card
                key={platform.id}
                className={`relative overflow-hidden bg-gradient-to-br ${platform.bgColor} ${platform.borderColor} hover:shadow-lg transition-all duration-300`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-3 rounded-xl"
                        style={{ backgroundColor: `${platform.color}20` }}
                      >
                        <platform.icon className="h-6 w-6" style={{ color: platform.color }} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{platform.name}</CardTitle>
                        <CardDescription>{platform.description}</CardDescription>
                      </div>
                    </div>
                    {platform.connected ? (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Conectado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Desconectado
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {platform.connected ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-background/50">
                          <p className="text-xs text-muted-foreground">Contas</p>
                          <p className="text-xl font-bold">{platform.accounts}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-background/50">
                          <p className="text-xs text-muted-foreground">Eventos Hoje</p>
                          <p className="text-xl font-bold">{platform.events.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-background/50">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-muted-foreground">Gasto (30d)</p>
                          <p className="text-sm font-medium">
                            {platform.currency} {platform.spend.toLocaleString()}
                          </p>
                        </div>
                        <Progress
                          value={(platform.spend / totalSpend) * 100}
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {((platform.spend / totalSpend) * 100).toFixed(1)}% do total
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <p className="text-xs text-muted-foreground">
                          Última sync: {platform.lastSync}
                        </p>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={platform.href} className="gap-1">
                            Gerenciar
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground mb-4">
                        Conecte sua conta para importar dados
                      </p>
                      <Button asChild>
                        <Link href={platform.href}>
                          Conectar Agora
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumo de Performance</CardTitle>
              <CardDescription>
                Dados consolidados de todas as plataformas conectadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-bold text-primary">{connectedPlatforms}</p>
                  <p className="text-sm text-muted-foreground">Plataformas</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-bold">
                    {platforms.reduce((acc, p) => acc + p.accounts, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Contas de Anúncio</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-bold text-green-500">
                    {totalEvents.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Eventos Hoje</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-bold">
                    R$ {(totalSpend / 1000).toFixed(1)}k
                  </p>
                  <p className="text-sm text-muted-foreground">Gasto Total (30d)</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-3xl font-bold text-purple-500">3.2x</p>
                  <p className="text-sm text-muted-foreground">ROAS Médio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Eventos Recentes</CardTitle>
                  <CardDescription>
                    Últimos eventos recebidos das plataformas
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-muted-foreground">Ao vivo</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentEvents.map((event, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        event.type === 'Purchase' ? 'bg-green-500/10 text-green-500' :
                        event.type === 'Lead' ? 'bg-blue-500/10 text-blue-500' :
                        event.type === 'AddToCart' ? 'bg-orange-500/10 text-orange-500' :
                        'bg-purple-500/10 text-purple-500'
                      }`}>
                        <event.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{event.type}</p>
                        <p className="text-sm text-muted-foreground">{event.platform}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{event.value}</p>
                      <p className="text-sm text-muted-foreground">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Event Types Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { type: 'PageView', count: 12450, icon: Eye, color: 'purple' },
              { type: 'AddToCart', count: 890, icon: MousePointerClick, color: 'orange' },
              { type: 'Purchase', count: 247, icon: ShoppingCart, color: 'green' },
              { type: 'Lead', count: 156, icon: Users, color: 'blue' },
            ].map((item, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${item.color}-500/10`}>
                      <item.icon className={`h-5 w-5 text-${item.color}-500`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{item.count.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{item.type}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Webhooks Configurados</CardTitle>
              <CardDescription>
                Endpoints para receber notificações em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Meta CAPI', url: 'https://seu-dominio.com/api/webhooks/meta', status: 'active', events: 1250 },
                  { name: 'Google Offline Conv.', url: 'https://seu-dominio.com/api/webhooks/google', status: 'active', events: 890 },
                  { name: 'TikTok Events API', url: 'https://seu-dominio.com/api/webhooks/tiktok', status: 'active', events: 456 },
                ].map((webhook, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        webhook.status === 'active' ? 'bg-green-500/10' : 'bg-muted'
                      }`}>
                        <Webhook className={`h-5 w-5 ${
                          webhook.status === 'active' ? 'text-green-500' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{webhook.name}</p>
                        <p className="text-sm text-muted-foreground font-mono">{webhook.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{webhook.events.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">eventos/dia</p>
                      </div>
                      <Badge className={webhook.status === 'active' ? 'bg-green-500/10 text-green-500' : ''}>
                        {webhook.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Webhook Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                    <p className="text-2xl font-bold text-green-500">99.8%</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-500/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Latência Média</p>
                    <p className="text-2xl font-bold">124ms</p>
                  </div>
                  <Zap className="h-8 w-8 text-yellow-500/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Eventos (24h)</p>
                    <p className="text-2xl font-bold">2.596</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500/20" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Configurações Avançadas</h3>
                <p className="text-sm text-muted-foreground">
                  Gerencie pixels, scripts de tracking e configurações de API
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard/integracoes/pixels">
                  Pixels & Scripts
                </Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/atribuicao">
                  Ver Atribuição
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
