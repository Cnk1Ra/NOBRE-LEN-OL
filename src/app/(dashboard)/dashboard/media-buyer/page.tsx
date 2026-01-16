'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Facebook,
  Link2,
  Settings,
  CloudDownload,
  AlertCircle,
  Pencil,
  Trash2,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface FacebookAccount {
  id: string
  accountId: string
  accountName: string
  currency: string
  timezone: string
  isActive: boolean
  lastSyncAt: string | null
}

interface DailyMetric {
  id: string
  date: string
  totalSpendUsd: number
  totalSpendBrl: number
  totalSales: number
  grossRevenueUsd: number
  netRevenueUsd: number
  grossProfitUsd: number
  netProfitUsd: number
  grossRevenue: number
  netRevenue: number
  grossProfit: number
  netProfit: number
  roi: number | null
  roas: number | null
  cpa: number | null
  cpaUsd: number | null
  usdToBrlRate: number
}

interface FormData {
  date: string
  spendUsd: string
  usdRate: string
  sales: string
  grossRevenueUsd: string
  netRevenueUsd: string
}

const initialFormData: FormData = {
  date: format(new Date(), 'yyyy-MM-dd'),
  spendUsd: '',
  usdRate: '5.70',
  sales: '',
  grossRevenueUsd: '',
  netRevenueUsd: '',
}

