'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Truck,
  Users,
  Target,
  FileText,
  PieChart,
  LineChart,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Report {
  id: string
  name: string
  type: 'sales' | 'delivery' | 'financial' | 'marketing' | 'inventory'
  description: string
  lastGenerated: string
  frequency: 'daily' | 'weekly' | 'monthly'
  icon: typeof BarChart3
}

const availableReports: Report[] = [
  {
    id: '1',
    name: 'Relatorio de Vendas',
    type: 'sales',
    description: 'Vendas por periodo, produto e canal',
    lastGenerated: '2024-11-28',
    frequency: 'daily',
    icon: BarChart3,
  },
  {
    id: '2',
    name: 'Taxa de Entrega COD',
    type: 'delivery',
    description: 'Performance de entregas e motivos de falha',
    lastGenerated: '2024-11-28',
    frequency: 'daily',
    icon: Truck,
  },
  {
    id: '3',
    name: 'Fluxo de Caixa',
    type: 'financial',
    description: 'Entradas, saidas e previsoes',
    lastGenerated: '2024-11-27',
    frequency: 'weekly',
    icon: DollarSign,
  },
  {
    id: '4',
    name: 'Performance de Campanhas',
    type: 'marketing',
    description: 'ROAS, CTR e conversoes por plataforma',
    lastGenerated: '2024-11-28',
    frequency: 'daily',
    icon: Target,
  },
  {
    id: '5',
    name: 'Lucro por Socio',
    type: 'financial',
    description: 'Divisao de lucros e comissoes',
    lastGenerated: '2024-11-25',
    frequency: 'monthly',
    icon: Users,
  },
  {
    id: '6',
    name: 'Movimentacao de Estoque',
    type: 'inventory',
    description: 'Entradas, saidas e giro de estoque',
    lastGenerated: '2024-11-26',
    frequency: 'weekly',
    icon: Package,
  },
]

const typeColors = {
  sales: 'bg-blue-500/10 text-blue-500',
  delivery: 'bg-green-500/10 text-green-500',
  financial: 'bg-purple-500/10 text-purple-500',
  marketing: 'bg-pink-500/10 text-pink-500',
  inventory: 'bg-orange-500/10 text-orange-500',
}

const typeLabels = {
  sales: 'Vendas',
  delivery: 'Entregas',
  financial: 'Financeiro',
  marketing: 'Marketing',
  inventory: 'Estoque',
}

export default function ReportsPage() {
  const [period, setPeriod] = useState('month')
  const [reportType, setReportType] = useState('all')

  const filteredReports = reportType === 'all'
    ? availableReports
    : availableReports.filter(r => r.type === reportType)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatorios</h1>
          <p className="text-muted-foreground">
            Analise seu desempenho com relatorios detalhados
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mes</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Exportar Todos
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Bruta</p>
                <p className="text-2xl font-bold">{formatCurrency(185420, 'BRL')}</p>
                <div className="flex items-center text-xs text-green-500 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% vs mes anterior
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pedidos</p>
                <p className="text-2xl font-bold">427</p>
                <div className="flex items-center text-xs text-green-500 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.3% vs mes anterior
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Entrega</p>
                <p className="text-2xl font-bold">78.5%</p>
                <div className="flex items-center text-xs text-red-500 mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -2.1% vs mes anterior
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Truck className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ROAS Medio</p>
                <p className="text-2xl font-bold">4.2x</p>
                <div className="flex items-center text-xs text-green-500 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +0.8 vs mes anterior
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={reportType === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setReportType('all')}
        >
          Todos
        </Button>
        {Object.entries(typeLabels).map(([key, label]) => (
          <Button
            key={key}
            variant={reportType === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setReportType(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Available Reports */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredReports.map((report) => {
          const Icon = report.icon
          return (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`h-10 w-10 rounded-lg ${typeColors[report.type]} flex items-center justify-center`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {report.frequency === 'daily' ? 'Diario' :
                     report.frequency === 'weekly' ? 'Semanal' : 'Mensal'}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-3">{report.name}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
                  Ultimo: {new Date(report.lastGenerated).toLocaleDateString('pt-BR')}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <FileText className="mr-2 h-4 w-4" />
                    Gerar
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Visao Geral - Ultimos 30 dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Grafico de desempenho</p>
              <p className="text-sm">Integre com Chart.js para visualizacao</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
