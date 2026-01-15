'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Truck,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  MoreHorizontal,
  Search,
  Filter,
  RefreshCcw,
  AlertTriangle,
} from 'lucide-react'
import { formatCurrency, getRelativeTime } from '@/lib/utils'

interface Delivery {
  id: string
  orderId: string
  customerName: string
  customerPhone: string
  address: string
  city: string
  status: 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned'
  carrier: string
  trackingCode: string
  attempts: number
  amount: number
  estimatedDelivery: string
  lastUpdate: string
}

// Deliveries data - starts empty, will be populated from API
const mockDeliveries: Delivery[] = []

const statusLabels = {
  pending: 'Pendente',
  in_transit: 'Em Transito',
  out_for_delivery: 'Saiu p/ Entrega',
  delivered: 'Entregue',
  failed: 'Falha',
  returned: 'Devolvido',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  pending: 'secondary',
  in_transit: 'default',
  out_for_delivery: 'warning',
  delivered: 'success',
  failed: 'destructive',
  returned: 'destructive',
}

const statusIcons = {
  pending: Clock,
  in_transit: Truck,
  out_for_delivery: Package,
  delivered: CheckCircle,
  failed: XCircle,
  returned: RefreshCcw,
}

export default function DeliveriesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredDeliveries = mockDeliveries.filter((delivery) => {
    const matchesSearch =
      delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.trackingCode.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: mockDeliveries.length,
    pending: mockDeliveries.filter(d => d.status === 'pending').length,
    inTransit: mockDeliveries.filter(d => d.status === 'in_transit' || d.status === 'out_for_delivery').length,
    delivered: mockDeliveries.filter(d => d.status === 'delivered').length,
    failed: mockDeliveries.filter(d => d.status === 'failed' || d.status === 'returned').length,
  }

  const deliveryRate = ((stats.delivered / stats.total) * 100).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Entregas COD</h1>
          <p className="text-muted-foreground">
            Acompanhe todas as entregas com pagamento na entrega
          </p>
        </div>
        <Button>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Atualizar Status
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Truck className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inTransit}</p>
                <p className="text-xs text-muted-foreground">Em Transito</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.delivered}</p>
                <p className="text-xs text-muted-foreground">Entregues</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.failed}</p>
                <p className="text-xs text-muted-foreground">Falharam</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Rate */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Taxa de Entrega</span>
            <span className="text-sm font-bold">{deliveryRate}%</span>
          </div>
          <Progress value={parseFloat(deliveryRate)} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {stats.delivered} de {stats.total} pedidos entregues com sucesso
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou codigo..."
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
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_transit">Em Transito</SelectItem>
                  <SelectItem value="out_for_delivery">Saiu p/ Entrega</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="failed">Falha</SelectItem>
                  <SelectItem value="returned">Devolvido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredDeliveries.map((delivery) => {
              const StatusIcon = statusIcons[delivery.status]
              return (
                <div key={delivery.id} className={`p-4 border rounded-lg ${delivery.status === 'failed' ? 'border-red-200 dark:border-red-900' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        delivery.status === 'delivered' ? 'bg-green-500/10' :
                        delivery.status === 'failed' || delivery.status === 'returned' ? 'bg-red-500/10' :
                        delivery.status === 'out_for_delivery' ? 'bg-yellow-500/10' :
                        'bg-muted'
                      }`}>
                        <StatusIcon className={`h-5 w-5 ${
                          delivery.status === 'delivered' ? 'text-green-500' :
                          delivery.status === 'failed' || delivery.status === 'returned' ? 'text-red-500' :
                          delivery.status === 'out_for_delivery' ? 'text-yellow-500' :
                          'text-muted-foreground'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{delivery.customerName}</span>
                          <Badge variant={statusVariants[delivery.status]}>
                            {statusLabels[delivery.status]}
                          </Badge>
                          {delivery.attempts > 1 && (
                            <Badge variant="outline" className="text-orange-500 border-orange-500">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {delivery.attempts} tentativas
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {delivery.address}, {delivery.city}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Pedido: #{delivery.orderId.slice(4)}</span>
                          <span>Rastreio: {delivery.trackingCode}</span>
                          <span>{delivery.carrier}</span>
                          <span>Atualizado {getRelativeTime(delivery.lastUpdate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(delivery.amount, 'BRL')}</p>
                        <p className="text-xs text-muted-foreground">COD</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                          <DropdownMenuItem>Rastrear Entrega</DropdownMenuItem>
                          <DropdownMenuItem>
                            <Phone className="mr-2 h-4 w-4" />
                            Ligar para Cliente
                          </DropdownMenuItem>
                          <DropdownMenuItem>Reagendar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
