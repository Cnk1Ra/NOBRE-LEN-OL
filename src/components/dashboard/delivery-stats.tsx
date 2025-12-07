'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Truck,
  PackageCheck,
  PackageX,
  Clock,
  RotateCcw,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

interface DeliveryStatsProps {
  delivered: number
  inTransit: number
  returned: number
  pending: number
  failed: number
  total: number
}

export function DeliveryStats({
  delivered,
  inTransit,
  returned,
  pending,
  failed,
  total,
}: DeliveryStatsProps) {
  const deliveryRate = total > 0 ? (delivered / total) * 100 : 0
  const returnRate = total > 0 ? (returned / total) * 100 : 0

  const stats = [
    {
      label: 'Entregues',
      value: delivered,
      percentage: deliveryRate,
      icon: PackageCheck,
      color: 'success',
      gradient: 'from-emerald-500 to-green-500',
    },
    {
      label: 'Em Trânsito',
      value: inTransit,
      percentage: total > 0 ? (inTransit / total) * 100 : 0,
      icon: Truck,
      color: 'info',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Pendentes',
      value: pending,
      percentage: total > 0 ? (pending / total) * 100 : 0,
      icon: Clock,
      color: 'warning',
      gradient: 'from-amber-500 to-yellow-500',
    },
    {
      label: 'Devolvidos',
      value: returned,
      percentage: returnRate,
      icon: RotateCcw,
      color: 'warning',
      gradient: 'from-orange-500 to-amber-500',
    },
    {
      label: 'Falhas',
      value: failed,
      percentage: total > 0 ? (failed / total) * 100 : 0,
      icon: PackageX,
      color: 'danger',
      gradient: 'from-red-500 to-rose-500',
    },
  ]

  const isGoodRate = deliveryRate >= 75
  const isWarningRate = deliveryRate >= 60 && deliveryRate < 75

  return (
    <Card className="overflow-hidden border-border/50">
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Truck className="h-4 w-4 text-primary" />
              </div>
              Status de Entregas COD
            </CardTitle>
          </div>
          <Badge
            variant={isGoodRate ? 'success' : isWarningRate ? 'warning' : 'destructive'}
            className="gap-1 px-3 py-1"
          >
            {isGoodRate ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            {deliveryRate.toFixed(1)}% entregues
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="group relative"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300',
                      'group-hover:scale-110',
                      stat.color === 'success' && 'bg-success/10 text-success',
                      stat.color === 'info' && 'bg-info/10 text-info',
                      stat.color === 'warning' && 'bg-warning/10 text-warning',
                      stat.color === 'danger' && 'bg-destructive/10 text-destructive',
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-sm">{stat.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">{stat.value}</span>
                    <span className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      stat.color === 'success' && 'bg-success/10 text-success',
                      stat.color === 'info' && 'bg-info/10 text-info',
                      stat.color === 'warning' && 'bg-warning/10 text-warning',
                      stat.color === 'danger' && 'bg-destructive/10 text-destructive',
                    )}>
                      {stat.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out',
                      stat.gradient
                    )}
                    style={{
                      width: `${Math.min(stat.percentage, 100)}%`,
                      transitionDelay: `${index * 100}ms`
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Total Section */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">Total de Pedidos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{total}</span>
              <span className="text-xs text-muted-foreground">pedidos</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-success/5 border border-success/20">
            <p className="text-xs text-muted-foreground mb-1">Taxa de Sucesso</p>
            <p className="text-lg font-bold text-success">{deliveryRate.toFixed(1)}%</p>
          </div>
          <div className="p-3 rounded-xl bg-warning/5 border border-warning/20">
            <p className="text-xs text-muted-foreground mb-1">Taxa de Retorno</p>
            <p className="text-lg font-bold text-warning">{returnRate.toFixed(1)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
