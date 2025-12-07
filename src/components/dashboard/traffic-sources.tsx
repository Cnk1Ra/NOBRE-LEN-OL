'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  Facebook,
  Instagram,
  Youtube,
  Search,
  Globe,
  Mail,
  ExternalLink,
  TrendingUp,
  ArrowUpRight,
  Megaphone,
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

const platformIcons: Record<TrafficSource['platform'], any> = {
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

const platformColors: Record<TrafficSource['platform'], { bg: string; border: string; text: string }> = {
  FACEBOOK: { bg: 'bg-blue-600', border: 'border-blue-600/30', text: 'text-blue-600' },
  INSTAGRAM: { bg: 'bg-gradient-to-br from-purple-500 to-pink-500', border: 'border-pink-500/30', text: 'text-pink-500' },
  GOOGLE: { bg: 'bg-red-500', border: 'border-red-500/30', text: 'text-red-500' },
  TIKTOK: { bg: 'bg-black dark:bg-white dark:text-black', border: 'border-neutral-500/30', text: 'text-neutral-500' },
  YOUTUBE: { bg: 'bg-red-600', border: 'border-red-600/30', text: 'text-red-600' },
  ORGANIC: { bg: 'bg-green-500', border: 'border-green-500/30', text: 'text-green-500' },
  DIRECT: { bg: 'bg-gray-500', border: 'border-gray-500/30', text: 'text-gray-500' },
  EMAIL: { bg: 'bg-amber-500', border: 'border-amber-500/30', text: 'text-amber-500' },
  OTHER: { bg: 'bg-gray-400', border: 'border-gray-400/30', text: 'text-gray-400' },
}

export function TrafficSources({ sources, currency = 'BRL' }: TrafficSourcesProps) {
  const totalRevenue = sources.reduce((acc, s) => acc + s.revenue, 0)
  const totalAdSpend = sources.reduce((acc, s) => acc + (s.adSpend || 0), 0)
  const overallRoas = totalAdSpend > 0 ? totalRevenue / totalAdSpend : 0

  return (
    <Card className="overflow-hidden border-border/50">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              <Megaphone className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Fontes de Tráfego</CardTitle>
              <p className="text-sm text-muted-foreground">Desempenho por canal</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1 px-3 py-1.5 border-success/30 text-success">
            <TrendingUp className="h-3 w-3" />
            ROAS {overallRoas.toFixed(2)}x
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="space-y-3">
          {sources.map((source, index) => {
            const Icon = platformIcons[source.platform]
            const colors = platformColors[source.platform]
            const revenueShare = totalRevenue > 0
              ? (source.revenue / totalRevenue) * 100
              : 0
            const roas = source.adSpend && source.adSpend > 0
              ? source.revenue / source.adSpend
              : undefined

            return (
              <div
                key={source.name}
                className={cn(
                  'group relative flex items-center justify-between p-4 rounded-xl',
                  'border border-border/50 bg-card',
                  'hover:border-border hover:shadow-md transition-all duration-300',
                  'animate-fade-in'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Left side */}
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-xl text-white transition-transform duration-300',
                      'group-hover:scale-110',
                      colors.bg
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{source.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                        {source.sessions.toLocaleString()} sessões
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                        {source.orders} pedidos
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-6">
                  {/* Revenue */}
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {formatCurrency(source.revenue, currency)}
                    </p>
                    <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                      <ArrowUpRight className="h-3 w-3 text-success" />
                      <span>{formatPercentage(revenueShare)} do total</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-col items-end gap-1.5 min-w-[100px]">
                    <Badge
                      variant={source.conversionRate >= 3 ? 'success' : source.conversionRate >= 2 ? 'secondary' : 'warning'}
                      className="text-xs font-semibold"
                    >
                      {formatPercentage(source.conversionRate)} CVR
                    </Badge>
                    {roas !== undefined && (
                      <Badge
                        variant={roas >= 3 ? 'success' : roas >= 2 ? 'warning' : 'destructive'}
                        className="text-xs font-semibold"
                      >
                        ROAS {roas.toFixed(2)}x
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Hover highlight */}
                <div
                  className={cn(
                    'absolute left-0 top-0 bottom-0 w-1 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity',
                    colors.bg
                  )}
                />
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Investido</p>
              <p className="text-lg font-bold">{formatCurrency(totalAdSpend, currency)}</p>
            </div>
            <div className="border-x border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Receita Total</p>
              <p className="text-lg font-bold text-success">{formatCurrency(totalRevenue, currency)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">ROAS Geral</p>
              <p className="text-lg font-bold text-primary">{overallRoas.toFixed(2)}x</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
