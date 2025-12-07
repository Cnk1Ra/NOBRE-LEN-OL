'use client'

import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { LucideIcon } from 'lucide-react'

type ColorVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'accent'

interface StatCardProps {
  title: string
  value: string
  change?: number
  changeLabel?: string
  icon?: LucideIcon
  color?: ColorVariant
  description?: string
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

const colorVariants: Record<ColorVariant, { bg: string; text: string; glow: string }> = {
  primary: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    glow: 'shadow-primary/20',
  },
  success: {
    bg: 'bg-success/10',
    text: 'text-success',
    glow: 'shadow-success/20',
  },
  warning: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    glow: 'shadow-warning/20',
  },
  danger: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    glow: 'shadow-destructive/20',
  },
  info: {
    bg: 'bg-info/10',
    text: 'text-info',
    glow: 'shadow-info/20',
  },
  accent: {
    bg: 'bg-accent/10',
    text: 'text-accent',
    glow: 'shadow-accent/20',
  },
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = 'vs anterior',
  icon: Icon,
  color = 'primary',
  description,
  trend,
  className,
}: StatCardProps) {
  const isPositive = change !== undefined ? change > 0 : trend === 'up'
  const isNegative = change !== undefined ? change < 0 : trend === 'down'
  const colorStyle = colorVariants[color]

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300',
        'hover:border-border hover:shadow-lg',
        className
      )}
    >
      {/* Background gradient effect */}
      <div
        className={cn(
          'absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl',
          colorStyle.bg
        )}
      />

      {/* Content */}
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="space-y-3 flex-1">
          {/* Title */}
          <p className="text-sm font-medium text-muted-foreground">{title}</p>

          {/* Value */}
          <p className="text-3xl font-bold tracking-tight">{value}</p>

          {/* Change indicator */}
          {change !== undefined && (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
                  isPositive && 'bg-success/10 text-success',
                  isNegative && 'bg-destructive/10 text-destructive',
                  !isPositive && !isNegative && 'bg-muted text-muted-foreground'
                )}
              >
                {isPositive && <ArrowUpRight className="h-3 w-3" />}
                {isNegative && <ArrowDownRight className="h-3 w-3" />}
                {!isPositive && !isNegative && <Minus className="h-3 w-3" />}
                <span>
                  {isPositive && '+'}
                  {change.toFixed(1)}%
                </span>
              </span>
              <span className="text-xs text-muted-foreground">{changeLabel}</span>
            </div>
          )}

          {/* Description */}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300',
              'group-hover:scale-110 group-hover:shadow-lg',
              colorStyle.bg,
              colorStyle.text,
              `group-hover:${colorStyle.glow}`
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>

      {/* Bottom accent line on hover */}
      <div
        className={cn(
          'absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full',
          color === 'primary' && 'bg-gradient-to-r from-primary to-accent',
          color === 'success' && 'bg-gradient-to-r from-success to-emerald-400',
          color === 'warning' && 'bg-gradient-to-r from-warning to-amber-400',
          color === 'danger' && 'bg-gradient-to-r from-destructive to-rose-400',
          color === 'info' && 'bg-gradient-to-r from-info to-sky-400',
          color === 'accent' && 'bg-gradient-to-r from-accent to-purple-400'
        )}
      />
    </div>
  )
}

// Variante menor para grids mais densos
export function StatCardCompact({
  title,
  value,
  change,
  icon: Icon,
  color = 'primary',
}: Omit<StatCardProps, 'changeLabel' | 'description' | 'trend'>) {
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0
  const colorStyle = colorVariants[color]

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-4 transition-all duration-300 hover:border-border hover:shadow-md">
      <div className="flex items-center gap-4">
        {Icon && (
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300',
              colorStyle.bg,
              colorStyle.text
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground truncate">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold tracking-tight">{value}</p>
            {change !== undefined && (
              <span
                className={cn(
                  'text-xs font-semibold',
                  isPositive && 'text-success',
                  isNegative && 'text-destructive',
                  !isPositive && !isNegative && 'text-muted-foreground'
                )}
              >
                {isPositive && '+'}
                {change.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
