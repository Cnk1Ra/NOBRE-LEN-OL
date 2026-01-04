'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Truck,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Save,
  RefreshCw,
  Copy,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { formatCurrency, getRelativeTime, getInitials } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import type { Order, OrderStatus } from '@/types'

const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  PROCESSING: 'Processando',
  SHIPPED: 'Enviado',
  OUT_FOR_DELIVERY: 'Saiu p/ Entrega',
  DELIVERED: 'Entregue',
  RETURNED: 'Devolvido',
  CANCELLED: 'Cancelado',
  FAILED_DELIVERY: 'Falha na Entrega',
}

const statusVariants: Record<OrderStatus, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'info',
  SHIPPED: 'info',
  OUT_FOR_DELIVERY: 'info',
  DELIVERED: 'success',
  RETURNED: 'warning',
  CANCELLED: 'destructive',
  FAILED_DELIVERY: 'destructive',
}

const statusOptions = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'PROCESSING', label: 'Processando' },
  { value: 'SHIPPED', label: 'Enviado' },
  { value: 'OUT_FOR_DELIVERY', label: 'Saiu p/ Entrega' },
  { value: 'DELIVERED', label: 'Entregue' },
  { value: 'RETURNED', label: 'Devolvido' },
  { value: 'CANCELLED', label: 'Cancelado' },
]

