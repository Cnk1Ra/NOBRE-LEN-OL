'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Bell,
  Moon,
  Sun,
  Search,
  RefreshCw,
  Command,
  Sparkles,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Building2,
  CreditCard,
  Infinity,
  Trophy,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useDateFilter, DateFilterPeriod } from '@/contexts/date-filter-context'
import { useNotifications } from '@/contexts/notifications-context'
import { Package, Truck, AlertTriangle, CheckCircle, Info, X } from 'lucide-react'
import Link from 'next/link'

interface HeaderProps {
  workspaceName?: string
}

const periodLabels: Record<DateFilterPeriod, string> = {
  today: 'Hoje',
  yesterday: 'Ontem',
  week: 'Esta Semana',
  month: 'Este Mes',
  last_month: 'Mes Passado',
  custom: 'Personalizado',
  max: 'MAXIMO',
}

// Milestones para barra compacta
const MILESTONES = [
  { value: 100000, label: '100K', color: 'from-blue-500 to-cyan-500' },
  { value: 1000000, label: '1M', color: 'from-green-500 to-emerald-500' },
  { value: 2000000, label: '2M', color: 'from-teal-500 to-green-500' },
  { value: 3000000, label: '3M', color: 'from-purple-500 to-pink-500' },
  { value: 4000000, label: '4M', color: 'from-orange-500 to-amber-500' },
  { value: 5000000, label: '5M', color: 'from-red-500 to-pink-500' },
  { value: 10000000, label: '10M', color: 'from-yellow-500 to-orange-500' },
  { value: 25000000, label: '25M', color: 'from-indigo-500 to-purple-500' },
  { value: 50000000, label: '50M', color: 'from-pink-500 to-rose-500' },
  { value: 100000000, label: '100M', color: 'from-amber-400 to-yellow-500' },
]

// Mock total revenue - em producao viria do contexto/API
const TOTAL_REVENUE = 1850000

// Icone baseado no tipo de notificacao
const notificationIcons = {
  order: Package,
  delivery: Truck,
  stock: AlertTriangle,
  success: CheckCircle,
  warning: AlertTriangle,
  system: Info,
}

const notificationColors = {
  order: 'text-blue-500 bg-blue-500/10',
  delivery: 'text-green-500 bg-green-500/10',
  stock: 'text-orange-500 bg-orange-500/10',
  success: 'text-emerald-500 bg-emerald-500/10',
  warning: 'text-yellow-500 bg-yellow-500/10',
  system: 'text-purple-500 bg-purple-500/10',
}

