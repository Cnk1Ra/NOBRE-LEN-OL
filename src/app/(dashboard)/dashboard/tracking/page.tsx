'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Target,
  MousePointer,
  ShoppingCart,
  Eye,
  TrendingUp,
  Globe,
  Smartphone,
  Monitor,
  Copy,
  ExternalLink,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { formatNumber, formatPercentage } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

// Mock data
const funnelData = [
  { name: 'Visitantes', value: 13060, color: '#6366f1' },
  { name: 'Visualizaram Produto', value: 8450, color: '#8b5cf6' },
  { name: 'Add to Cart', value: 2890, color: '#a855f7' },
  { name: 'Checkout', value: 1240, color: '#d946ef' },
  { name: 'Pedidos', value: 427, color: '#22c55e' },
]

const trafficBySource = [
  { name: 'Facebook', sessions: 4520, orders: 156, conversion: 3.45 },
  { name: 'Instagram', sessions: 2890, orders: 98, conversion: 3.39 },
  { name: 'TikTok', sessions: 3200, orders: 72, conversion: 2.25 },
  { name: 'Google', sessions: 1560, orders: 45, conversion: 2.88 },
  { name: 'Orgânico', sessions: 890, orders: 28, conversion: 3.15 },
]

const dailyTraffic = [
  { date: '01/12', sessions: 1520, pageViews: 4560, orders: 52 },
  { date: '02/12', sessions: 1780, pageViews: 5340, orders: 58 },
  { date: '03/12', sessions: 1650, pageViews: 4950, orders: 48 },
  { date: '04/12', sessions: 2100, pageViews: 6300, orders: 72 },
  { date: '05/12', sessions: 2350, pageViews: 7050, orders: 82 },
  { date: '06/12', sessions: 2180, pageViews: 6540, orders: 75 },
  { date: '07/12', sessions: 2480, pageViews: 7440, orders: 90 },
]

const deviceData = [
  { name: 'Mobile', value: 68, color: '#6366f1' },
  { name: 'Desktop', value: 28, color: '#22c55e' },
  { name: 'Tablet', value: 4, color: '#f59e0b' },
]

const topPages = [
  { page: '/produto/kit-skincare', views: 4520, orders: 156 },
  { page: '/produto/serum-vitamina-c', views: 2890, orders: 98 },
  { page: '/produto/creme-noturno', views: 2100, orders: 72 },
  { page: '/produto/protetor-solar', views: 1560, orders: 45 },
  { page: '/colecao/verao-2024', views: 1200, orders: 28 },
]

export default function TrackingPage() {
  const { toast } = useToast()

  // Script de tracking para copiar
  const trackingScript = `<script>
  (function(d,s,i){
    var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s);
    j.async=true;
    j.src='https://seudominio.com/tracking.js?id='+i;
    f.parentNode.insertBefore(j,f);
  })(document,'script','DOD-XXXXX');
</script>`

  const copyTrackingScript = () => {
    navigator.clipboard.writeText(trackingScript)
    toast({
      title: 'Copiado!',
      description: 'Script de tracking copiado para a área de transferência',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tracking</h1>
          <p className="text-muted-foreground">
            Acompanhe o comportamento dos visitantes e conversões
          </p>
        </div>
        <Select defaultValue="7days">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="7days">Últimos 7 dias</SelectItem>
            <SelectItem value="30days">Últimos 30 dias</SelectItem>
            <SelectItem value="90days">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Eye className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{formatNumber(13060)}</p>
                <p className="text-xs text-muted-foreground">Visitantes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <MousePointer className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{formatNumber(39180)}</p>
                <p className="text-xs text-muted-foreground">Page Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <ShoppingCart className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{formatNumber(2890)}</p>
                <p className="text-xs text-muted-foreground">Add to Cart</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Target className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{formatNumber(427)}</p>
                <p className="text-xs text-muted-foreground">Conversões</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-8 w-8 text-indigo-500" />
              <div>
                <p className="text-2xl font-bold">3.27%</p>
                <p className="text-xs text-muted-foreground">Taxa de Conversão</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Traffic Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Tráfego Diário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTraffic}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    name="Sessões"
                    stroke="#6366f1"
                    fillOpacity={1}
                    fill="url(#colorSessions)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Dispositivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {deviceData.map((device) => (
                <div key={device.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: device.color }}
                  />
                  <span className="text-sm">
                    {device.name} ({device.value}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel and Sources */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
            <CardDescription>
              Acompanhe cada etapa do funil de vendas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((step, index) => {
                const percentage = index === 0
                  ? 100
                  : ((step.value / funnelData[0].value) * 100).toFixed(1)
                const dropoff = index > 0
                  ? (((funnelData[index - 1].value - step.value) / funnelData[index - 1].value) * 100).toFixed(1)
                  : null

                return (
                  <div key={step.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{step.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">
                          {formatNumber(step.value)}
                        </span>
                        <Badge variant="secondary">{percentage}%</Badge>
                        {dropoff && (
                          <Badge variant="destructive" className="text-xs">
                            -{dropoff}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: step.color,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Traffic by Source */}
        <Card>
          <CardHeader>
            <CardTitle>Tráfego por Fonte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trafficBySource} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" className="text-xs" width={80} />
                  <Tooltip />
                  <Bar dataKey="sessions" name="Sessões" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Páginas Mais Visitadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4 text-left text-sm font-medium">Página</th>
                  <th className="p-4 text-left text-sm font-medium">Visualizações</th>
                  <th className="p-4 text-left text-sm font-medium">Pedidos</th>
                  <th className="p-4 text-left text-sm font-medium">Conversão</th>
                </tr>
              </thead>
              <tbody>
                {topPages.map((page) => (
                  <tr key={page.page} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{page.page}</span>
                      </div>
                    </td>
                    <td className="p-4">{formatNumber(page.views)}</td>
                    <td className="p-4">{page.orders}</td>
                    <td className="p-4">
                      <Badge variant="success">
                        {formatPercentage((page.orders / page.views) * 100)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Script */}
      <Card>
        <CardHeader>
          <CardTitle>Script de Tracking</CardTitle>
          <CardDescription>
            Adicione este script ao seu site para começar a rastrear visitantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
              <code>{trackingScript}</code>
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
              onClick={copyTrackingScript}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
