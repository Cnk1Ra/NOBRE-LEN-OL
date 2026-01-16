'use client'

import { useState, useEffect, useCallback } from 'react'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  Check,
  Loader2,
  RefreshCw,
  Calendar as CalendarIcon,
  Facebook,
  Link2,
  CloudDownload,
  AlertCircle,
  Pencil,
  Eye,
  MousePointer,
  Users,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface FacebookAccount {
  id: string
  accountId: string
  accountName: string
  currency: string
  timezone: string
  isActive: boolean
  lastSyncAt: string | null
}

interface DailySpend {
  id: string
  date: string
  adAccountId: string
  adAccountName: string | null
  campaignId: string | null
  campaignName: string | null
  spendUsd: number
  spendBrl: number
  impressions: number
  clicks: number
  reach: number
  cpm: number | null
  cpc: number | null
  ctr: number | null
  results: number
  costPerResult: number | null
}

type DatePreset = 'today' | 'yesterday' | 'last_7d' | 'last_30d' | 'custom'

export default function MediaBuyerPage() {
  // Data states
  const [dailySpends, setDailySpends] = useState<DailySpend[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
    accountId: '',
    accountName: '',
    accessToken: '',
    currency: 'USD',
    timezone: 'America/Los_Angeles',
  })

  // Date filter states
  const [datePreset, setDatePreset] = useState<DatePreset>('today')
  const [customStartDate, setCustomStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [customEndDate, setCustomEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [usdRate, setUsdRate] = useState('5.70')

  // Get date range based on preset
  const getDateRange = useCallback(() => {
    const today = new Date()
    let startDate: string
    let endDate: string = format(today, 'yyyy-MM-dd')

    switch (datePreset) {
      case 'today':
        startDate = format(today, 'yyyy-MM-dd')
        break
      case 'yesterday':
        startDate = format(subDays(today, 1), 'yyyy-MM-dd')
        endDate = format(subDays(today, 1), 'yyyy-MM-dd')
        break
      case 'last_7d':
        startDate = format(subDays(today, 6), 'yyyy-MM-dd')
        break
      case 'last_30d':
        startDate = format(subDays(today, 29), 'yyyy-MM-dd')
        break
      case 'custom':
        startDate = customStartDate
        endDate = customEndDate
        break
      default:
        startDate = format(today, 'yyyy-MM-dd')
    }

    return { startDate, endDate }
  }, [datePreset, customStartDate, customEndDate])

  // Fetch spend data
  const fetchSpendData = useCallback(async () => {
    setIsLoading(true)
    try {
      const { startDate, endDate } = getDateRange()
      const response = await fetch(`/api/media-buyer/spend?startDate=${startDate}&endDate=${endDate}`)
      if (response.ok) {
        const data = await response.json()
        setDailySpends(data.data || [])
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }, [getDateRange])

  // Fetch Facebook accounts
  const fetchFbAccounts = useCallback(async () => {
    try {
      const response = await fetch('/api/media-buyer/accounts')
      if (response.ok) {
        const data = await response.json()
        setFbAccounts(data.data || [])
        const activeAccount = (data.data || []).find((a: FacebookAccount) => a.isActive)
        if (activeAccount && !selectedFbAccount) {
          setSelectedFbAccount(activeAccount.id)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar contas Facebook:', error)
    }
  }, [selectedFbAccount])

  // Sync Facebook data
  const syncFacebookData = async () => {
    if (!selectedFbAccount) {
      toast({ title: 'Selecione uma conta do Facebook', variant: 'destructive' })
      return
    }

    setIsSyncing(true)
    try {
      const { startDate, endDate } = getDateRange()

      const response = await fetch('/api/media-buyer/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: selectedFbAccount,
          startDate,
          endDate,
          usdToBrlRate: parseFloat(usdRate) || 5.70,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({ title: data.message || 'Sincronização concluída!' })
        fetchSpendData()
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

  // Add Facebook account
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

  // Update Facebook account
  const updateFbAccount = async () => {
    if (!editingAccount || !editFormData.accountId || !editFormData.accountName) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' })
      return
    }

    setIsAddingAccount(true)
    try {
      const response = await fetch('/api/media-buyer/accounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingAccount.id,
          accountId: editFormData.accountId,
          accountName: editFormData.accountName,
          accessToken: editFormData.accessToken || undefined,
          currency: editFormData.currency,
          timezone: editFormData.timezone,
        }),
      })

      if (response.ok) {
        toast({ title: 'Conta atualizada com sucesso!' })
        setEditFormData({ accountId: '', accountName: '', accessToken: '', currency: 'USD', timezone: 'America/Los_Angeles' })
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

  // Open edit dialog
  const openEditDialog = (account: FacebookAccount) => {
    setEditingAccount(account)
    setEditFormData({
      accountId: account.accountId,
      accountName: account.accountName,
      accessToken: '',
      currency: account.currency,
      timezone: account.timezone,
    })
    setIsEditDialogOpen(true)
  }

  useEffect(() => {
    fetchFbAccounts()
  }, [fetchFbAccounts])

  useEffect(() => {
    fetchSpendData()
  }, [fetchSpendData])

  // Calculate totals for the period
  const totals = dailySpends.reduce((acc, spend) => ({
    spendUsd: acc.spendUsd + spend.spendUsd,
    spendBrl: acc.spendBrl + spend.spendBrl,
    impressions: acc.impressions + spend.impressions,
    clicks: acc.clicks + spend.clicks,
    reach: acc.reach + spend.reach,
    results: acc.results + spend.results,
  }), { spendUsd: 0, spendBrl: 0, impressions: 0, clicks: 0, reach: 0, results: 0 })

  // Calculate averages
  const avgCpm = totals.impressions > 0 ? (totals.spendUsd / totals.impressions) * 1000 : 0
  const avgCpc = totals.clicks > 0 ? totals.spendUsd / totals.clicks : 0
  const avgCtr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0
  const avgCostPerResult = totals.results > 0 ? totals.spendUsd / totals.results : 0

  // Group by date for table
  const spendsByDate = dailySpends.reduce((acc, spend) => {
    const dateKey = spend.date.split('T')[0]
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: dateKey,
        spendUsd: 0,
        spendBrl: 0,
        impressions: 0,
        clicks: 0,
        reach: 0,
        results: 0,
      }
    }
    acc[dateKey].spendUsd += spend.spendUsd
    acc[dateKey].spendBrl += spend.spendBrl
    acc[dateKey].impressions += spend.impressions
    acc[dateKey].clicks += spend.clicks
    acc[dateKey].reach += spend.reach
    acc[dateKey].results += spend.results
    return acc
  }, {} as Record<string, { date: string; spendUsd: number; spendBrl: number; impressions: number; clicks: number; reach: number; results: number }>)

  const dailyData = Object.values(spendsByDate).sort((a, b) => b.date.localeCompare(a.date))

  // Format helpers
  const formatUSD = (value: number) => `$${value.toFixed(2)}`
  const formatBRL = (value: number) => `R$ ${value.toFixed(2)}`
  const formatNumber = (value: number) => value.toLocaleString('pt-BR')

  const getPresetLabel = (preset: DatePreset) => {
    switch (preset) {
      case 'today': return 'Hoje'
      case 'yesterday': return 'Ontem'
      case 'last_7d': return 'Últimos 7 dias'
      case 'last_30d': return 'Últimos 30 dias'
      case 'custom': return 'Personalizado'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Media Buyer</h1>
            <Badge variant="outline" className="gap-1 border-blue-500/30 bg-blue-500/10 text-blue-500">
              <Facebook className="h-3 w-3" />
              Facebook Ads
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Dados sincronizados automaticamente do Facebook Ads
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <Select value={datePreset} onValueChange={(v) => setDatePreset(v as DatePreset)}>
            <SelectTrigger className="w-[160px]">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="yesterday">Ontem</SelectItem>
              <SelectItem value="last_7d">Últimos 7 dias</SelectItem>
              <SelectItem value="last_30d">Últimos 30 dias</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          {datePreset === 'custom' && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                className="w-[140px] h-9"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
              <span className="text-muted-foreground">até</span>
              <Input
                type="date"
                className="w-[140px] h-9"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </div>
          )}

          <Button variant="outline" size="sm" onClick={fetchSpendData} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Atualizar
          </Button>
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
                    Configure sua conta do Facebook Ads para sincronização automática
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
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Moeda</Label>
                      <Select
                        value={fbFormData.currency}
                        onValueChange={(v) => setFbFormData({ ...fbFormData, currency: v })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="BRL">BRL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select
                        value={fbFormData.timezone}
                        onValueChange={(v) => setFbFormData({ ...fbFormData, timezone: v })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Los_Angeles">PT (Los Angeles)</SelectItem>
                          <SelectItem value="America/Sao_Paulo">BRT (São Paulo)</SelectItem>
                          <SelectItem value="America/New_York">EST (New York)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsFbDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={addFbAccount} disabled={isAddingAccount}>
                    {isAddingAccount ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Link2 className="h-4 w-4 mr-2" />}
                    Conectar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Pencil className="h-5 w-5 text-[#1877F2]" />
                    Editar Conta
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>ID da Conta</Label>
                    <Input
                      value={editFormData.accountId}
                      onChange={(e) => setEditFormData({ ...editFormData, accountId: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input
                      value={editFormData.accountName}
                      onChange={(e) => setEditFormData({ ...editFormData, accountName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Novo Token (deixe vazio para manter)</Label>
                    <Input
                      type="password"
                      placeholder="EAAxxxxxxxx..."
                      value={editFormData.accessToken}
                      onChange={(e) => setEditFormData({ ...editFormData, accessToken: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Moeda</Label>
                      <Select value={editFormData.currency} onValueChange={(v) => setEditFormData({ ...editFormData, currency: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="BRL">BRL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select value={editFormData.timezone} onValueChange={(v) => setEditFormData({ ...editFormData, timezone: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Los_Angeles">PT</SelectItem>
                          <SelectItem value="America/Sao_Paulo">BRT</SelectItem>
                          <SelectItem value="America/New_York">EST</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={updateFbAccount} disabled={isAddingAccount}>
                    {isAddingAccount ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                    Salvar
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
                  Adicione uma conta do Facebook Ads para sincronizar
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 w-full sm:w-auto">
                <Select value={selectedFbAccount} onValueChange={setSelectedFbAccount}>
                  <SelectTrigger className="w-full sm:w-[300px]">
                    <SelectValue placeholder="Selecione uma conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {fbAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.accountName} ({account.accountId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">USD/BRL:</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="w-20 h-9"
                    value={usdRate}
                    onChange={(e) => setUsdRate(e.target.value)}
                  />
                </div>
                <Button
                  onClick={syncFacebookData}
                  disabled={isSyncing || !selectedFbAccount}
                  className="bg-[#1877F2] hover:bg-[#1877F2]/90"
                >
                  {isSyncing ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sincronizando...</>
                  ) : (
                    <><CloudDownload className="h-4 w-4 mr-2" />Sincronizar {getPresetLabel(datePreset)}</>
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
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
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
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gasto Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatUSD(totals.spendUsd)}</div>
                <p className="text-xs text-muted-foreground">{formatBRL(totals.spendBrl)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Impressões</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(totals.impressions)}</div>
                <p className="text-xs text-muted-foreground">CPM: {formatUSD(avgCpm)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cliques</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(totals.clicks)}</div>
                <p className="text-xs text-muted-foreground">CPC: {formatUSD(avgCpc)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CTR</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgCtr.toFixed(2)}%</div>
                <p className="text-xs text-muted-foreground">taxa de cliques</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alcance</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(totals.reach)}</div>
                <p className="text-xs text-muted-foreground">pessoas alcançadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resultados</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(totals.results)}</div>
                <p className="text-xs text-muted-foreground">
                  {totals.results > 0 ? `CPR: ${formatUSD(avgCostPerResult)}` : 'sem conversões'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Diários - {getPresetLabel(datePreset)}</CardTitle>
              <CardDescription>
                Detalhamento por dia do período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dailyData.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CloudDownload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum dado encontrado para o período</p>
                  <p className="text-sm">Clique em "Sincronizar" para buscar dados do Facebook</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Gasto (USD)</TableHead>
                        <TableHead className="text-right">Gasto (BRL)</TableHead>
                        <TableHead className="text-right">Impressões</TableHead>
                        <TableHead className="text-right">Cliques</TableHead>
                        <TableHead className="text-right">CTR</TableHead>
                        <TableHead className="text-right">Alcance</TableHead>
                        <TableHead className="text-right">Resultados</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailyData.map((day) => {
                        const ctr = day.impressions > 0 ? (day.clicks / day.impressions) * 100 : 0
                        return (
                          <TableRow key={day.date}>
                            <TableCell className="font-medium">
                              {format(new Date(day.date + 'T12:00:00'), 'dd/MM/yyyy', { locale: ptBR })}
                            </TableCell>
                            <TableCell className="text-right">{formatUSD(day.spendUsd)}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{formatBRL(day.spendBrl)}</TableCell>
                            <TableCell className="text-right">{formatNumber(day.impressions)}</TableCell>
                            <TableCell className="text-right">{formatNumber(day.clicks)}</TableCell>
                            <TableCell className="text-right">{ctr.toFixed(2)}%</TableCell>
                            <TableCell className="text-right">{formatNumber(day.reach)}</TableCell>
                            <TableCell className="text-right">{formatNumber(day.results)}</TableCell>
                          </TableRow>
                        )
                      })}
                      {/* Total Row */}
                      <TableRow className="bg-muted/50 font-semibold">
                        <TableCell>TOTAL</TableCell>
                        <TableCell className="text-right">{formatUSD(totals.spendUsd)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{formatBRL(totals.spendBrl)}</TableCell>
                        <TableCell className="text-right">{formatNumber(totals.impressions)}</TableCell>
                        <TableCell className="text-right">{formatNumber(totals.clicks)}</TableCell>
                        <TableCell className="text-right">{avgCtr.toFixed(2)}%</TableCell>
                        <TableCell className="text-right">{formatNumber(totals.reach)}</TableCell>
                        <TableCell className="text-right">{formatNumber(totals.results)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
