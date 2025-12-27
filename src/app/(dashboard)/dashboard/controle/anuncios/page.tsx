'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  Building2,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Download,
  Filter,
  Search,
  MoreVertical,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { useCountry } from '@/contexts/country-context'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

// Types
interface DailyExpense {
  date: string // YYYY-MM-DD
  spent: number
  revenue: number
  notes?: string
}

interface AdAccount {
  id: string
  name: string
  accountId: string // ID da conta de anuncio (ex: act_123456789)
  status: 'active' | 'inactive' | 'paused' | 'disabled'
  dailyBudget: number
  dailyExpenses: DailyExpense[]
  createdAt: string
}

interface BusinessManager {
  id: string
  name: string
  bmId: string // ID do BM (ex: 123456789)
  status: 'active' | 'inactive' | 'restricted'
  adAccounts: AdAccount[]
  createdAt: string
}

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15)

// Get today's date as YYYY-MM-DD
const getTodayDate = () => format(new Date(), 'yyyy-MM-dd')

export default function AnunciosControlPage() {
  const { formatCurrency, defaultCurrency } = useCountry()

  // State
  const [businessManagers, setBusinessManagers] = useState<BusinessManager[]>([])
  const [expandedBMs, setExpandedBMs] = useState<Set<string>>(new Set())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Dialog states
  const [showAddBM, setShowAddBM] = useState(false)
  const [showAddAdAccount, setShowAddAdAccount] = useState(false)
  const [showEditExpense, setShowEditExpense] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Form states
  const [newBM, setNewBM] = useState({ name: '', bmId: '' })
  const [newAdAccount, setNewAdAccount] = useState({ name: '', accountId: '', dailyBudget: '' })
  const [selectedBMId, setSelectedBMId] = useState<string | null>(null)
  const [selectedAdAccountId, setSelectedAdAccountId] = useState<string | null>(null)
  const [expenseForm, setExpenseForm] = useState({ spent: '', revenue: '', notes: '' })
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'bm' | 'adAccount', bmId: string, adAccountId?: string } | null>(null)

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dod-business-managers')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setBusinessManagers(parsed)
        // Expand all BMs by default
        setExpandedBMs(new Set<string>(parsed.map((bm: BusinessManager) => bm.id)))
      } catch {
        // Invalid JSON
      }
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (businessManagers.length > 0) {
      localStorage.setItem('dod-business-managers', JSON.stringify(businessManagers))
    }
  }, [businessManagers])

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

  // Add Business Manager
  const handleAddBM = () => {
    if (!newBM.name.trim() || !newBM.bmId.trim()) {
      toast({
        title: 'Erro!',
        description: 'Preencha todos os campos obrigatorios.',
        variant: 'destructive',
      })
      return
    }

    const bm: BusinessManager = {
      id: generateId(),
      name: newBM.name.trim(),
      bmId: newBM.bmId.trim(),
      status: 'active',
      adAccounts: [],
      createdAt: new Date().toISOString(),
    }

    setBusinessManagers(prev => [...prev, bm])
    setExpandedBMs(prev => new Set([...Array.from(prev), bm.id]))
    setNewBM({ name: '', bmId: '' })
    setShowAddBM(false)

    toast({
      title: 'BM Adicionado!',
      description: `Business Manager "${bm.name}" foi adicionado com sucesso.`,
      className: 'bg-green-500 text-white border-green-600',
    })
  }

  // Add Ad Account
  const handleAddAdAccount = () => {
    if (!newAdAccount.name.trim() || !newAdAccount.accountId.trim() || !selectedBMId) {
      toast({
        title: 'Erro!',
        description: 'Preencha todos os campos obrigatorios.',
        variant: 'destructive',
      })
      return
    }

    const adAccount: AdAccount = {
      id: generateId(),
      name: newAdAccount.name.trim(),
      accountId: newAdAccount.accountId.trim(),
      status: 'active',
      dailyBudget: parseFloat(newAdAccount.dailyBudget) || 0,
      dailyExpenses: [],
      createdAt: new Date().toISOString(),
    }

    setBusinessManagers(prev => prev.map(bm =>
      bm.id === selectedBMId
        ? { ...bm, adAccounts: [...bm.adAccounts, adAccount] }
        : bm
    ))

    setNewAdAccount({ name: '', accountId: '', dailyBudget: '' })
    setShowAddAdAccount(false)
    setSelectedBMId(null)

    toast({
      title: 'Conta Adicionada!',
      description: `Conta de anuncio "${adAccount.name}" foi adicionada com sucesso.`,
      className: 'bg-green-500 text-white border-green-600',
    })
  }

  // Open expense edit dialog
  const openExpenseEdit = (bmId: string, adAccountId: string) => {
    setSelectedBMId(bmId)
    setSelectedAdAccountId(adAccountId)

    // Find existing expense for selected date
    const bm = businessManagers.find(b => b.id === bmId)
    const adAccount = bm?.adAccounts.find(a => a.id === adAccountId)
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const existingExpense = adAccount?.dailyExpenses.find(e => e.date === dateStr)

    if (existingExpense) {
      setExpenseForm({
        spent: existingExpense.spent.toString(),
        revenue: existingExpense.revenue.toString(),
        notes: existingExpense.notes || '',
      })
    } else {
      setExpenseForm({ spent: '', revenue: '', notes: '' })
    }

    setShowEditExpense(true)
  }

  // Save expense
  const handleSaveExpense = () => {
    if (!selectedBMId || !selectedAdAccountId) return

    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const spent = parseFloat(expenseForm.spent) || 0
    const revenue = parseFloat(expenseForm.revenue) || 0

    setBusinessManagers(prev => prev.map(bm => {
      if (bm.id !== selectedBMId) return bm

      return {
        ...bm,
        adAccounts: bm.adAccounts.map(adAccount => {
          if (adAccount.id !== selectedAdAccountId) return adAccount

          const existingIndex = adAccount.dailyExpenses.findIndex(e => e.date === dateStr)
          let updatedExpenses: DailyExpense[]

          if (existingIndex >= 0) {
            // Update existing
            updatedExpenses = adAccount.dailyExpenses.map((e, i) =>
              i === existingIndex
                ? { date: dateStr, spent, revenue, notes: expenseForm.notes }
                : e
            )
          } else {
            // Add new
            updatedExpenses = [
              ...adAccount.dailyExpenses,
              { date: dateStr, spent, revenue, notes: expenseForm.notes }
            ]
          }

          return { ...adAccount, dailyExpenses: updatedExpenses }
        })
      }
    }))

    setShowEditExpense(false)
    setSelectedBMId(null)
    setSelectedAdAccountId(null)
    setExpenseForm({ spent: '', revenue: '', notes: '' })

    toast({
      title: 'Gasto Registrado!',
      description: `Gasto de ${formatCurrency(spent)} registrado para ${format(selectedDate, 'dd/MM/yyyy')}.`,
      className: 'bg-green-500 text-white border-green-600',
    })
  }

  // Delete BM or Ad Account
  const handleDelete = () => {
    if (!deleteTarget) return

    if (deleteTarget.type === 'bm') {
      setBusinessManagers(prev => prev.filter(bm => bm.id !== deleteTarget.bmId))
      toast({
        title: 'BM Removido!',
        description: 'Business Manager foi removido com sucesso.',
        className: 'bg-green-500 text-white border-green-600',
      })
    } else if (deleteTarget.type === 'adAccount' && deleteTarget.adAccountId) {
      setBusinessManagers(prev => prev.map(bm =>
        bm.id === deleteTarget.bmId
          ? { ...bm, adAccounts: bm.adAccounts.filter(a => a.id !== deleteTarget.adAccountId) }
          : bm
      ))
      toast({
        title: 'Conta Removida!',
        description: 'Conta de anuncio foi removida com sucesso.',
        className: 'bg-green-500 text-white border-green-600',
      })
    }

    setShowDeleteConfirm(false)
    setDeleteTarget(null)
  }

  // Calculate totals
  const calculateBMTotals = (bm: BusinessManager, date?: Date) => {
    const targetDate = date ? format(date, 'yyyy-MM-dd') : null

    let totalSpent = 0
    let totalRevenue = 0

    bm.adAccounts.forEach(adAccount => {
      adAccount.dailyExpenses.forEach(expense => {
        if (!targetDate || expense.date === targetDate) {
          totalSpent += expense.spent
          totalRevenue += expense.revenue
        }
      })
    })

    return { totalSpent, totalRevenue, roi: totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent) * 100 : 0 }
  }

  const calculateAdAccountTotals = (adAccount: AdAccount, date?: Date) => {
    const targetDate = date ? format(date, 'yyyy-MM-dd') : null

    let totalSpent = 0
    let totalRevenue = 0

    adAccount.dailyExpenses.forEach(expense => {
      if (!targetDate || expense.date === targetDate) {
        totalSpent += expense.spent
        totalRevenue += expense.revenue
      }
    })

    return { totalSpent, totalRevenue, roi: totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent) * 100 : 0 }
  }

  const calculateGrandTotals = (date?: Date) => {
    let totalSpent = 0
    let totalRevenue = 0

    businessManagers.forEach(bm => {
      const totals = calculateBMTotals(bm, date)
      totalSpent += totals.totalSpent
      totalRevenue += totals.totalRevenue
    })

    return { totalSpent, totalRevenue, roi: totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent) * 100 : 0 }
  }

  // Get expense for specific date
  const getExpenseForDate = (adAccount: AdAccount, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return adAccount.dailyExpenses.find(e => e.date === dateStr)
  }

  // Filter BMs
  const filteredBMs = businessManagers.filter(bm => {
    const matchesSearch = bm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bm.bmId.includes(searchTerm) ||
      bm.adAccounts.some(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.accountId.includes(searchTerm))

    const matchesStatus = filterStatus === 'all' || bm.status === filterStatus

    return matchesSearch && matchesStatus
  })

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
      case 'restricted':
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Restrito</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Grand totals for selected date
  const todayTotals = calculateGrandTotals(selectedDate)
  const monthTotals = calculateGrandTotals()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Controle de Anuncios</h1>
          <p className="text-muted-foreground">
            Gerencie seus Business Managers e contas de anuncio
          </p>
        </div>

        <div className="flex items-center gap-2">
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

          <Dialog open={showAddBM} onOpenChange={setShowAddBM}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo BM
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Business Manager</DialogTitle>
                <DialogDescription>
                  Adicione um novo BM para controlar os gastos das suas contas de anuncio.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="bmName">Nome do BM</Label>
                  <Input
                    id="bmName"
                    placeholder="Ex: BM Principal"
                    value={newBM.name}
                    onChange={(e) => setNewBM(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bmId">ID do Business Manager</Label>
                  <Input
                    id="bmId"
                    placeholder="Ex: 123456789012345"
                    value={newBM.bmId}
                    onChange={(e) => setNewBM(prev => ({ ...prev, bmId: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddBM(false)}>Cancelar</Button>
                <Button onClick={handleAddBM}>Adicionar BM</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gasto Hoje</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(todayTotals.totalSpent)}
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
                <p className="text-sm text-muted-foreground">Receita Hoje</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(todayTotals.totalRevenue)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <ArrowUpRight className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lucro Hoje</p>
                <p className={cn(
                  "text-2xl font-bold",
                  todayTotals.totalRevenue - todayTotals.totalSpent >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {formatCurrency(todayTotals.totalRevenue - todayTotals.totalSpent)}
                </p>
              </div>
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                todayTotals.totalRevenue - todayTotals.totalSpent >= 0 ? "bg-green-500/10" : "bg-red-500/10"
              )}>
                <Wallet className={cn(
                  "h-6 w-6",
                  todayTotals.totalRevenue - todayTotals.totalSpent >= 0 ? "text-green-500" : "text-red-500"
                )} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ROI Hoje</p>
                <p className={cn(
                  "text-2xl font-bold",
                  todayTotals.roi >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {todayTotals.roi.toFixed(1)}%
                </p>
              </div>
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                todayTotals.roi >= 0 ? "bg-green-500/10" : "bg-red-500/10"
              )}>
                {todayTotals.roi >= 0
                  ? <TrendingUp className="h-6 w-6 text-green-500" />
                  : <TrendingDown className="h-6 w-6 text-red-500" />
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
            Resumo do Mes - {format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <ArrowDownRight className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Gasto</p>
                <p className="font-semibold text-red-600">{formatCurrency(monthTotals.totalSpent)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <ArrowUpRight className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Receita</p>
                <p className="font-semibold text-green-600">{formatCurrency(monthTotals.totalRevenue)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                monthTotals.totalRevenue - monthTotals.totalSpent >= 0 ? "bg-green-500/10" : "bg-red-500/10"
              )}>
                <PiggyBank className={cn(
                  "h-5 w-5",
                  monthTotals.totalRevenue - monthTotals.totalSpent >= 0 ? "text-green-500" : "text-red-500"
                )} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Lucro Total</p>
                <p className={cn(
                  "font-semibold",
                  monthTotals.totalRevenue - monthTotals.totalSpent >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {formatCurrency(monthTotals.totalRevenue - monthTotals.totalSpent)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                monthTotals.roi >= 0 ? "bg-green-500/10" : "bg-red-500/10"
              )}>
                <BarChart3 className={cn(
                  "h-5 w-5",
                  monthTotals.roi >= 0 ? "text-green-500" : "text-red-500"
                )} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ROI Mes</p>
                <p className={cn(
                  "font-semibold",
                  monthTotals.roi >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {monthTotals.roi.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar BM ou conta de anuncio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
            <SelectItem value="restricted">Restritos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Business Managers List */}
      <div className="space-y-4">
        {filteredBMs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum Business Manager</h3>
              <p className="text-muted-foreground text-center mb-4">
                Adicione seu primeiro BM para comecar a controlar os gastos.
              </p>
              <Button onClick={() => setShowAddBM(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar BM
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredBMs.map((bm) => {
            const bmTotals = calculateBMTotals(bm, selectedDate)
            const bmMonthTotals = calculateBMTotals(bm)

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
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg">{bm.name}</CardTitle>
                              {getStatusBadge(bm.status)}
                            </div>
                            <CardDescription className="font-mono text-xs">
                              BM ID: {bm.bmId} • {bm.adAccounts.length} conta(s)
                            </CardDescription>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Gasto Hoje</p>
                            <p className="font-semibold text-red-600">{formatCurrency(bmTotals.totalSpent)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Receita Hoje</p>
                            <p className="font-semibold text-green-600">{formatCurrency(bmTotals.totalRevenue)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Total Mes</p>
                            <p className="font-semibold">{formatCurrency(bmMonthTotals.totalSpent)}</p>
                          </div>

                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedBMId(bm.id)
                                setShowAddAdAccount(true)
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setDeleteTarget({ type: 'bm', bmId: bm.id })
                                setShowDeleteConfirm(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      {bm.adAccounts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 border-t">
                          <CreditCard className="h-8 w-8 text-muted-foreground/50 mb-2" />
                          <p className="text-sm text-muted-foreground mb-3">
                            Nenhuma conta de anuncio cadastrada
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBMId(bm.id)
                              setShowAddAdAccount(true)
                            }}
                            className="gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Adicionar Conta
                          </Button>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Conta de Anuncio</TableHead>
                              <TableHead>ID</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Gasto Hoje</TableHead>
                              <TableHead className="text-right">Receita Hoje</TableHead>
                              <TableHead className="text-right">Lucro</TableHead>
                              <TableHead className="text-right">Total Mes</TableHead>
                              <TableHead className="w-[100px]">Acoes</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {bm.adAccounts.map((adAccount) => {
                              const expense = getExpenseForDate(adAccount, selectedDate)
                              const adTotals = calculateAdAccountTotals(adAccount)
                              const todayProfit = (expense?.revenue || 0) - (expense?.spent || 0)

                              return (
                                <TableRow key={adAccount.id}>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium">{adAccount.name}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                      {adAccount.accountId}
                                    </code>
                                  </TableCell>
                                  <TableCell>{getStatusBadge(adAccount.status)}</TableCell>
                                  <TableCell className="text-right font-medium text-red-600">
                                    {formatCurrency(expense?.spent || 0)}
                                  </TableCell>
                                  <TableCell className="text-right font-medium text-green-600">
                                    {formatCurrency(expense?.revenue || 0)}
                                  </TableCell>
                                  <TableCell className={cn(
                                    "text-right font-medium",
                                    todayProfit >= 0 ? "text-green-600" : "text-red-600"
                                  )}>
                                    {formatCurrency(todayProfit)}
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    {formatCurrency(adTotals.totalSpent)}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => openExpenseEdit(bm.id, adAccount.id)}
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => {
                                          setDeleteTarget({ type: 'adAccount', bmId: bm.id, adAccountId: adAccount.id })
                                          setShowDeleteConfirm(true)
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )
          })
        )}
      </div>

      {/* Add Ad Account Dialog */}
      <Dialog open={showAddAdAccount} onOpenChange={setShowAddAdAccount}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Conta de Anuncio</DialogTitle>
            <DialogDescription>
              Adicione uma nova conta de anuncio ao Business Manager selecionado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="adAccountName">Nome da Conta</Label>
              <Input
                id="adAccountName"
                placeholder="Ex: Conta Principal"
                value={newAdAccount.name}
                onChange={(e) => setNewAdAccount(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adAccountId">ID da Conta de Anuncio</Label>
              <Input
                id="adAccountId"
                placeholder="Ex: act_123456789"
                value={newAdAccount.accountId}
                onChange={(e) => setNewAdAccount(prev => ({ ...prev, accountId: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dailyBudget">Orcamento Diario (opcional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {defaultCurrency.symbol}
                </span>
                <Input
                  id="dailyBudget"
                  type="number"
                  placeholder="0.00"
                  value={newAdAccount.dailyBudget}
                  onChange={(e) => setNewAdAccount(prev => ({ ...prev, dailyBudget: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddAdAccount(false)
              setSelectedBMId(null)
            }}>
              Cancelar
            </Button>
            <Button onClick={handleAddAdAccount}>Adicionar Conta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Expense Dialog */}
      <Dialog open={showEditExpense} onOpenChange={setShowEditExpense}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Gasto do Dia</DialogTitle>
            <DialogDescription>
              {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="spent">Valor Gasto</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {defaultCurrency.symbol}
                </span>
                <Input
                  id="spent"
                  type="number"
                  placeholder="0.00"
                  value={expenseForm.spent}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, spent: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="revenue">Receita Gerada</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {defaultCurrency.symbol}
                </span>
                <Input
                  id="revenue"
                  type="number"
                  placeholder="0.00"
                  value={expenseForm.revenue}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, revenue: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observacoes (opcional)</Label>
              <Input
                id="notes"
                placeholder="Alguma observacao sobre o dia..."
                value={expenseForm.notes}
                onChange={(e) => setExpenseForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            {/* Quick preview */}
            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Lucro:</span>
                <span className={cn(
                  "font-medium",
                  (parseFloat(expenseForm.revenue) || 0) - (parseFloat(expenseForm.spent) || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                )}>
                  {formatCurrency((parseFloat(expenseForm.revenue) || 0) - (parseFloat(expenseForm.spent) || 0))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ROI:</span>
                <span className={cn(
                  "font-medium",
                  ((parseFloat(expenseForm.revenue) || 0) - (parseFloat(expenseForm.spent) || 0)) / (parseFloat(expenseForm.spent) || 1) * 100 >= 0
                    ? "text-green-600"
                    : "text-red-600"
                )}>
                  {((parseFloat(expenseForm.spent) || 0) > 0
                    ? (((parseFloat(expenseForm.revenue) || 0) - (parseFloat(expenseForm.spent) || 0)) / (parseFloat(expenseForm.spent) || 1) * 100).toFixed(1)
                    : 0
                  )}%
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditExpense(false)
              setSelectedBMId(null)
              setSelectedAdAccountId(null)
            }}>
              Cancelar
            </Button>
            <Button onClick={handleSaveExpense}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirmar Exclusao
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === 'bm'
                ? 'Tem certeza que deseja excluir este Business Manager? Todas as contas de anuncio e historico de gastos serao removidos permanentemente.'
                : 'Tem certeza que deseja excluir esta conta de anuncio? Todo o historico de gastos sera removido permanentemente.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteConfirm(false)
              setDeleteTarget(null)
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