export default function MediaBuyerPage() {
  const [metrics, setMetrics] = useState<DailyMetric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [reportText, setReportText] = useState('')

  // Facebook Ads states
  const [fbAccounts, setFbAccounts] = useState<FacebookAccount[]>([])
  const [selectedFbAccount, setSelectedFbAccount] = useState<string>('')
  const [isSyncing, setIsSyncing] = useState(false)
  const [isFbDialogOpen, setIsFbDialogOpen] = useState(false)
  const [fbFormData, setFbFormData] = useState({
    accountId: '',
    accountName: '',
    accessToken: '',
    currency: 'USD',
    timezone: 'America/Los_Angeles',
  })
  const [isAddingAccount, setIsAddingAccount] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<FacebookAccount | null>(null)
  const [editFormData, setEditFormData] = useState({
    accessToken: '',
    accountName: '',
  })

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
      toast({ title: 'Erro ao carregar dados', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Buscar contas do Facebook
  const fetchFbAccounts = useCallback(async () => {
    try {
      const response = await fetch('/api/media-buyer/accounts')
      if (response.ok) {
        const data = await response.json()
        setFbAccounts(data.data || [])
        // Selecionar primeira conta ativa automaticamente
        const activeAccount = (data.data || []).find((a: FacebookAccount) => a.isActive)
        if (activeAccount && !selectedFbAccount) {
          setSelectedFbAccount(activeAccount.id)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar contas Facebook:', error)
    }
  }, [selectedFbAccount])

  // Sincronizar dados do Facebook
  const syncFacebookData = async () => {
    if (!selectedFbAccount) {
      toast({ title: 'Selecione uma conta do Facebook', variant: 'destructive' })
      return
    }

    setIsSyncing(true)
    try {
      const response = await fetch('/api/media-buyer/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: selectedFbAccount,
          datePreset: 'today',
          usdToBrlRate: parseFloat(formData.usdRate) || 5.70,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({ title: data.message || 'Sincronização concluída!' })
        fetchMetrics()
        fetchFbAccounts()
      } else {
        toast({ title: data.error || 'Erro ao sincronizar', description: data.message, variant: 'destructive' })
      }
    } catch (error) {
      console.error('Erro ao sincronizar:', error)
      toast({ title: 'Erro ao sincronizar dados', variant: 'destructive' })
    } finally {
      setIsSyncing(false)
    }
  }

  // Adicionar conta do Facebook
  const addFbAccount = async () => {
    if (!fbFormData.accountId || !fbFormData.accountName || !fbFormData.accessToken) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' })
      return
    }

    setIsAddingAccount(true)
    try {
      const response = await fetch('/api/media-buyer/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fbFormData),
      })

      if (response.ok) {
        toast({ title: 'Conta adicionada com sucesso!' })
        setFbFormData({
          accountId: '',
          accountName: '',
          accessToken: '',
          currency: 'USD',
          timezone: 'America/Los_Angeles',
        })
        setIsFbDialogOpen(false)
        fetchFbAccounts()
      } else {
        const error = await response.json()
        toast({ title: error.error || 'Erro ao adicionar conta', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Erro ao adicionar conta:', error)
      toast({ title: 'Erro ao adicionar conta', variant: 'destructive' })
    } finally {
      setIsAddingAccount(false)
    }
  }

  // Editar conta do Facebook (atualizar token)
  const updateFbAccount = async () => {
    if (!editingAccount || !editFormData.accessToken) {
      toast({ title: 'Preencha o novo token de acesso', variant: 'destructive' })
      return
    }

    setIsAddingAccount(true)
    try {
      const response = await fetch('/api/media-buyer/accounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingAccount.id,
          accessToken: editFormData.accessToken,
          accountName: editFormData.accountName || editingAccount.accountName,
        }),
      })

      if (response.ok) {
        toast({ title: 'Token atualizado com sucesso!' })
        setEditFormData({ accessToken: '', accountName: '' })
        setEditingAccount(null)
        setIsEditDialogOpen(false)
        fetchFbAccounts()
      } else {
        const error = await response.json()
        toast({ title: error.error || 'Erro ao atualizar conta', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Erro ao atualizar conta:', error)
      toast({ title: 'Erro ao atualizar conta', variant: 'destructive' })
    } finally {
      setIsAddingAccount(false)
    }
  }

  // Abrir modal de edição
  const openEditDialog = (account: FacebookAccount) => {
    setEditingAccount(account)
    setEditFormData({
      accessToken: '',
      accountName: account.accountName,
    })
    setIsEditDialogOpen(true)
  }

  useEffect(() => {
    fetchMetrics()
    fetchFbAccounts()
  }, [fetchMetrics, fetchFbAccounts])

  // Calcular totais do dia atual (hoje)
  const todayMetric = metrics.find(m =>
    format(new Date(m.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  )

  // Calcular totais gerais
  const totals = metrics.reduce((acc, m) => ({
    spendUsd: acc.spendUsd + m.totalSpendUsd,
    spendBrl: acc.spendBrl + m.totalSpendBrl,
    sales: acc.sales + m.totalSales,
    revenueUsd: acc.revenueUsd + (m.grossRevenueUsd || 0),
    revenueBrl: acc.revenueBrl + m.grossRevenue,
    profitUsd: acc.profitUsd + (m.grossProfitUsd || 0),
    profitBrl: acc.profitBrl + m.grossProfit,
  }), { spendUsd: 0, spendBrl: 0, sales: 0, revenueUsd: 0, revenueBrl: 0, profitUsd: 0, profitBrl: 0 })

  const avgRoi = totals.spendUsd > 0 ? ((totals.profitUsd / totals.spendUsd) * 100) : 0
  const avgRoas = totals.spendUsd > 0 ? (totals.revenueUsd / totals.spendUsd) : 0
  const avgCpaUsd = totals.sales > 0 ? (totals.spendUsd / totals.sales) : 0
  const avgCpaBrl = totals.sales > 0 ? (totals.spendBrl / totals.sales) : 0

  // Salvar dados
  const handleSave = async () => {
    if (!formData.spendUsd || !formData.sales || !formData.grossRevenueUsd) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/media-buyer/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          totalSpendUsd: parseFloat(formData.spendUsd),
          totalSales: parseInt(formData.sales),
          grossRevenueUsd: parseFloat(formData.grossRevenueUsd),
          netRevenueUsd: parseFloat(formData.netRevenueUsd) || parseFloat(formData.grossRevenueUsd),
          usdToBrlRate: parseFloat(formData.usdRate),
        }),
      })

      if (response.ok) {
        toast({ title: 'Dados salvos com sucesso!' })
        setFormData(initialFormData)
        setIsDialogOpen(false)
        fetchMetrics()
      } else {
        const error = await response.json()
        toast({ title: error.error || 'Erro ao salvar', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast({ title: 'Erro ao salvar dados', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  // Gerar relatório
  const generateReport = (metric?: DailyMetric) => {
    const m = metric || todayMetric
    if (!m) {
      toast({ title: 'Nenhum dado disponível para gerar relatório', variant: 'destructive' })
      return
    }

    const dateFormatted = format(new Date(m.date), "dd 'de' MMMM", { locale: ptBR })
    const spendUsd = m.totalSpendUsd.toFixed(2)
    const spendBrl = m.totalSpendBrl.toFixed(2)
    const revenueUsd = (m.grossRevenueUsd || 0).toFixed(2)
    const revenueBrl = m.grossRevenue.toFixed(2)
    const profitUsd = (m.grossProfitUsd || 0).toFixed(2)
    const profitBrl = m.grossProfit.toFixed(2)
    const roi = m.roi?.toFixed(1) || '0'
    const roas = m.roas?.toFixed(2) || '0'
    const cpaUsd = m.cpaUsd?.toFixed(2) || '0'
    const cpaBrl = m.cpa?.toFixed(2) || '0'

    const report = `📊 RELATÓRIO DE MÍDIA - ${dateFormatted.toUpperCase()}

💰 Investimento: $${spendUsd} USD (R$ ${spendBrl})
🛒 Vendas: ${m.totalSales}
💵 Faturamento: $${revenueUsd} USD (R$ ${revenueBrl})
📈 Lucro: $${profitUsd} USD (R$ ${profitBrl})

📉 MÉTRICAS:
• ROI: ${roi}%
• ROAS: ${roas}x
• CPA: $${cpaUsd} USD (R$ ${cpaBrl})

${parseFloat(profitUsd) >= 0 ? '✅ Dia positivo!' : '⚠️ Dia negativo - ajustar estratégia'}

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
      toast({ title: 'Relatório copiado!' })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Formatar moeda
  const formatUSD = (value: number) => `$${value.toFixed(2)}`
  const formatBRL = (value: number) => `R$ ${value.toFixed(2)}`

  // Calcular prévia
  const previewSpendUsd = parseFloat(formData.spendUsd) || 0
  const previewRate = parseFloat(formData.usdRate) || 5.70
  const previewSpendBrl = previewSpendUsd * previewRate
  const previewRevenueUsd = parseFloat(formData.grossRevenueUsd) || 0
  const previewRevenueBrl = previewRevenueUsd * previewRate
  const previewProfitUsd = previewRevenueUsd - previewSpendUsd
  const previewProfitBrl = previewRevenueBrl - previewSpendBrl
  const previewRoi = previewSpendUsd > 0 ? ((previewProfitUsd / previewSpendUsd) * 100) : 0
  const previewRoas = previewSpendUsd > 0 ? (previewRevenueUsd / previewSpendUsd) : 0

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
            Controle de gastos, vendas e métricas diárias (valores em USD)
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
                  Insira os dados de gastos e vendas do dia (valores em USD)
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
                  {formData.spendUsd && (
                    <p className="text-xs text-muted-foreground">
                      = {formatBRL(previewSpendBrl)}
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
                    <Label htmlFor="grossRevenueUsd">Faturamento Bruto (USD)</Label>
                    <Input
                      id="grossRevenueUsd"
                      type="number"
                      step="0.01"
                      placeholder="500.00"
                      value={formData.grossRevenueUsd}
                      onChange={(e) => setFormData({ ...formData, grossRevenueUsd: e.target.value })}
                    />
                    {formData.grossRevenueUsd && (
                      <p className="text-xs text-muted-foreground">
                        = {formatBRL(previewRevenueBrl)}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="netRevenueUsd">Faturamento Líquido (USD)</Label>
                    <Input
                      id="netRevenueUsd"
                      type="number"
                      step="0.01"
                      placeholder="450.00"
                      value={formData.netRevenueUsd}
                      onChange={(e) => setFormData({ ...formData, netRevenueUsd: e.target.value })}
                    />
                  </div>
                </div>

                {/* Preview de métricas calculadas */}
                {formData.spendUsd && formData.grossRevenueUsd && (
                  <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <p className="text-sm font-medium">Prévia das Métricas:</p>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Lucro:</span>
                        <p className="font-medium text-green-500">
                          {formatUSD(previewProfitUsd)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatBRL(previewProfitBrl)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ROI:</span>
                        <p className="font-medium">{previewRoi.toFixed(1)}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ROAS:</span>
                        <p className="font-medium">{previewRoas.toFixed(2)}x</p>
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

      {/* Facebook Ads Integration */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Facebook className="h-5 w-5 text-[#1877F2]" />
              <CardTitle className="text-lg">Integração Facebook Ads</CardTitle>
              {fbAccounts.length > 0 && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {fbAccounts.length} conta(s)
                </Badge>
              )}
            </div>
            <Dialog open={isFbDialogOpen} onOpenChange={setIsFbDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Conta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Facebook className="h-5 w-5 text-[#1877F2]" />
                    Adicionar Conta do Facebook Ads
                  </DialogTitle>
                  <DialogDescription>
                    Configure sua conta do Facebook Ads para sincronização automática de gastos
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="fbAccountId">ID da Conta (act_xxxxx)</Label>
                    <Input
                      id="fbAccountId"
                      placeholder="act_123456789"
                      value={fbFormData.accountId}
                      onChange={(e) => setFbFormData({ ...fbFormData, accountId: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Encontre no Business Manager &gt; Contas de anúncios
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fbAccountName">Nome da Conta</Label>
                    <Input
                      id="fbAccountName"
                      placeholder="Minha Conta Ads"
                      value={fbFormData.accountName}
                      onChange={(e) => setFbFormData({ ...fbFormData, accountName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fbAccessToken">Access Token</Label>
                    <Input
                      id="fbAccessToken"
                      type="password"
                      placeholder="EAAxxxxxxxx..."
                      value={fbFormData.accessToken}
                      onChange={(e) => setFbFormData({ ...fbFormData, accessToken: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Gere um token em: developers.facebook.com &gt; Graph API Explorer
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Moeda</Label>
                      <Select
                        value={fbFormData.currency}
                        onValueChange={(v) => setFbFormData({ ...fbFormData, currency: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - Dólar</SelectItem>
                          <SelectItem value="BRL">BRL - Real</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select
                        value={fbFormData.timezone}
                        onValueChange={(v) => setFbFormData({ ...fbFormData, timezone: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Los_Angeles">PT (Los Angeles)</SelectItem>
                          <SelectItem value="America/Sao_Paulo">BRT (São Paulo)</SelectItem>
                          <SelectItem value="America/New_York">EST (New York)</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsFbDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={addFbAccount} disabled={isAddingAccount}>
                    {isAddingAccount ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adicionando...
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4 mr-2" />
                        Conectar
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Dialog de Edição */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Pencil className="h-5 w-5 text-[#1877F2]" />
                    Editar Conta do Facebook Ads
                  </DialogTitle>
                  <DialogDescription>
                    Atualize o token de acesso da conta {editingAccount?.accountName}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Conta</Label>
                    <p className="text-sm text-muted-foreground">
                      {editingAccount?.accountName} ({editingAccount?.accountId})
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editAccountName">Nome da Conta</Label>
                    <Input
                      id="editAccountName"
                      placeholder="Nome da conta"
                      value={editFormData.accountName}
                      onChange={(e) => setEditFormData({ ...editFormData, accountName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editAccessToken">Novo Access Token</Label>
                    <Input
                      id="editAccessToken"
                      type="password"
                      placeholder="EAAxxxxxxxx..."
                      value={editFormData.accessToken}
                      onChange={(e) => setEditFormData({ ...editFormData, accessToken: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Cole o novo token de acesso gerado no Graph API Explorer
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={updateFbAccount} disabled={isAddingAccount}>
                    {isAddingAccount ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Atualizando...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Atualizar Token
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {fbAccounts.length === 0 ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Nenhuma conta conectada</p>
                <p className="text-xs text-muted-foreground">
                  Adicione uma conta do Facebook Ads para sincronizar gastos automaticamente
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 w-full sm:w-auto">
                <Label className="text-xs text-muted-foreground mb-1 block">Conta Selecionada</Label>
                <Select value={selectedFbAccount} onValueChange={setSelectedFbAccount}>
                  <SelectTrigger className="w-full sm:w-[300px]">
                    <SelectValue placeholder="Selecione uma conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {fbAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center gap-2">
                          <span>{account.accountName}</span>
                          <span className="text-xs text-muted-foreground">({account.accountId})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={syncFacebookData}
                  disabled={isSyncing || !selectedFbAccount}
                  className="bg-[#1877F2] hover:bg-[#1877F2]/90"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sincronizando...
                    </>
                  ) : (
                    <>
                      <CloudDownload className="h-4 w-4 mr-2" />
                      Sincronizar Hoje
                    </>
                  )}
                </Button>
                {selectedFbAccount && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const account = fbAccounts.find(a => a.id === selectedFbAccount)
                      if (account) openEditDialog(account)
                    }}
                    title="Editar conta / Atualizar token"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {(() => {
                const selectedAccount = fbAccounts.find(a => a.id === selectedFbAccount)
                if (selectedAccount?.lastSyncAt) {
                  return (
                    <p className="text-xs text-muted-foreground">
                      Última sync: {format(new Date(selectedAccount.lastSyncAt), 'dd/MM HH:mm')}
                    </p>
                  )
                }
                return null
              })()}
            </div>
          )}
        </CardContent>
      </Card>

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
                <CardTitle className="text-sm font-medium">Gasto</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatUSD(todayMetric?.totalSpendUsd || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatBRL(todayMetric?.totalSpendBrl || 0)}
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
                  {formatUSD(todayMetric?.grossRevenueUsd || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatBRL(todayMetric?.grossRevenue || 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lucro</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${(todayMetric?.grossProfitUsd || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatUSD(todayMetric?.grossProfitUsd || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatBRL(todayMetric?.grossProfit || 0)}
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
                  retorno por dólar investido
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
                Acompanhe a evolução das suas métricas diárias (valores em USD e BRL)
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
                        <TableHead className="text-right">Gasto</TableHead>
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
                            <div>{formatUSD(metric.totalSpendUsd)}</div>
                            <div className="text-xs text-muted-foreground">{formatBRL(metric.totalSpendBrl)}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            {metric.totalSales}
                          </TableCell>
                          <TableCell className="text-right">
                            <div>{formatUSD(metric.grossRevenueUsd || 0)}</div>
                            <div className="text-xs text-muted-foreground">{formatBRL(metric.grossRevenue)}</div>
                          </TableCell>
                          <TableCell className={`text-right ${(metric.grossProfitUsd || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            <div>{formatUSD(metric.grossProfitUsd || 0)}</div>
                            <div className="text-xs opacity-70">{formatBRL(metric.grossProfit)}</div>
                          </TableCell>
                          <TableCell className={`text-right ${(metric.roi || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {metric.roi?.toFixed(1) || '0'}%
                          </TableCell>
                          <TableCell className="text-right">
                            {metric.roas?.toFixed(2) || '0'}x
                          </TableCell>
                          <TableCell className="text-right">
                            <div>{formatUSD(metric.cpaUsd || 0)}</div>
                            <div className="text-xs text-muted-foreground">{formatBRL(metric.cpa || 0)}</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                generateReport(metric)
                                toast({ title: 'Relatório gerado!' })
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
                      <p className="font-bold">{formatUSD(totals.spendUsd)}</p>
                      <p className="text-xs text-muted-foreground">{formatBRL(totals.spendBrl)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Vendas:</span>
                      <p className="font-bold">{totals.sales}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Faturamento:</span>
                      <p className="font-bold">{formatUSD(totals.revenueUsd)}</p>
                      <p className="text-xs text-muted-foreground">{formatBRL(totals.revenueBrl)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ROI Médio:</span>
                      <p className={`font-bold ${avgRoi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {avgRoi.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">CPA Médio:</span>
                      <p className="font-bold">{formatUSD(avgCpaUsd)}</p>
                      <p className="text-xs text-muted-foreground">{formatBRL(avgCpaBrl)}</p>
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
