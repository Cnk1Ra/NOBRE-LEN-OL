'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatCurrency, getRelativeTime, getInitials } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string
  customerName: string
  total: number
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'RETURNED' | 'CANCELLED' | 'FAILED_DELIVERY'
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED'
  createdAt: string
  country?: string
}

interface RecentOrdersProps {
  orders: Order[]
  currency?: string
}

const statusLabels: Record<Order['status'], string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  PROCESSING: 'Processando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregue',
  RETURNED: 'Devolvido',
  CANCELLED: 'Cancelado',
  FAILED_DELIVERY: 'Falha na Entrega',
}

const statusVariants: Record<Order['status'], 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  RETURNED: 'warning',
  CANCELLED: 'destructive',
  FAILED_DELIVERY: 'destructive',
}

const paymentLabels: Record<Order['paymentStatus'], string> = {
  PENDING: 'Aguardando',
  PAID: 'Pago',
  REFUNDED: 'Reembolsado',
  FAILED: 'Falhou',
}

export function RecentOrders({ orders, currency = 'BRL' }: RecentOrdersProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pedidos Recentes</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/orders">
            Ver todos
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(order.customerName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{order.customerName}</p>
                    {order.country && (
                      <span className="text-xs text-muted-foreground">
                        {order.country}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    #{order.id.slice(0, 8)} • {getRelativeTime(order.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(order.total, currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {paymentLabels[order.paymentStatus]}
                  </p>
                </div>
                <Badge variant={statusVariants[order.status]}>
                  {statusLabels[order.status]}
                </Badge>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum pedido recente
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
