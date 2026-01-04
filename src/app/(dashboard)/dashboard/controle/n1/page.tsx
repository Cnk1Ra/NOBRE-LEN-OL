'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  Warehouse,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Download,
  Upload,
  Filter,
  Clock,
  Package,
  TrendingUp,
  AlertCircle,
  Link2,
  Unlink,
  Wifi,
  WifiOff,
  Zap,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Copy,
  Send,
  Save,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useN1Warehouse, N1_STATUS_MAP } from '@/hooks/use-n1-warehouse'
import { toast } from '@/hooks/use-toast'

// Country configuration
const countries: Record<string, { flag: string; name: string; currency: string; symbol: string }> = {
  BR: { flag: '🇧🇷', name: 'Brasil', currency: 'BRL', symbol: 'R$' },
  PT: { flag: '🇵🇹', name: 'Portugal', currency: 'EUR', symbol: '€' },
  ES: { flag: '🇪🇸', name: 'Espanha', currency: 'EUR', symbol: '€' },
  IT: { flag: '🇮🇹', name: 'Itália', currency: 'EUR', symbol: '€' },
  AO: { flag: '🇦🇴', name: 'Angola', currency: 'AOA', symbol: 'Kz' },
  MZ: { flag: '🇲🇿', name: 'Moçambique', currency: 'MZN', symbol: 'MT' },
}

const dodStatusOptions = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'SHIPPED', label: 'Enviado' },
  { value: 'DELIVERED', label: 'Entregue' },
  { value: 'RETURNED', label: 'Devolvido' },
]

