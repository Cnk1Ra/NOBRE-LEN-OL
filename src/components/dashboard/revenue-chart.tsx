'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
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
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, DollarSign, ShoppingBag, LineChart } from 'lucide-react'

interface DataPoint {
  date: string
  revenue: number
  profit: number
  orders: number
  adSpend?: number
}

interface RevenueChartProps {
  data: DataPoint[]
  currency?: string
}

export function RevenueChart({ data, currency = 'BRL' }: RevenueChartProps) {
  const totalRevenue = data.reduce((acc, item) => acc + item.revenue, 0)
  const totalProfit = data.reduce((acc, item) => acc + item.profit, 0)
  const totalOrders = data.reduce((acc, item) => acc + item.orders, 0)
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-border/50 bg-card/95 backdrop-blur-sm p-4 shadow-xl">
          <p className="text-sm font-semibold mb-3 text-foreground">{label}</p>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-muted-foreground">{entry.name}:</span>
                <span className="text-sm font-semibold">
                  {entry.name === 'Pedidos'
                    ? entry.value
                    : formatCurrency(entry.value, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="col-span-2 overflow-hidden border-border/50">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
              <LineChart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Faturamento e Lucro</CardTitle>
              <p className="text-sm text-muted-foreground">Últimos 7 dias</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/20">
              <DollarSign className="h-4 w-4 text-success" />
              <span className="text-sm font-semibold text-success">
                {formatCurrency(totalRevenue, currency)}
              </span>
            </div>
            <Badge variant="outline" className="gap-1 px-3 py-1.5 border-primary/30 text-primary">
              <TrendingUp className="h-3 w-3" />
              {profitMargin.toFixed(1)}% margem
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 rounded-xl bg-muted/50 p-1">
            <TabsTrigger
              value="revenue"
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Faturamento
            </TabsTrigger>
            <TabsTrigger
              value="profit"
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Lucro
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Pedidos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="h-[320px] mt-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.5}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Faturamento"
                  stroke="hsl(var(--primary))"
                  fill="url(#colorRevenue)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: 'hsl(var(--primary))',
                    stroke: 'hsl(var(--background))',
                    strokeWidth: 3,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="profit" className="h-[320px] mt-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.5}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Lucro"
                  stroke="hsl(var(--success))"
                  fill="url(#colorProfit)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: 'hsl(var(--success))',
                    stroke: 'hsl(var(--background))',
                    strokeWidth: 3,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="orders" className="h-[320px] mt-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.5}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="orders"
                  name="Pedidos"
                  fill="url(#colorOrders)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>

        {/* Bottom Summary */}
        <div className="mt-6 pt-4 border-t border-border/50 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Faturado</p>
            <p className="text-lg font-bold">{formatCurrency(totalRevenue, currency)}</p>
          </div>
          <div className="text-center border-x border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Lucro Total</p>
            <p className="text-lg font-bold text-success">{formatCurrency(totalProfit, currency)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Pedidos</p>
            <p className="text-lg font-bold">{totalOrders}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
