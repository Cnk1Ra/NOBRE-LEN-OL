'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatCurrency, getRelativeTime, getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  ExternalLink,
  ShoppingBag,
  ArrowRight,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  XCircle,
  RotateCcw,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string
  customerName: string
  total: number
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'RETURNED' | 'CANCELLED' | 'FAILED_DELIVERY'
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED'
  createdAt: string
  country?: string
}

interface RecentOrdersProps {
  orders: Order[]
  currency?: string
}

const statusConfig: Record<Order['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'; icon: any }> = {
  PENDING: { label: 'Pendente', variant: 'warning', icon: Clock },
  CONFIRMED: { label: 'Confirmado', variant: 'info', icon: CheckCircle2 },
  PROCESSING: { label: 'Processando', variant: 'info', icon: Package },
  SHIPPED: { label: 'Enviado', variant: 'info', icon: Truck },
  OUT_FOR_DELIVERY: { label: 'Saiu para entrega', variant: 'info', icon: Truck },
  DELIVERED: { label: 'Entregue', variant: 'success', icon: CheckCircle2 },
  RETURNED: { label: 'Devolvido', variant: 'warning', icon: RotateCcw },
  CANCELLED: { label: 'Cancelado', variant: 'destructive', icon: XCircle },
  FAILED_DELIVERY: { label: 'Falha na Entrega', variant: 'destructive', icon: AlertCircle },
}

const paymentConfig: Record<Order['paymentStatus'], { label: string; color: string }> = {
  PENDING: { label: 'Aguardando', color: 'text-warning' },
  PAID: { label: 'Pago', color: 'text-success' },
  REFUNDED: { label: 'Reembolsado', color: 'text-muted-foreground' },
  FAILED: { label: 'Falhou', color: 'text-destructive' },
}

const countryFlags: Record<string, string> = {
  BR: '🇧🇷',
  PT: '🇵🇹',
  AO: '🇦🇴',
  MZ: '🇲🇿',
  US: '🇺🇸',
}

export function RecentOrders({ orders, currency = 'BRL' }: RecentOrdersProps) {
  return (
    <Card className="overflow-hidden border-border/50">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20">
              <ShoppingBag className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Pedidos Recentes</CardTitle>
              <p className="text-sm text-muted-foreground">{orders.length} últimos pedidos</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary" asChild>
            <Link href="/dashboard/orders">
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="space-y-3">
          {orders.map((order, index) => {
            const status = statusConfig[order.status]
            const payment = paymentConfig[order.paymentStatus]
            const StatusIcon = status.icon

            return (
              <div
                key={order.id}
                className={cn(
                  'group relative flex items-center justify-between p-4 rounded-xl',
                  'border border-border/50 bg-card',
                  'hover:border-border hover:shadow-md transition-all duration-300',
                  'cursor-pointer animate-fade-in'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Left side */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-11 w-11 ring-2 ring-background shadow-md">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold text-sm">
                      {getInitials(order.customerName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{order.customerName}</p>
                      {order.country && (
                        <span className="text-base" title={order.country}>
                          {countryFlags[order.country] || '🌍'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <code className="px-1.5 py-0.5 rounded bg-muted font-mono">
                        #{order.id.slice(4, 12).toUpperCase()}
                      </code>
                      <span>•</span>
                      <span>{getRelativeTime(order.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-6">
                  {/* Value and Payment */}
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {formatCurrency(order.total, currency)}
                    </p>
                    <p className={cn('text-xs font-medium', payment.color)}>
                      {payment.label}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <Badge variant={status.variant} className="gap-1.5 px-3 py-1.5 min-w-[120px] justify-center">
                    <StatusIcon className="h-3.5 w-3.5" />
                    {status.label}
                  </Badge>
                </div>

                {/* Hover arrow */}
                <ArrowRight
                  className={cn(
                    'absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground',
                    'opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all'
                  )}
                />
              </div>
            )
          })}

          {orders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">Nenhum pedido recente</p>
              <p className="text-sm text-muted-foreground/70">Os novos pedidos aparecerão aqui</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
