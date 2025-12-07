'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import {
  Facebook,
  Instagram,
  Youtube,
  Search,
  Globe,
  Mail,
  ExternalLink,
} from 'lucide-react'

interface TrafficSource {
  name: string
  platform: 'FACEBOOK' | 'INSTAGRAM' | 'GOOGLE' | 'TIKTOK' | 'YOUTUBE' | 'ORGANIC' | 'DIRECT' | 'EMAIL' | 'OTHER'
  sessions: number
  orders: number
  revenue: number
  adSpend?: number
  conversionRate: number
}

interface TrafficSourcesProps {
  sources: TrafficSource[]
  currency?: string
}

const platformIcons = {
  FACEBOOK: Facebook,
  INSTAGRAM: Instagram,
  GOOGLE: Search,
  TIKTOK: ExternalLink,
  YOUTUBE: Youtube,
  ORGANIC: Globe,
  DIRECT: ExternalLink,
  EMAIL: Mail,
  OTHER: ExternalLink,
}

const platformColors = {
  FACEBOOK: 'bg-blue-600',
  INSTAGRAM: 'bg-gradient-to-r from-purple-500 to-pink-500',
  GOOGLE: 'bg-red-500',
  TIKTOK: 'bg-black',
  YOUTUBE: 'bg-red-600',
  ORGANIC: 'bg-green-500',
  DIRECT: 'bg-gray-500',
  EMAIL: 'bg-yellow-500',
  OTHER: 'bg-gray-400',
}

export function TrafficSources({ sources, currency = 'BRL' }: TrafficSourcesProps) {
  const totalRevenue = sources.reduce((acc, s) => acc + s.revenue, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fontes de Tráfego</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sources.map((source) => {
            const Icon = platformIcons[source.platform]
            const revenueShare = totalRevenue > 0
              ? (source.revenue / totalRevenue) * 100
              : 0
            const roas = source.adSpend && source.adSpend > 0
              ? source.revenue / source.adSpend
              : undefined

            return (
              <div
                key={source.name}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-white ${platformColors[source.platform]}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{source.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{source.sessions} sessões</span>
                      <span>•</span>
                      <span>{source.orders} pedidos</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="font-medium">
                      {formatCurrency(source.revenue, currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatPercentage(revenueShare)} do total
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={source.conversionRate >= 2 ? 'success' : 'secondary'}>
                      {formatPercentage(source.conversionRate)} CVR
                    </Badge>
                    {roas !== undefined && (
                      <Badge variant={roas >= 3 ? 'success' : roas >= 2 ? 'warning' : 'destructive'}>
                        ROAS {roas.toFixed(2)}x
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
