'use client'

import { useState, useEffect, useCallback } from 'react'
import { format, subDays, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Target,
  Percent,
  Calculator,
  Plus,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  FileText,
  Calendar,
} from 'lucide-react'
import { toast } from 'sonner'

interface DailyMetric {
  id: string
  date: string
  totalSpendUsd: number
  totalSpendBrl: number
  totalSales: number
  grossRevenue: number
  netRevenue: number
  grossProfit: number
  netProfit: number
  roi: number | null
  roas: number | null
  cpa: number | null
  usdToBrlRate: number
}

interface FormData {
  date: string
  spendUsd: string
  usdRate: string
  sales: string
  grossRevenue: string
  netRevenue: string
}

const initialFormData: FormData = {
  date: format(new Date(), 'yyyy-MM-dd'),
  spendUsd: '',
  usdRate: '5.70',
  sales: '',
  grossRevenue: '',
  netRevenue: '',
}

export default function MediaBuyerPage() {
  const [metrics, setMetrics] = useState<DailyMetric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [reportText, setReportText] = useState('')

  // Buscar métricas
  const fetchMetrics = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/media-buyer/metrics?limit=30')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data.data || [])
      }
    } catch (error) {
      console.error('Erro ao buscar métricas:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  // Calcular totais do dia atual (hoje)
  const todayMetric = metrics.find(m =>
    format(new Date(m.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  )

  // Calcular totais gerais
  const totals = metrics.reduce((acc, m) => ({
    spendUsd: acc.spendUsd + m.totalSpendUsd,
    spendBrl: acc.spendBrl + m.totalSpendBrl,
    sales: acc.sales + m.totalSales,
    revenue: acc.revenue + m.grossRevenue,
    profit: acc.profit + m.grossProfit,
  }), { spendUsd: 0, spendBrl: 0, sales: 0, revenue: 0, profit: 0 })

  const avgRoi = totals.spendBrl > 0 ? ((totals.profit / totals.spendBrl) * 100) : 0
  const avgRoas = totals.spendBrl > 0 ? (totals.revenue / totals.spendBrl) : 0
  const avgCpa = totals.sales > 0 ? (totals.spendBrl / totals.sales) : 0

  // Salvar dados
  const handleSave = async () => {
    if (!formData.spendUsd || !formData.sales || !formData.grossRevenue) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setIsSaving(true)
    try {
      const spendUsd = parseFloat(formData.spendUsd)
      const usdRate = parseFloat(formData.usdRate)
      const spendBrl = spendUsd * usdRate

      const response = await fetch('/api/media-buyer/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          totalSpendUsd: spendUsd,
          totalSpendBrl: spendBrl,
          totalSales: parseInt(formData.sales),
          grossRevenue: parseFloat(formData.grossRevenue),
          netRevenue: parseFloat(formData.netRevenue) || parseFloat(formData.grossRevenue),
          usdToBrlRate: usdRate,
        }),
      })

      if (response.ok) {
        toast.success('Dados salvos com sucesso!')
        setFormData(initialFormData)
        setIsDialogOpen(false)
        fetchMetrics()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao salvar')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar dados')
    } finally {
      setIsSaving(false)
    }
  }

  // Gerar relatório
  const generateReport = (metric?: DailyMetric) => {
    const m = metric || todayMetric
    if (!m) {
      toast.error('Nenhum dado disponível para gerar relatório')
      return
    }

    const dateFormatted = format(new Date(m.date), "dd 'de' MMMM", { locale: ptBR })
    const spendBrl = m.totalSpendBrl.toFixed(2)
    const revenue = m.grossRevenue.toFixed(2)
    const profit = m.grossProfit.toFixed(2)
    const roi = m.roi?.toFixed(1) || '0'
    const roas = m.roas?.toFixed(2) || '0'
    const cpa = m.cpa?.toFixed(2) || '0'

    const report = `📊 RELATÓRIO DE MÍDIA - ${dateFormatted.toUpperCase()}

💰 Investimento: R$ ${spendBrl}
🛒 Vendas: ${m.totalSales}
💵 Faturamento: R$ ${revenue}
📈 Lucro: R$ ${profit}

📉 MÉTRICAS:
• ROI: ${roi}%
• ROAS: ${roas}x
• CPA: R$ ${cpa}

${parseFloat(profit) >= 0 ? '✅ Dia positivo!' : '⚠️ Dia negativo - ajustar estratégia'}

---
Gerado por DOD Media Buyer`

    setReportText(report)
    return report
  }

  // Copiar relatório
  const copyReport = () => {
    if (reportText) {
      navigator.clipboard.writeText(reportText)
      setCopied(true)
      toast.success('Relatório copiado!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Formatar moeda
  const formatCurrency = (value: number, currency = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
    }).format(value)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Media Buyer</h1>
            <Badge variant="outline" className="gap-1 border-green-500/30 bg-green-500/10 text-green-500">
              <TrendingUp className="h-3 w-3" />
              Facebook Ads
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Controle de gastos, vendas e métricas diárias
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchMetrics} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Registro
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Registrar Dados do Dia</DialogTitle>
                <DialogDescription>
                  Insira os dados de gastos e vendas do dia
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usdRate">Cotação USD/BRL</Label>
                    <Input
                      id="usdRate"
                      type="number"
                      step="0.01"
                      placeholder="5.70"
                      value={formData.usdRate}
                      onChange={(e) => setFormData({ ...formData, usdRate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spendUsd">Gasto do Dia (USD)</Label>
                  <Input
                    id="spendUsd"
                    type="number"
                    step="0.01"
                    placeholder="100.00"
                    value={formData.spendUsd}
                    onChange={(e) => setFormData({ ...formData, spendUsd: e.target.value })}
                  />
                  {formData.spendUsd && formData.usdRate && (
                    <p className="text-xs text-muted-foreground">
                      = {formatCurrency(parseFloat(formData.spendUsd) * parseFloat(formData.usdRate))}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sales">Quantidade de Vendas</Label>
                  <Input
                    id="sales"
                    type="number"
                    placeholder="10"
                    value={formData.sales}
                    onChange={(e) => setFormData({ ...formData, sales: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="grossRevenue">Faturamento Bruto (BRL)</Label>
                    <Input
                      id="grossRevenue"
                      type="number"
                      step="0.01"
                      placeholder="1000.00"
                      value={formData.grossRevenue}
                      onChange={(e) => setFormData({ ...formData, grossRevenue: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="netRevenue">Faturamento Líquido (BRL)</Label>
                    <Input
                      id="netRevenue"
                      type="number"
                      step="0.01"
                      placeholder="900.00"
                      value={formData.netRevenue}
                      onChange={(e) => setFormData({ ...formData, netRevenue: e.target.value })}
                    />
                  </div>
                </div>

                {/* Preview de métricas calculadas */}
                {formData.spendUsd && formData.grossRevenue && (
                  <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <p className="text-sm font-medium">Prévia das Métricas:</p>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Lucro:</span>
                        <p className="font-medium">
                          {formatCurrency(
                            parseFloat(formData.grossRevenue) -
                            (parseFloat(formData.spendUsd) * parseFloat(formData.usdRate))
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ROI:</span>
                        <p className="font-medium">
                          {(((parseFloat(formData.grossRevenue) - (parseFloat(formData.spendUsd) * parseFloat(formData.usdRate))) /
                            (parseFloat(formData.spendUsd) * parseFloat(formData.usdRate))) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ROAS:</span>
                        <p className="font-medium">
                          {(parseFloat(formData.grossRevenue) /
                            (parseFloat(formData.spendUsd) * parseFloat(formData.usdRate))).toFixed(2)}x
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Salvar
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && (
        <>
          {/* Cards de Resumo - Dados do Dia */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gasto (USD)</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${todayMetric?.totalSpendUsd.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(todayMetric?.totalSpendBrl || 0)} em BRL
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vendas</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {todayMetric?.totalSales || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  pedidos hoje
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(todayMetric?.grossRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  bruto do dia
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lucro</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${(todayMetric?.grossProfit || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(todayMetric?.grossProfit || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  após custos de ads
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ROI</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${(todayMetric?.roi || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {todayMetric?.roi?.toFixed(1) || '0'}%
                </div>
                <p className="text-xs text-muted-foreground">
                  retorno sobre investimento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ROAS</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {todayMetric?.roas?.toFixed(2) || '0'}x
                </div>
                <p className="text-xs text-muted-foreground">
                  retorno por real investido
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Seção de Relatório */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Relatório para Patrocinador
              </CardTitle>
              <CardDescription>
                Gere um relatório formatado para enviar ao seu patrocinador/investidor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Textarea
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    placeholder="Clique em 'Gerar Relatório' para criar o texto..."
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2 md:w-48">
                  <Button onClick={() => generateReport()} variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Relatório de Hoje
                  </Button>
                  <Button onClick={copyReport} disabled={!reportText}>
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Texto
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Histórico */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico dos Últimos 30 Dias</CardTitle>
              <CardDescription>
                Acompanhe a evolução das suas métricas diárias
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum registro encontrado</p>
                  <p className="text-sm">Clique em "Novo Registro" para começar</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Gasto USD</TableHead>
                        <TableHead className="text-right">Gasto BRL</TableHead>
                        <TableHead className="text-right">Vendas</TableHead>
                        <TableHead className="text-right">Faturamento</TableHead>
                        <TableHead className="text-right">Lucro</TableHead>
                        <TableHead className="text-right">ROI</TableHead>
                        <TableHead className="text-right">ROAS</TableHead>
                        <TableHead className="text-right">CPA</TableHead>
                        <TableHead className="text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metrics.map((metric) => (
                        <TableRow key={metric.id}>
                          <TableCell className="font-medium">
                            {format(new Date(metric.date), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            ${metric.totalSpendUsd.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(metric.totalSpendBrl)}
                          </TableCell>
                          <TableCell className="text-right">
                            {metric.totalSales}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(metric.grossRevenue)}
                          </TableCell>
                          <TableCell className={`text-right font-medium ${metric.grossProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(metric.grossProfit)}
                          </TableCell>
                          <TableCell className={`text-right ${(metric.roi || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {metric.roi?.toFixed(1) || '0'}%
                          </TableCell>
                          <TableCell className="text-right">
                            {metric.roas?.toFixed(2) || '0'}x
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(metric.cpa || 0)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                generateReport(metric)
                                toast.success('Relatório gerado!')
                              }}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Resumo Geral */}
              {metrics.length > 0 && (
                <div className="mt-6 p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-3">Resumo do Período ({metrics.length} dias)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Gasto:</span>
                      <p className="font-bold">{formatCurrency(totals.spendBrl)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Vendas:</span>
                      <p className="font-bold">{totals.sales}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Faturamento:</span>
                      <p className="font-bold">{formatCurrency(totals.revenue)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ROI Médio:</span>
                      <p className={`font-bold ${avgRoi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {avgRoi.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">CPA Médio:</span>
                      <p className="font-bold">{formatCurrency(avgCpa)}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