const dodStatusMap: Record<string, { label: string; color: string }> = {
  'PENDING': { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-500' },
  'SHIPPED': { label: 'Enviado', color: 'bg-blue-500/10 text-blue-500' },
  'DELIVERED': { label: 'Entregue', color: 'bg-green-500/10 text-green-500' },
  'RETURNED': { label: 'Devolvido', color: 'bg-red-500/10 text-red-500' },
}

interface DODOrder {
  id: string
  country: string
  customer: string
  total: number
  status: string
  date: string
  trackingCode: string
  phone?: string
  email?: string
  address?: string
}

// DOD orders data - starts empty, will be populated from API/database
const initialDodOrders: DODOrder[] = []

export default function N1ControlPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCountry, setFilterCountry] = useState('all')

  // State for orders (editable)
  const [dodOrders, setDodOrders] = useState<DODOrder[]>(initialDodOrders)

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<DODOrder | null>(null)
  const [editForm, setEditForm] = useState<DODOrder | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null)

  // Use N1 Warehouse hook with auto-sync every 30 seconds
  const {
    orders: n1Orders,
    isLoading,
    isSyncing,
    syncStatus,
    syncOrders,
    fetchOrders,
  } = useN1Warehouse({
    autoSync: true,
    syncInterval: 30000,
    enableSSE: false,
  })

  // Show notification using global toast
  const showNotification = useCallback((message: string, type: 'success' | 'error') => {
    toast({
      title: type === 'success' ? 'Sucesso!' : 'Erro!',
      description: message,
      className: type === 'success'
        ? 'bg-green-500 text-white border-green-600'
        : 'bg-red-500 text-white border-red-600',
    })
  }, [])

  // Compare DOD orders with N1 orders
  const comparisonData = useMemo(() => {
    const n1Map = new Map(n1Orders.map(o => [o.externalRef, o]))

    return dodOrders.map(dod => {
      const n1 = n1Map.get(dod.id)
      return {
        ...dod,
        n1Order: n1 || null,
        syncStatus: n1 ? 'synced' : 'not_found',
        n1Status: n1?.status,
        n1StatusLabel: n1?.statusLabel || (n1?.status ? N1_STATUS_MAP[n1.status]?.label : null),
      }
    })
  }, [n1Orders, dodOrders])

  // Filter data
  const filteredData = useMemo(() => {
    let data = comparisonData

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      data = data.filter(o =>
        o.id.toLowerCase().includes(term) ||
        o.customer.toLowerCase().includes(term) ||
        o.trackingCode.toLowerCase().includes(term) ||
        countries[o.country]?.name.toLowerCase().includes(term)
      )
    }

    if (filterStatus !== 'all') {
      if (filterStatus === 'synced') {
        data = data.filter(o => o.syncStatus === 'synced')
      } else if (filterStatus === 'not_found') {
        data = data.filter(o => o.syncStatus === 'not_found')
      }
    }

    if (filterCountry !== 'all') {
      data = data.filter(o => o.country === filterCountry)
    }

    return data
  }, [comparisonData, searchTerm, filterStatus, filterCountry])

  // Stats
  const stats = useMemo(() => {
    const synced = comparisonData.filter(o => o.syncStatus === 'synced').length
    const notFound = comparisonData.filter(o => o.syncStatus === 'not_found').length
    const total = comparisonData.length
    const syncRate = total > 0 ? (synced / total * 100).toFixed(1) : 0

    const byCountry = Object.keys(countries).reduce((acc, code) => {
      acc[code] = comparisonData.filter(o => o.country === code).length
      return acc
    }, {} as Record<string, number>)

    return { synced, notFound, total, syncRate, byCountry }
  }, [comparisonData])

  // Get unique countries from orders
  const activeCountries = useMemo(() => {
    const uniqueCountries = Array.from(new Set(comparisonData.map(o => o.country)))
    return uniqueCountries.map(code => ({ code, ...countries[code] }))
  }, [comparisonData])

  // Handle edit
  const handleEdit = (order: DODOrder) => {
    setEditingOrder(order)
    setEditForm({ ...order })
    setEditModalOpen(true)
  }

  // Handle save
  const handleSave = async () => {
    if (!editForm) return

    setIsSaving(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    setDodOrders(prev => prev.map(o => o.id === editForm.id ? editForm : o))
    setEditModalOpen(false)
    setEditingOrder(null)
    setEditForm(null)
    setIsSaving(false)
    showNotification(`Pedido ${editForm.id} atualizado com sucesso!`, 'success')
  }

  // Handle delete
  const handleDelete = (orderId: string) => {
    setDeletingOrderId(orderId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingOrderId) return

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    setDodOrders(prev => prev.filter(o => o.id !== deletingOrderId))
    setDeleteDialogOpen(false)
    showNotification(`Pedido ${deletingOrderId} removido!`, 'success')
    setDeletingOrderId(null)
  }

  // Handle sync single order
  const handleSyncOrder = async (orderId: string) => {
    showNotification(`Sincronizando pedido ${orderId}...`, 'success')
    await new Promise(resolve => setTimeout(resolve, 1000))
    showNotification(`Pedido ${orderId} sincronizado!`, 'success')
  }

  // Handle copy
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    showNotification('Copiado para a área de transferência!', 'success')
  }

  // Handle sync
  const handleSync = async () => {
    await syncOrders()
    showNotification('Sincronização concluída!', 'success')
  }

  // Format last sync time
  const formatLastSync = (dateStr: string | null) => {
    if (!dateStr) return 'Nunca sincronizado'
    const date = new Date(dateStr)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Editar Pedido {editForm?.id}
            </DialogTitle>
            <DialogDescription>
              Faça as alterações necessárias e clique em salvar.
            </DialogDescription>
          </DialogHeader>
          {editForm && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Cliente</Label>
                  <Input
                    id="customer"
                    value={editForm.customer}
                    onChange={(e) => setEditForm({ ...editForm, customer: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Select
                    value={editForm.country}
                    onValueChange={(value) => setEditForm({ ...editForm, country: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(countries).map(([code, { flag, name }]) => (
                        <SelectItem key={code} value={code}>
                          <span className="flex items-center gap-2">
                            <span>{flag}</span> {name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total">Valor ({countries[editForm.country]?.symbol})</Label>
                  <Input
                    id="total"
                    type="number"
                    step="0.01"
                    value={editForm.total}
                    onChange={(e) => setEditForm({ ...editForm, total: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dodStatusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="trackingCode">Código de Rastreio</Label>
                <Input
                  id="trackingCode"
                  value={editForm.trackingCode}
                  onChange={(e) => setEditForm({ ...editForm, trackingCode: e.target.value })}
                  placeholder="Ex: PT123456789"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+351..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data do Pedido</Label>
                <Input
                  id="date"
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={isSaving}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o pedido {deletingOrderId}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Warehouse className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">N1 Warehouse</h1>
              <p className="text-sm text-muted-foreground">
                Comparação de pedidos DOD × N1 Warehouse (Tempo Real)
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={cn(
              syncStatus.connected
                ? "bg-green-500/10 text-green-500 border-green-500/20"
                : "bg-red-500/10 text-red-500 border-red-500/20"
            )}
          >
            {syncStatus.connected ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                {syncStatus.mode === 'demo' ? 'Demo' : 'Conectado'}
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Desconectado
              </>
            )}
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <a href="https://n1warehouse.com/dashboard" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir N1
            </a>
          </Button>
          <Button
            size="sm"
            onClick={handleSync}
            disabled={isSyncing || isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", (isSyncing || isLoading) && "animate-spin")} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Pedidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Link2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.synced}</p>
                <p className="text-xs text-muted-foreground">Sincronizados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <Unlink className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.notFound}</p>
                <p className="text-xs text-muted-foreground">Não Encontrados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.syncRate}%</p>
                <p className="text-xs text-muted-foreground">Taxa de Sincronização</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Sync Info */}
      <Card className={cn(
        "border-blue-500/20",
        syncStatus.connected ? "bg-blue-500/5" : "bg-yellow-500/5 border-yellow-500/20"
      )}>
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Clock className={cn("h-4 w-4", syncStatus.connected ? "text-blue-500" : "text-yellow-500")} />
              <span className="text-muted-foreground">Última sincronização:</span>
              <span className="font-medium">{formatLastSync(syncStatus.lastSyncAt)}</span>
              {syncStatus.mode === 'demo' && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  Modo Demo
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn(
                syncStatus.connected
                  ? "bg-green-500/10 text-green-500 border-green-500/20"
                  : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
              )}>
                {syncStatus.connected ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {syncStatus.message}
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {syncStatus.message}
                  </>
                )}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Country Stats */}
      <div className="flex flex-wrap gap-2">
        {activeCountries.map(country => (
          <Badge
            key={country.code}
            variant="outline"
            className={cn(
              "cursor-pointer transition-colors",
              filterCountry === country.code
                ? "bg-primary/10 border-primary"
                : "hover:bg-muted"
            )}
            onClick={() => setFilterCountry(filterCountry === country.code ? 'all' : country.code)}
          >
            <span className="mr-1">{country.flag}</span>
            {country.name}
            <span className="ml-1.5 text-muted-foreground">
              ({stats.byCountry[country.code] || 0})
            </span>
          </Badge>
        ))}
        {filterCountry !== 'all' && (
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setFilterCountry('all')}>
            Limpar filtro
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID, cliente, país ou rastreio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCountry} onValueChange={setFilterCountry}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="País" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os países</SelectItem>
            {activeCountries.map(country => (
              <SelectItem key={country.code} value={country.code}>
                <span className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  {country.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="synced">Sincronizados</SelectItem>
            <SelectItem value="not_found">Não encontrados</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="comparison" className="space-y-4">
        <TabsList>
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
          <TabsTrigger value="not_found">
            Não Encontrados
            {stats.notFound > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                {stats.notFound}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="divergences">Divergências</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparação de Pedidos</CardTitle>
              <CardDescription>
                Pedidos do DOD comparados com a N1 Warehouse
                {isLoading && <span className="ml-2 text-blue-500">(Carregando...)</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>País</TableHead>
                    <TableHead>ID DOD</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status DOD</TableHead>
                    <TableHead>Status N1</TableHead>
                    <TableHead>Sincronização</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((order) => {
                    const country = countries[order.country]
                    const n1StatusInfo = order.n1Status ? N1_STATUS_MAP[order.n1Status] : null
                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          <span className="text-lg" title={country?.name}>{country?.flag}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">{order.id}</span>
                        </TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{country?.symbol} {order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={dodStatusMap[order.status]?.color}>
                            {dodStatusMap[order.status]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {n1StatusInfo ? (
                            <Badge className={n1StatusInfo.color}>
                              {order.n1StatusLabel || n1StatusInfo.label}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {order.syncStatus === 'synced' ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Sincronizado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                              <XCircle className="h-3 w-3 mr-1" />
                              Não encontrado
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEdit(order)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCopy(order.id)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copiar ID
                              </DropdownMenuItem>
                              {order.trackingCode && (
                                <DropdownMenuItem onClick={() => handleCopy(order.trackingCode)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copiar Rastreio
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleSyncOrder(order.id)}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Sincronizar
                              </DropdownMenuItem>
                              {order.syncStatus === 'not_found' && (
                                <DropdownMenuItem>
                                  <Send className="h-4 w-4 mr-2" />
                                  Enviar para N1
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(order.id)}
                                className="text-red-500 focus:text-red-500"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="not_found" className="space-y-4">
          <Card className="border-red-500/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <CardTitle>Pedidos Não Encontrados na N1</CardTitle>
              </div>
              <CardDescription>
                Estes pedidos existem no DOD mas não foram encontrados na N1 Warehouse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>País</TableHead>
                    <TableHead>ID DOD</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status DOD</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData
                    .filter(o => o.syncStatus === 'not_found')
                    .map((order) => {
                      const country = countries[order.country]
                      return (
                        <TableRow key={order.id}>
                          <TableCell>
                            <span className="text-lg" title={country?.name}>{country?.flag}</span>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{order.id}</TableCell>
                          <TableCell>{order.customer}</TableCell>
                          <TableCell>{country?.symbol} {order.total.toFixed(2)}</TableCell>
                          <TableCell>{order.date}</TableCell>
                          <TableCell>
                            <Badge className={dodStatusMap[order.status]?.color}>
                              {dodStatusMap[order.status]?.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(order)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Upload className="h-4 w-4 mr-2" />
                                Enviar para N1
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="divergences" className="space-y-4">
          <Card className="border-yellow-500/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <CardTitle>Divergências de Status</CardTitle>
              </div>
              <CardDescription>
                Pedidos com status diferente entre DOD e N1 Warehouse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma divergência encontrada</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Todos os pedidos sincronizados estão com status compatível entre as plataformas.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Integration Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Integração</CardTitle>
          <CardDescription>
            Configure a conexão com a N1 Warehouse
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>URL da API N1</Label>
              <Input
                value={process.env.NEXT_PUBLIC_N1_API_URL || "https://api.n1warehouse.com/v1"}
                readOnly
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Token de Acesso</Label>
              <Input
                value="••••••••••••••••"
                type="password"
                readOnly
                className="bg-muted/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Badge variant={syncStatus.connected ? "default" : "secondary"}>
                {syncStatus.mode === 'demo' ? 'Modo Demo' : 'Produção'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {syncStatus.mode === 'demo'
                  ? 'Configure as variáveis de ambiente para produção'
                  : 'Conectado à API de produção'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => fetchOrders()}>
              Testar Conexão
            </Button>
            <Button variant="outline">
              Reconfigurar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
