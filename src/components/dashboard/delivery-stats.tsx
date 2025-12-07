'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { Truck, PackageCheck, PackageX, Clock, RotateCcw } from 'lucide-react'

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
  const failedRate = total > 0 ? (failed / total) * 100 : 0

  const stats = [
    {
      label: 'Entregues',
      value: delivered,
      percentage: deliveryRate,
      icon: PackageCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-500',
    },
    {
      label: 'Em Trânsito',
      value: inTransit,
      percentage: total > 0 ? (inTransit / total) * 100 : 0,
      icon: Truck,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500',
    },
    {
      label: 'Pendentes',
      value: pending,
      percentage: total > 0 ? (pending / total) * 100 : 0,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500',
    },
    {
      label: 'Devolvidos',
      value: returned,
      percentage: returnRate,
      icon: RotateCcw,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500',
    },
    {
      label: 'Falhas',
      value: failed,
      percentage: failedRate,
      icon: PackageX,
      color: 'text-red-500',
      bgColor: 'bg-red-500',
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          Status de Entregas COD
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Taxa real de entrega: <span className="font-bold text-green-500">{deliveryRate.toFixed(1)}%</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <stat.icon className={cn('h-4 w-4', stat.color)} />
                <span>{stat.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{stat.value}</span>
                <span className="text-muted-foreground">
                  ({stat.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
            <Progress
              value={stat.percentage}
              className={cn('h-2', `[&>div]:${stat.bgColor}`)}
            />
          </div>
        ))}

        <div className="pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total de Pedidos</span>
            <span className="font-bold">{total}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
