'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Building2,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Search,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Link2,
  Link2Off,
  ExternalLink,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  Check,
  Info,
  Facebook,
  ChevronLeft,
  ChevronRightIcon,
} from 'lucide-react'
import { useMeta } from '@/contexts/meta-context'
import { useCountry } from '@/contexts/country-context'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function AnunciosControlPage() {
  const { formatCurrency } = useCountry()
  const {
    isConnected,
    isLoading,
    accessToken,
    businessManagers,
    adAccounts,
    lastSync,
    connect,
    disconnect,
    refreshData,
    syncAllData,
    setManualToken,
  } = useMeta()

  // State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [dateRange, setDateRange] = useState<'day' | 'week' | 'month' | 'custom'>('day')
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [expandedBMs, setExpandedBMs] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [showTokenInput, setShowTokenInput] = useState(false)
  const [tokenInput, setTokenInput] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'daily' | 'accounts'>('overview')

  // Expand all BMs by default when data loads
  useEffect(() => {
    if (businessManagers.length > 0) {
      setExpandedBMs(new Set(businessManagers.map(bm => bm.id)))
    }
  }, [businessManagers])

  // Calculate date range based on selection
  useEffect(() => {
    const today = new Date()
    switch (dateRange) {
      case 'day':
        setStartDate(selectedDate)
        setEndDate(selectedDate)
        break
      case 'week':
        setStartDate(subDays(today, 7))
        setEndDate(today)
        break
      case 'month':
        setStartDate(startOfMonth(today))
        setEndDate(endOfMonth(today))
        break
    }
  }, [dateRange, selectedDate])

  // Toggle BM expansion
  const toggleBM = (bmId: string) => {
    setExpandedBMs(prev => {
      const next = new Set(prev)
      if (next.has(bmId)) {
        next.delete(bmId)
      } else {
        next.add(bmId)
      }
      return next
    })
  }

  // Handle connect with token
  const handleConnect = () => {
    if (!tokenInput.trim()) {
      toast({
        title: 'Token obrigatorio',
        description: 'Por favor, insira o Access Token do Meta.',
        variant: 'destructive',
      })
      return
    }

    setManualToken(tokenInput.trim())
    setShowConnectDialog(false)
    setTokenInput('')
    setShowTokenInput(false)
  }

  // Copy token
  const handleCopyToken = () => {
    if (accessToken) {
      navigator.clipboard.writeText(accessToken)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Calculate spend for a specific date range
  const getSpendForDateRange = (
    dailySpend: Array<{ date: string; spent: number }>,
    start: Date,
    end: Date
  ) => {
    return dailySpend
      .filter(day => {
        const dayDate = new Date(day.date)
        return dayDate >= start && dayDate <= end
      })
      .reduce((sum, day) => sum + day.spent, 0)
  }

  // Get spend for selected date
  const getSpendForDate = (
    dailySpend: Array<{ date: string; spent: number }>,
    date: Date
  ) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const day = dailySpend.find(d => d.date === dateStr)
    return day?.spent || 0
  }

  // Calculate totals for the selected period
  const periodTotals = useMemo(() => {
    let totalSpent = 0
    let accountCount = 0

    adAccounts.forEach(account => {
      const spent = dateRange === 'day'
        ? getSpendForDate(account.dailySpend, selectedDate)
        : getSpendForDateRange(account.dailySpend, startDate, endDate)
      totalSpent += spent
      if (spent > 0) accountCount++
    })

    return { totalSpent, accountCount }
  }, [adAccounts, dateRange, selectedDate, startDate, endDate])

  // Calculate BM totals
  const getBMTotals = (bmId: string) => {
    const bm = businessManagers.find(b => b.id === bmId)
    if (!bm) return { totalSpent: 0, accountCount: 0 }

    let totalSpent = 0
    bm.adAccounts.forEach(account => {
      const spent = dateRange === 'day'
        ? getSpendForDate(account.dailySpend, selectedDate)
        : getSpendForDateRange(account.dailySpend, startDate, endDate)
      totalSpent += spent
    })

    return { totalSpent, accountCount: bm.adAccounts.length }
  }

  // Filter BMs by search
  const filteredBMs = businessManagers.filter(bm => {
    const matchesSearch =
      bm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bm.adAccounts.some(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.accountId.includes(searchTerm)
      )
    return matchesSearch
  })

  // Get all days in the current month for daily view
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(selectedDate)
    const end = endOfMonth(selectedDate)
    return eachDayOfInterval({ start, end })
  }, [selectedDate])

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Ativo</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>
      case 'paused':
        return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Pausado</Badge>
      case 'disabled':
        return <Badge variant="destructive">Desativado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Navigate month
  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Controle de Anuncios</h1>
          <p className="text-muted-foreground">
            {isConnected
              ? `Conectado ao Meta • Ultima sincronizacao: ${lastSync ? format(lastSync, "dd/MM 'as' HH:mm") : 'Nunca'}`
              : 'Conecte sua conta Meta para ver os gastos automaticamente'
            }
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Button
                variant="outline"
                onClick={() => refreshData()}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                {isLoading ? 'Sincronizando...' : 'Atualizar'}
              </Button>
              <Button
                variant="outline"
                onClick={() => disconnect()}
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Link2Off className="h-4 w-4" />
                Desconectar
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setShowConnectDialog(true)}
              className="gap-2 bg-[#1877F2] hover:bg-[#166FE5]"
            >
              <Facebook className="h-4 w-4" />
              Conectar ao Meta
            </Button>
          )}
        </div>
      </div>

      {/* Connection Required Card */}
      {!isConnected && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1877F2]/10 mb-4">
              <Facebook className="h-8 w-8 text-[#1877F2]" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Conecte sua conta Meta</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Para ver automaticamente os gastos de cada BM e conta de anuncio,
              conecte sua conta do Meta Business Suite.
            </p>
            <Button
              onClick={() => setShowConnectDialog(true)}
              className="gap-2 bg-[#1877F2] hover:bg-[#166FE5]"
            >
              <Facebook className="h-4 w-4" />
              Conectar ao Meta
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Content - Only show when connected */}
      {isConnected && (
        <>
          {/* Date Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Select value={dateRange} onValueChange={(v: 'day' | 'week' | 'month' | 'custom') => setDateRange(v)}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Dia especifico</SelectItem>
                      <SelectItem value="week">Ultimos 7 dias</SelectItem>
                      <SelectItem value="month">Este mes</SelectItem>
                    </SelectContent>
                  </Select>

                  {dateRange === 'day' && (
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="date"
                        value={format(selectedDate, 'yyyy-MM-dd')}
                        onChange={(e) => {
                          const date = new Date(e.target.value + 'T12:00:00')
                          if (!isNaN(date.getTime())) {
                            setSelectedDate(date)
                          }
                        }}
                        className="pl-9 w-[180px]"
                      />
                    </div>
                  )}

                  {dateRange === 'month' && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="font-medium min-w-[140px] text-center">
                        {format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                      <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
                        <ChevronRightIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar BM ou conta..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {dateRange === 'day' ? 'Gasto do Dia' :
                       dateRange === 'week' ? 'Gasto 7 dias' : 'Gasto do Mes'}
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(periodTotals.totalSpent)}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                    <ArrowDownRight className="h-6 w-6 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Business Managers</p>
                    <p className="text-2xl font-bold">{businessManagers.length}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                    <Building2 className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Contas de Anuncio</p>
                    <p className="text-2xl font-bold">{adAccounts.length}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                    <CreditCard className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Contas Ativas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {periodTotals.accountCount}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different views */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList>
              <TabsTrigger value="overview">Visao Geral</TabsTrigger>
              <TabsTrigger value="daily">Gastos Diarios</TabsTrigger>
              <TabsTrigger value="accounts">Todas as Contas</TabsTrigger>
            </TabsList>

            {/* Overview Tab - BMs with nested accounts */}
            <TabsContent value="overview" className="space-y-4">
              {filteredBMs.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {isLoading ? 'Carregando dados...' : 'Nenhum Business Manager encontrado'}
                    </h3>
                    <p className="text-muted-foreground text-center">
                      {isLoading
                        ? 'Buscando suas contas de anuncio do Meta...'
                        : 'Clique em Atualizar para sincronizar seus dados do Meta.'
                      }
                    </p>
                    {isLoading && (
                      <Loader2 className="h-8 w-8 animate-spin text-primary mt-4" />
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredBMs.map((bm) => {
                  const bmTotals = getBMTotals(bm.id)

                  return (
                    <Card key={bm.id} className="overflow-hidden">
                      <Collapsible
                        open={expandedBMs.has(bm.id)}
                        onOpenChange={() => toggleBM(bm.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {expandedBMs.has(bm.id) ? (
                                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                )}
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                  <Building2 className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{bm.name}</CardTitle>
                                  <CardDescription>
                                    {bm.adAccounts.length} conta(s) de anuncio
                                  </CardDescription>
                                </div>
                              </div>

                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">
                                    {dateRange === 'day' ? 'Gasto do Dia' :
                                     dateRange === 'week' ? 'Gasto 7 dias' : 'Gasto do Mes'}
                                  </p>
                                  <p className="text-xl font-bold text-red-600">
                                    {formatCurrency(bmTotals.totalSpent)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">Total Geral</p>
                                  <p className="font-semibold">{formatCurrency(bm.totalSpent)}</p>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <CardContent className="pt-0">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Conta de Anuncio</TableHead>
                                  <TableHead>ID</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Moeda</TableHead>
                                  <TableHead className="text-right">
                                    {dateRange === 'day' ? 'Gasto do Dia' :
                                     dateRange === 'week' ? 'Gasto 7 dias' : 'Gasto do Mes'}
                                  </TableHead>
                                  <TableHead className="text-right">Total Geral</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {bm.adAccounts.map((account) => {
                                  const periodSpend = dateRange === 'day'
                                    ? getSpendForDate(account.dailySpend, selectedDate)
                                    : getSpendForDateRange(account.dailySpend, startDate, endDate)

                                  return (
                                    <TableRow key={account.id}>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                                          <span className="font-medium">{account.name}</span>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                          {account.accountId}
                                        </code>
                                      </TableCell>
                                      <TableCell>{getStatusBadge(account.status)}</TableCell>
                                      <TableCell>
                                        <Badge variant="outline">{account.currency}</Badge>
                                      </TableCell>
                                      <TableCell className="text-right font-medium text-red-600">
                                        {formatCurrency(periodSpend)}
                                      </TableCell>
                                      <TableCell className="text-right font-medium">
                                        {formatCurrency(account.totalSpent)}
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  )
                })
              )}
            </TabsContent>

            {/* Daily Tab - Day by day spending */}
            <TabsContent value="daily">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Gastos Diarios</CardTitle>
                      <CardDescription>
                        Veja o gasto de cada dia do mes de {format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
                        <ChevronRightIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Dia</TableHead>
                        {businessManagers.map(bm => (
                          <TableHead key={bm.id} className="text-right">{bm.name}</TableHead>
                        ))}
                        <TableHead className="text-right font-bold">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {daysInMonth.map(day => {
                        const dayStr = format(day, 'yyyy-MM-dd')
                        const isToday = isSameDay(day, new Date())
                        let dayTotal = 0

                        return (
                          <TableRow
                            key={dayStr}
                            className={cn(
                              isToday && "bg-primary/5",
                              isSameDay(day, selectedDate) && "bg-blue-50 dark:bg-blue-950/30"
                            )}
                          >
                            <TableCell className="font-medium">
                              {format(day, 'dd/MM')}
                              {isToday && (
                                <Badge className="ml-2 bg-green-500">Hoje</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(day, 'EEEE', { locale: ptBR })}
                            </TableCell>
                            {businessManagers.map(bm => {
                              let bmDaySpend = 0
                              bm.adAccounts.forEach(account => {
                                const spend = getSpendForDate(account.dailySpend, day)
                                bmDaySpend += spend
                              })
                              dayTotal += bmDaySpend

                              return (
                                <TableCell key={bm.id} className="text-right">
                                  <span className={bmDaySpend > 0 ? "text-red-600 font-medium" : "text-muted-foreground"}>
                                    {formatCurrency(bmDaySpend)}
                                  </span>
                                </TableCell>
                              )
                            })}
                            <TableCell className="text-right font-bold">
                              <span className={dayTotal > 0 ? "text-red-600" : "text-muted-foreground"}>
                                {formatCurrency(dayTotal)}
                              </span>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* All Accounts Tab */}
            <TabsContent value="accounts">
              <Card>
                <CardHeader>
                  <CardTitle>Todas as Contas de Anuncio</CardTitle>
                  <CardDescription>
                    Lista completa de todas as contas de anuncio conectadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Conta</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Business Manager</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Moeda</TableHead>
                        <TableHead className="text-right">Gasto Hoje</TableHead>
                        <TableHead className="text-right">Gasto 7 dias</TableHead>
                        <TableHead className="text-right">Total Geral</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adAccounts
                        .filter(a =>
                          a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.accountId.includes(searchTerm)
                        )
                        .map((account) => {
                          const todaySpend = getSpendForDate(account.dailySpend, new Date())
                          const weekSpend = getSpendForDateRange(
                            account.dailySpend,
                            subDays(new Date(), 7),
                            new Date()
                          )

                          return (
                            <TableRow key={account.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{account.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                  {account.accountId}
                                </code>
                              </TableCell>
                              <TableCell>
                                {account.businessName || 'Pessoal'}
                              </TableCell>
                              <TableCell>{getStatusBadge(account.status)}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{account.currency}</Badge>
                              </TableCell>
                              <TableCell className="text-right font-medium text-red-600">
                                {formatCurrency(todaySpend)}
                              </TableCell>
                              <TableCell className="text-right font-medium text-orange-600">
                                {formatCurrency(weekSpend)}
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                {formatCurrency(account.totalSpent)}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Connect Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Facebook className="h-5 w-5 text-[#1877F2]" />
              Conectar ao Meta Business
            </DialogTitle>
            <DialogDescription>
              Para buscar automaticamente os gastos das suas contas de anuncio,
              voce precisa gerar um Access Token no Meta Business Suite.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Instructions */}
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                Como obter o Access Token:
              </h4>
              <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
                <li>Acesse o <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Graph API Explorer</a></li>
                <li>Selecione seu App ou crie um novo</li>
                <li>Clique em "Generate Access Token"</li>
                <li>Marque as permissoes: <code className="bg-muted px-1 rounded">ads_read</code>, <code className="bg-muted px-1 rounded">business_management</code></li>
                <li>Copie o token gerado e cole abaixo</li>
              </ol>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => window.open('https://developers.facebook.com/tools/explorer/', '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
                Abrir Graph API Explorer
              </Button>
            </div>

            <Separator />

            {/* Token Input */}
            <div className="space-y-2">
              <Label htmlFor="accessToken">Access Token</Label>
              <div className="relative">
                <Input
                  id="accessToken"
                  type={showToken ? 'text' : 'password'}
                  placeholder="Cole seu Access Token aqui..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="pr-10 font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                O token sera armazenado localmente no seu navegador.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConnect}
              disabled={!tokenInput.trim()}
              className="gap-2 bg-[#1877F2] hover:bg-[#166FE5]"
            >
              <Link2 className="h-4 w-4" />
              Conectar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