const paymentOptions = [
  { value: 'PENDING', label: 'Aguardando' },
  { value: 'PAID', label: 'Pago' },
  { value: 'REFUNDED', label: 'Reembolsado' },
  { value: 'FAILED', label: 'Falhou' },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    inTransit: 0,
    returned: 0,
  })

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null)

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      })

      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const response = await fetch(`/api/orders?${params}`)
      if (!response.ok) throw new Error('Erro ao carregar pedidos')

      const data = await response.json()
      setOrders(data.data || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotalOrders(data.pagination?.total || 0)

      // Calculate stats from orders
      const allOrders = data.data || []
      setStats({
        total: data.pagination?.total || 0,
        delivered: allOrders.filter((o: Order) => o.status === 'DELIVERED').length,
        inTransit: allOrders.filter((o: Order) => ['SHIPPED', 'OUT_FOR_DELIVERY'].includes(o.status)).length,
        returned: allOrders.filter((o: Order) => o.status === 'RETURNED').length,
      })
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os pedidos.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchTerm, statusFilter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Handle edit
  const handleEdit = (order: Order) => {
    setEditingOrder({ ...order })
    setEditModalOpen(true)
  }

  // Handle save
  const handleSave = async () => {
    if (!editingOrder) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/orders/${editingOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: editingOrder.customerName,
          customerEmail: editingOrder.customerEmail,
          customerPhone: editingOrder.customerPhone,
          total: editingOrder.total,
          status: editingOrder.status,
          paymentStatus: editingOrder.paymentStatus,
          trackingCode: editingOrder.trackingCode,
          carrierName: editingOrder.carrierName,
        }),
      })

      if (!response.ok) throw new Error('Erro ao atualizar pedido')

      const updatedOrder = await response.json()
      setOrders(prev => prev.map(o => o.id === editingOrder.id ? updatedOrder : o))
      setEditModalOpen(false)
      setEditingOrder(null)

      toast({
        title: 'Pedido atualizado!',
        description: `O pedido #${editingOrder.id.slice(0, 8)} foi atualizado com sucesso.`,
        className: 'bg-green-500 text-white border-green-600',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o pedido.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle delete
  const handleDelete = (orderId: string) => {
    setDeletingOrderId(orderId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingOrderId) return

    try {
      const response = await fetch(`/api/orders/${deletingOrderId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Erro ao excluir pedido')

      setOrders(prev => prev.filter(o => o.id !== deletingOrderId))
      setDeleteDialogOpen(false)

      toast({
        title: 'Pedido removido!',
        description: `O pedido foi removido com sucesso.`,
        className: 'bg-green-500 text-white border-green-600',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o pedido.',
        variant: 'destructive',
      })
    } finally {
      setDeletingOrderId(null)
    }
  }

  // Handle status update
  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Erro ao atualizar status')

      const updatedOrder = await response.json()
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o))

      toast({
        title: 'Status atualizado!',
        description: `Status alterado para ${statusLabels[newStatus]}.`,
        className: 'bg-green-500 text-white border-green-600',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      })
    }
  }

  // Handle copy
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copiado!',
      description: `${label} copiado para a área de transferência.`,
      className: 'bg-green-500 text-white border-green-600',
    })
  }

  return (
    <div className="space-y-6">
      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Editar Pedido #{editingOrder?.id.slice(0, 8)}
            </DialogTitle>
            <DialogDescription>
              Faça as alterações necessárias e clique em salvar.
            </DialogDescription>
          </DialogHeader>
          {editingOrder && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Input
                    value={editingOrder.customerName}
                    onChange={(e) => setEditingOrder({ ...editingOrder, customerName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editingOrder.customerEmail || ''}
                    onChange={(e) => setEditingOrder({ ...editingOrder, customerEmail: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={editingOrder.customerPhone || ''}
                    onChange={(e) => setEditingOrder({ ...editingOrder, customerPhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total ({editingOrder.country?.currencySymbol || 'R$'})</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingOrder.total}
                    onChange={(e) => setEditingOrder({ ...editingOrder, total: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status do Pedido</Label>
                  <Select
                    value={editingOrder.status}
                    onValueChange={(value) => setEditingOrder({ ...editingOrder, status: value as OrderStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status do Pagamento</Label>
                  <Select
                    value={editingOrder.paymentStatus}
                    onValueChange={(value) => setEditingOrder({ ...editingOrder, paymentStatus: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Código de Rastreio</Label>
                  <Input
                    value={editingOrder.trackingCode || ''}
                    onChange={(e) => setEditingOrder({ ...editingOrder, trackingCode: e.target.value })}
                    placeholder="Ex: BR123456789"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Transportadora</Label>
                  <Input
                    value={editingOrder.carrierName || ''}
                    onChange={(e) => setEditingOrder({ ...editingOrder, carrierName: e.target.value })}
                    placeholder="Ex: Correios, Jadlog"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={isSaving}>
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

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os pedidos da sua loja
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total de Pedidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {stats.delivered}
            </div>
            <p className="text-xs text-muted-foreground">Entregues</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">
              {stats.inTransit}
            </div>
            <p className="text-xs text-muted-foreground">Em Trânsito</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-500">
              {stats.returned}
            </div>
            <p className="text-xs text-muted-foreground">Devolvidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {statusOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Orders Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p>Nenhum pedido encontrado</p>
              {searchTerm && <p className="text-sm">Tente uma busca diferente</p>}
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-4 text-left text-sm font-medium">Pedido</th>
                      <th className="p-4 text-left text-sm font-medium">Cliente</th>
                      <th className="p-4 text-left text-sm font-medium">Valor</th>
                      <th className="p-4 text-left text-sm font-medium">Status</th>
                      <th className="p-4 text-left text-sm font-medium">Pagamento</th>
                      <th className="p-4 text-left text-sm font-medium">Origem</th>
                      <th className="p-4 text-left text-sm font-medium">Data</th>
                      <th className="p-4 text-left text-sm font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium">#{order.id.slice(0, 8)}</p>
                              {order.trackingCode && (
                                <p className="text-xs text-muted-foreground">
                                  {order.trackingCode}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {getInitials(order.customerName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{order.customerName}</p>
                              <p className="text-xs text-muted-foreground">
                                {order.country?.code || 'BR'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">
                              {formatCurrency(order.total, order.country?.currency || 'BRL')}
                            </p>
                            <p className="text-xs text-green-600">
                              Lucro: {formatCurrency(order.profit || 0, order.country?.currency || 'BRL')}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={statusVariants[order.status]}>
                            {statusLabels[order.status]}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              order.paymentStatus === 'PAID' ? 'success' :
                              order.paymentStatus === 'PENDING' ? 'warning' : 'destructive'
                            }
                          >
                            {order.paymentStatus === 'PAID' ? 'Pago' :
                             order.paymentStatus === 'PENDING' ? 'Aguardando' :
                             order.paymentStatus === 'REFUNDED' ? 'Reembolsado' : 'Falhou'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <p className="text-sm capitalize">
                            {order.utmSource || 'Direto'}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-muted-foreground">
                            {getRelativeTime(order.orderedAt)}
                          </p>
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEdit(order)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar Pedido
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCopy(order.id, 'ID')}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copiar ID
                              </DropdownMenuItem>
                              {order.trackingCode && (
                                <DropdownMenuItem onClick={() => handleCopy(order.trackingCode!, 'Rastreio')}>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copiar Rastreio
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'SHIPPED')}>
                                <Truck className="mr-2 h-4 w-4" />
                                Marcar Enviado
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Marcar Entregue
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'RETURNED')}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Marcar Devolvido
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(order.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir Pedido
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {orders.length} de {totalOrders} pedidos
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1 || isLoading}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">Página {currentPage} de {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages || isLoading}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