export function Header({ workspaceName = 'Minha Loja' }: HeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { period, setPeriod, refresh, isRefreshing } = useDateFilter()
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Calcula progresso do milestone
  const milestoneData = useMemo(() => {
    let prevValue = 0
    for (let i = 0; i < MILESTONES.length; i++) {
      const milestone = MILESTONES[i]
      if (TOTAL_REVENUE < milestone.value) {
        const progress = ((TOTAL_REVENUE - prevValue) / (milestone.value - prevValue)) * 100
        return { nextMilestone: milestone, progress, prevValue }
      }
      prevValue = milestone.value
    }
    return { nextMilestone: MILESTONES[MILESTONES.length - 1], progress: 100, prevValue: 0 }
  }, [])

  const handlePeriodChange = (value: string) => {
    setPeriod(value as DateFilterPeriod)
  }

  const formatCompactCurrency = (value: number) => {
    if (value >= 1000000) return `R$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `R$${(value / 1000).toFixed(0)}K`
    return `R$${value}`
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/40 bg-background/80 backdrop-blur-xl px-6">
      {/* Search */}
      <div className="flex-1 flex items-center gap-4">
        <button className="group flex items-center gap-3 h-10 px-4 w-full max-w-md rounded-xl border border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:border-border transition-all duration-200">
          <Search className="h-4 w-4 shrink-0" />
          <span className="text-sm flex-1 text-left">Buscar pedidos, produtos...</span>
          <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border border-border/60 bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <Command className="h-3 w-3" />K
          </kbd>
        </button>
      </div>

      {/* AI Assistant Badge */}
      <Button
        variant="outline"
        size="sm"
        className="hidden lg:flex gap-2 h-9 rounded-xl border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/50"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">AI Insights</span>
        <Badge variant="secondary" className="h-4 px-1.5 text-[10px] bg-primary/10 text-primary border-0">
          Novo
        </Badge>
      </Button>

      {/* Compact Revenue Progress Bar */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/30 border border-border/40">
        <Trophy className={cn(
          "h-4 w-4",
          milestoneData.progress >= 75 ? "text-yellow-500" : "text-muted-foreground"
        )} />
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{formatCompactCurrency(TOTAL_REVENUE)}</span>
          <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                milestoneData.nextMilestone.color
              )}
              style={{ width: `${Math.min(milestoneData.progress, 100)}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{milestoneData.nextMilestone.label}</span>
        </div>
      </div>

      {/* Date Range Selector - Connected to Context */}
      <Select value={period} onValueChange={handlePeriodChange}>
        <SelectTrigger className={cn(
          "w-[140px] h-9 rounded-xl border-border/60 bg-muted/30 hover:bg-muted/50 transition-colors",
          period === 'max' && "bg-gradient-to-r from-purple-600/10 to-pink-600/10 border-purple-500/30"
        )}>
          {period === 'max' ? (
            <Infinity className="h-3.5 w-3.5 mr-2 text-purple-500" />
          ) : null}
          <SelectValue>
            <span className={cn("text-sm", period === 'max' && "font-bold text-purple-500")}>
              {periodLabels[period]}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="end" className="rounded-xl">
          <SelectItem value="today" className="rounded-lg">Hoje</SelectItem>
          <SelectItem value="yesterday" className="rounded-lg">Ontem</SelectItem>
          <SelectItem value="week" className="rounded-lg">Esta Semana</SelectItem>
          <SelectItem value="month" className="rounded-lg">Este Mes</SelectItem>
          <SelectItem value="last_month" className="rounded-lg">Mes Passado</SelectItem>
          <SelectItem value="max" className="rounded-lg">
            <div className="flex items-center gap-2">
              <Infinity className="h-3.5 w-3.5 text-purple-500" />
              <span className="font-bold text-purple-500">MAXIMO</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {/* Refresh Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl"
          onClick={refresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn(
            'h-4 w-4 transition-transform duration-500',
            isRefreshing && 'animate-spin'
          )} />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96 rounded-xl p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Notificacoes</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    {unreadCount} novas
                  </Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-primary hover:text-primary"
                  onClick={(e) => {
                    e.preventDefault()
                    markAllAsRead()
                  }}
                >
                  Marcar todas como lidas
                </Button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Bell className="h-10 w-10 mb-2 opacity-20" />
                  <p className="text-sm">Nenhuma notificacao</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const IconComponent = notificationIcons[notif.type] || Info
                  const colorClass = notificationColors[notif.type] || notificationColors.system

                  return (
                    <div
                      key={notif.id}
                      className={cn(
                        'group flex gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer border-b border-border/40 last:border-0 transition-colors',
                        notif.unread && 'bg-primary/5'
                      )}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                        colorClass
                      )}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn(
                            "text-sm truncate",
                            notif.unread ? "font-semibold" : "font-medium"
                          )}>
                            {notif.title}
                          </p>
                          <button
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeNotification(notif.id)
                            }}
                          >
                            <X className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{notif.description}</p>
                        <p className="text-[10px] text-muted-foreground/70 mt-1">{notif.time}</p>
                      </div>
                      {notif.unread && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                      )}
                    </div>
                  )
                })
              )}
            </div>
            {notifications.length > 0 && (
              <div className="p-2 border-t">
                <Link href="/dashboard/notifications">
                  <Button variant="ghost" className="w-full h-8 text-xs rounded-lg">
                    Ver todas as notificacoes
                  </Button>
                </Link>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
          {mounted && (
            <>
              <Sun className={cn(
                'h-4 w-4 transition-all duration-300',
                resolvedTheme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'
              )} />
              <Moon className={cn(
                'absolute h-4 w-4 transition-all duration-300',
                resolvedTheme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'
              )} />
            </>
          )}
        </Button>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-border/60" />

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-9 gap-2 pl-2 pr-3 rounded-xl hover:bg-muted/50"
          >
            <Avatar className="h-7 w-7 ring-2 ring-background">
              <AvatarImage src="/avatars/user.png" alt="User" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs font-semibold">
                JD
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium leading-tight">Joao Dev</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 rounded-xl" align="end" forceMount>
          <DropdownMenuLabel className="font-normal p-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/avatars/user.png" alt="User" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-semibold">Joao Dev</p>
                <p className="text-xs text-muted-foreground">joao@email.com</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 py-2 cursor-pointer rounded-lg mx-1">
            <User className="h-4 w-4 text-muted-foreground" />
            Meu Perfil
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 py-2 cursor-pointer rounded-lg mx-1">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Workspace</span>
            <span className="text-xs text-muted-foreground">{workspaceName}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 py-2 cursor-pointer rounded-lg mx-1">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            Assinatura
            <Badge variant="secondary" className="ml-auto h-5 text-[10px]">Pro</Badge>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 py-2 cursor-pointer rounded-lg mx-1">
            <Settings className="h-4 w-4 text-muted-foreground" />
            Configuracoes
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 py-2 cursor-pointer rounded-lg mx-1 text-destructive focus:text-destructive">
            <LogOut className="h-4 w-4" />
            Sair da conta
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
