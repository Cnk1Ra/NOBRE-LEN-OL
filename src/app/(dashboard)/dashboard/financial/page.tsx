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
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  Receipt,
  PieChart,
  Download,
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
  PieChart as RechartsPie,
  Pie,
  Cell,
} from 'recharts'
import { formatCurrency, formatPercentage } from '@/lib/utils'

// Mock data
const monthlyData = [
  { month: 'Jul', revenue: 85000, costs: 52000, profit: 33000 },
  { month: 'Ago', revenue: 92000, costs: 55000, profit: 37000 },
  { month: 'Set', revenue: 98000, costs: 58000, profit: 40000 },
  { month: 'Out', revenue: 105000, costs: 62000, profit: 43000 },
  { month: 'Nov', revenue: 118000, costs: 68000, profit: 50000 },
  { month: 'Dez', revenue: 126300, costs: 82800, profit: 43500 },
]

const expenseBreakdown = [
  { name: 'Custo de Produtos', value: 38500, color: '#6366f1' },
  { name: 'Publicidade', value: 34000, color: '#8b5cf6' },
  { name: 'Frete', value: 6400, color: '#a855f7' },
  { name: 'Taxas de Plataforma', value: 2500, color: '#d946ef' },
  { name: 'Outros', value: 1400, color: '#ec4899' },
]

const revenueByCountry = [
  { country: 'Brasil', revenue: 98500, orders: 342, percentage: 78 },
  { country: 'Portugal', revenue: 18200, orders: 58, percentage: 14.4 },
  { country: 'Outros', revenue: 9600, orders: 27, percentage: 7.6 },
]

const recentTransactions = [
  { id: '1', type: 'INCOME', description: 'Venda #ORD-4521', amount: 289.90, date: '07/12/2024' },
  { id: '2', type: 'EXPENSE', description: 'Facebook Ads', amount: -850.00, date: '07/12/2024' },
  { id: '3', type: 'INCOME', description: 'Venda #ORD-4520', amount: 459.90, date: '07/12/2024' },
  { id: '4', type: 'EXPENSE', description: 'Fornecedor - Produtos', amount: -2500.00, date: '06/12/2024' },
  { id: '5', type: 'INCOME', description: 'Venda #ORD-4519', amount: 189.90, date: '06/12/2024' },
  { id: '6', type: 'EXPENSE', description: 'Frete Correios', amount: -320.00, date: '06/12/2024' },
]

export default function FinancialPage() {
  const totalRevenue = 126300
  const totalCosts = 82800
  const totalProfit = 43500
  const profitMargin = (totalProfit / totalRevenue) * 100

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">
            Acompanhe faturamento, custos e lucro do seu negócio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="december">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="december">Dezembro 2024</SelectItem>
              <SelectItem value="november">Novembro 2024</SelectItem>
              <SelectItem value="october">Outubro 2024</SelectItem>
              <SelectItem value="q4">Q4 2024</SelectItem>
              <SelectItem value="year">Ano 2024</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Faturamento</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+12.5% vs mês anterior</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Custos Totais</p>
                <p className="text-2xl font-bold">{formatCurrency(totalCosts)}</p>
                <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+8.2% vs mês anterior</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <CreditCard className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                <p className="text-2xl font-bold">{formatCurrency(totalProfit)}</p>
                <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+15.8% vs mês anterior</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <Wallet className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Margem de Lucro</p>
                <p className="text-2xl font-bold">{formatPercentage(profitMargin)}</p>
                <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+2.1pp vs mês anterior</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue vs Profit Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
            <CardDescription>Faturamento, custos e lucro dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis
                    className="text-xs"
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="revenue"
                    name="Faturamento"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="costs"
                    name="Custos"
                    fill="#f43f5e"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="profit"
                    name="Lucro"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Composição de Custos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {expenseBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Country and Transactions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue by Country */}
        <Card>
          <CardHeader>
            <CardTitle>Faturamento por País</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueByCountry.map((country) => (
                <div key={country.country} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{country.country}</p>
                      <p className="text-xs text-muted-foreground">
                        {country.orders} pedidos
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(country.revenue)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatPercentage(country.percentage)}
                      </p>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${country.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transações Recentes</CardTitle>
            <Button variant="ghost" size="sm">
              Ver todas
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        transaction.type === 'INCOME'
                          ? 'bg-green-500/10'
                          : 'bg-red-500/10'
                      }`}
                    >
                      {transaction.type === 'INCOME' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.date}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-medium ${
                      transaction.type === 'INCOME'
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    {transaction.type === 'INCOME' ? '+' : ''}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
