'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Truck,
  RotateCcw,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { formatCurrency, getRelativeTime, getInitials } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'

// Mock data
const mockOrders: Order[] = [
  {
    id: 'ord_a1b2c3d4',
    customerName: 'João Silva',
    customerEmail: 'joao@email.com',
    customerPhone: '+55 11 99999-9999',
    total: 289.90,
    subtotal: 274.90,
    shippingCost: 15,
    discount: 0,
    costOfGoods: 120,
    profit: 154.90,
    status: 'SHIPPED',
    paymentStatus: 'PENDING',
    deliveryStatus: 'IN_TRANSIT',
    trackingCode: 'BR123456789',
    carrierName: 'Correios',
    orderedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    deliveryAttempts: 0,
    utmSource: 'facebook',
    utmMedium: 'cpc',
    utmCampaign: 'black_friday',
    items: [
      { id: '1', name: 'Produto X', sku: 'SKU001', quantity: 2, unitPrice: 137.45, totalPrice: 274.90, costPrice: 60 }
    ],
    country: { code: 'BR', name: 'Brasil', currency: 'BRL', currencySymbol: 'R$' }
  },
  {
    id: 'ord_e5f6g7h8',
    customerName: 'Maria Santos',
    customerEmail: 'maria@email.com',
    total: 459.90,
    subtotal: 444.90,
    shippingCost: 15,
    discount: 0,
    costOfGoods: 180,
    profit: 264.90,
    status: 'DELIVERED',
    paymentStatus: 'PAID',
    deliveryStatus: 'DELIVERED',
    orderedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    deliveredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    deliveryAttempts: 1,
    utmSource: 'instagram',
    items: [
      { id: '2', name: 'Produto Y', sku: 'SKU002', quantity: 1, unitPrice: 444.90, totalPrice: 444.90, costPrice: 180 }
    ],
    country: { code: 'BR', name: 'Brasil', currency: 'BRL', currencySymbol: 'R$' }
  },
  {
    id: 'ord_i9j0k1l2',
    customerName: 'Pedro Oliveira',
    total: 189.90,
    subtotal: 164.90,
    shippingCost: 25,
    discount: 0,
    costOfGoods: 70,
    profit: 94.90,
    status: 'PENDING',
    paymentStatus: 'PENDING',
    deliveryStatus: 'PENDING',
    orderedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    deliveryAttempts: 0,
    utmSource: 'google',
    items: [
      { id: '3', name: 'Produto Z', sku: 'SKU003', quantity: 1, unitPrice: 164.90, totalPrice: 164.90, costPrice: 70 }
    ],
    country: { code: 'PT', name: 'Portugal', currency: 'EUR', currencySymbol: '€' }
  },
  {
    id: 'ord_m3n4o5p6',
    customerName: 'Ana Costa',
    total: 599.90,
    subtotal: 584.90,
    shippingCost: 15,
    discount: 0,
    costOfGoods: 250,
    profit: 0,
    status: 'RETURNED',
    paymentStatus: 'REFUNDED',
    deliveryStatus: 'RETURNED',
    orderedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    returnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    deliveryAttempts: 2,
    failureReason: 'Cliente recusou o pedido',
    items: [
      { id: '4', name: 'Produto W', sku: 'SKU004', quantity: 1, unitPrice: 584.90, totalPrice: 584.90, costPrice: 250 }
    ],
    country: { code: 'BR', name: 'Brasil', currency: 'BRL', currencySymbol: 'R$' }
  },
  {
    id: 'ord_q7r8s9t0',
    customerName: 'Carlos Ferreira',
    total: 349.90,
    subtotal: 334.90,
    shippingCost: 15,
    discount: 0,
    costOfGoods: 140,
    profit: 194.90,
    status: 'OUT_FOR_DELIVERY',
    paymentStatus: 'PENDING',
    deliveryStatus: 'OUT_FOR_DELIVERY',
    trackingCode: 'BR987654321',
    carrierName: 'Jadlog',
    orderedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    deliveryAttempts: 1,
    lastAttemptAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    items: [
      { id: '5', name: 'Produto V', sku: 'SKU005', quantity: 2, unitPrice: 167.45, totalPrice: 334.90, costPrice: 70 }
    ],
    country: { code: 'BR', name: 'Brasil', currency: 'BRL', currencySymbol: 'R$' }
  },
]

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

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
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
            <div className="text-2xl font-bold">427</div>
            <p className="text-xs text-muted-foreground">Total de Pedidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">335</div>
            <p className="text-xs text-muted-foreground">Entregues (78.5%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">42</div>
            <p className="text-xs text-muted-foreground">Em Trânsito</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-500">52</div>
            <p className="text-xs text-muted-foreground">Devolvidos (12.3%)</p>
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="SHIPPED">Enviado</SelectItem>
                  <SelectItem value="OUT_FOR_DELIVERY">Saiu p/ Entrega</SelectItem>
                  <SelectItem value="DELIVERED">Entregue</SelectItem>
                  <SelectItem value="RETURNED">Devolvido</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Orders Table */}
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
                    <th className="p-4 text-left text-sm font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">#{order.id.slice(4, 12)}</p>
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
                            Lucro: {formatCurrency(order.profit, order.country?.currency || 'BRL')}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={statusVariants[order.status]}>
                          {statusLabels[order.status]}
                        </Badge>
                        {order.deliveryAttempts > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {order.deliveryAttempts} tentativa(s)
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            order.paymentStatus === 'PAID'
                              ? 'success'
                              : order.paymentStatus === 'PENDING'
                              ? 'warning'
                              : 'destructive'
                          }
                        >
                          {order.paymentStatus === 'PAID'
                            ? 'Pago'
                            : order.paymentStatus === 'PENDING'
                            ? 'Aguardando'
                            : order.paymentStatus === 'REFUNDED'
                            ? 'Reembolsado'
                            : 'Falhou'}
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
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Truck className="mr-2 h-4 w-4" />
                              Atualizar Status
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Marcar Devolução
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancelar Pedido
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

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredOrders.length} de {mockOrders.length} pedidos
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">Página {currentPage}</span>
              <Button
                variant="outline"
                size="sm"
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
