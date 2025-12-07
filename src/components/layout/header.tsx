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
  Calendar,
  RefreshCw,
  Command,
  Sparkles,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Building2,
  CreditCard,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  workspaceName?: string
}

const dateRangeLabels: Record<string, string> = {
  today: 'Hoje',
  yesterday: 'Ontem',
  '7days': '7 dias',
  '30days': '30 dias',
  thisMonth: 'Este mês',
  lastMonth: 'Mês passado',
  custom: 'Personalizado',
}

export function Header({ workspaceName = 'Minha Loja' }: HeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [dateRange, setDateRange] = useState('7days')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
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

      {/* Date Range Selector */}
      <Select value={dateRange} onValueChange={setDateRange}>
        <SelectTrigger className="w-[150px] h-9 rounded-xl border-border/60 bg-muted/30 hover:bg-muted/50 transition-colors">
          <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
          <SelectValue>
            <span className="text-sm">{dateRangeLabels[dateRange]}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="end" className="rounded-xl">
          <SelectItem value="today" className="rounded-lg">Hoje</SelectItem>
          <SelectItem value="yesterday" className="rounded-lg">Ontem</SelectItem>
          <SelectItem value="7days" className="rounded-lg">Últimos 7 dias</SelectItem>
          <SelectItem value="30days" className="rounded-lg">Últimos 30 dias</SelectItem>
          <SelectItem value="thisMonth" className="rounded-lg">Este mês</SelectItem>
          <SelectItem value="lastMonth" className="rounded-lg">Mês passado</SelectItem>
          <SelectItem value="custom" className="rounded-lg">Personalizado</SelectItem>
        </SelectContent>
      </Select>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {/* Refresh Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl"
          onClick={handleRefresh}
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
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                <span className="relative inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                  3
                </span>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-xl p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold">Notificações</span>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-primary">
                Marcar todas como lidas
              </Button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {[
                { title: 'Novo pedido recebido', desc: 'Pedido #4521 - R$ 289,90', time: '2 min', unread: true },
                { title: 'Entrega confirmada', desc: 'Pedido #4518 foi entregue', time: '15 min', unread: true },
                { title: 'Estoque baixo', desc: 'Sérum Vitamina C - 8 unidades', time: '1h', unread: true },
              ].map((notif, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer border-b border-border/40 last:border-0',
                    notif.unread && 'bg-primary/5'
                  )}
                >
                  <div className={cn(
                    'w-2 h-2 rounded-full mt-2 shrink-0',
                    notif.unread ? 'bg-primary' : 'bg-transparent'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{notif.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{notif.desc}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{notif.time}</span>
                </div>
              ))}
            </div>
            <div className="p-2 border-t">
              <Button variant="ghost" className="w-full h-8 text-xs rounded-lg">
                Ver todas as notificações
              </Button>
            </div>
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
              <span className="text-sm font-medium leading-tight">João Dev</span>
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
                <p className="text-sm font-semibold">João Dev</p>
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
            Configurações
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
