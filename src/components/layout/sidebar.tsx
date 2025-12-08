'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  LayoutDashboard,
  ShoppingCart,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  Target,
  CheckSquare,
  Settings,
  BarChart3,
  Globe,
  Truck,
  AlertCircle,
  PieChart,
  Store,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Zap,
  HelpCircle,
  LogOut,
  Shield,
  Warehouse,
  CreditCard,
  FileCheck,
  ClipboardList,
  GitCompare,
} from 'lucide-react'
import { useState } from 'react'

const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    color: 'text-primary',
  },
  {
    title: 'Pedidos',
    href: '/dashboard/orders',
    icon: ShoppingCart,
    color: 'text-blue-500',
  },
  {
    title: 'Entregas COD',
    href: '/dashboard/deliveries',
    icon: Truck,
    color: 'text-emerald-500',
  },
  {
    title: 'Tracking',
    href: '/dashboard/tracking',
    icon: Target,
    color: 'text-orange-500',
  },
  {
    title: 'Campanhas',
    href: '/dashboard/campaigns',
    icon: TrendingUp,
    color: 'text-pink-500',
  },
]

const managementNavItems = [
  {
    title: 'Produtos',
    href: '/dashboard/products',
    icon: Package,
    color: 'text-violet-500',
  },
  {
    title: 'Estoque',
    href: '/dashboard/inventory',
    icon: BarChart3,
    color: 'text-cyan-500',
  },
  {
    title: 'Países',
    href: '/dashboard/countries',
    icon: Globe,
    color: 'text-teal-500',
  },
]

const financialNavItems = [
  {
    title: 'Financeiro',
    href: '/dashboard/financial',
    icon: DollarSign,
    color: 'text-green-500',
  },
  {
    title: 'Sócios',
    href: '/dashboard/partners',
    icon: Users,
    color: 'text-amber-500',
  },
  {
    title: 'Relatórios',
    href: '/dashboard/reports',
    icon: PieChart,
    color: 'text-indigo-500',
  },
]

const operationalNavItems = [
  {
    title: 'Tarefas',
    href: '/dashboard/tasks',
    icon: CheckSquare,
    color: 'text-sky-500',
  },
  {
    title: 'Pendências',
    href: '/dashboard/pending',
    icon: AlertCircle,
    color: 'text-rose-500',
  },
]

const integrationNavItems = [
  {
    title: 'Integrações',
    href: '/dashboard/integrations',
    icon: Zap,
    color: 'text-lime-500',
  },
  {
    title: 'Configurações',
    href: '/dashboard/settings',
    icon: Settings,
    color: 'text-slate-500',
  },
]

// CONTROLE - Expandable section with sub-items
const controlNavItems = [
  {
    title: 'N1 Warehouse',
    href: '/dashboard/controle/n1',
    icon: Warehouse,
    color: 'text-blue-500',
    description: 'Comparar pedidos',
  },
  {
    title: 'Financeiro',
    href: '/dashboard/controle/financeiro',
    icon: DollarSign,
    color: 'text-green-500',
    description: 'Controle financeiro',
  },
  {
    title: 'Pagamentos',
    href: '/dashboard/controle/pagamentos',
    icon: CreditCard,
    color: 'text-purple-500',
    description: 'Controle de pagamentos',
  },
  {
    title: 'Conferência',
    href: '/dashboard/controle/conferencia',
    icon: FileCheck,
    color: 'text-orange-500',
    description: 'Conferir entregas',
  },
  {
    title: 'Divergências',
    href: '/dashboard/controle/divergencias',
    icon: GitCompare,
    color: 'text-red-500',
    description: 'Pedidos com problemas',
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [controlOpen, setControlOpen] = useState(true)

  const NavItem = ({ item }: { item: typeof mainNavItems[0] }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    const Icon = item.icon

    const linkContent = (
      <Link
        href={item.href}
        className={cn(
          'group relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
          'text-muted-foreground hover:text-foreground',
          isActive
            ? 'bg-primary/10 text-primary font-semibold'
            : 'hover:bg-muted/80',
          collapsed && 'justify-center px-2.5'
        )}
      >
        {/* Active indicator */}
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
        )}

        <Icon className={cn(
          'h-[18px] w-[18px] shrink-0 transition-colors duration-200',
          isActive ? 'text-primary' : cn(item.color, 'group-hover:text-foreground')
        )} />

        {!collapsed && (
          <span className="truncate">{item.title}</span>
        )}

        {/* Hover effect */}
        {!isActive && (
          <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        )}
      </Link>
    )

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.title}
          </TooltipContent>
        </Tooltip>
      )
    }

    return linkContent
  }

  const NavSection = ({
    title,
    items
  }: {
    title: string
    items: typeof mainNavItems
  }) => (
    <div className="space-y-1">
      {!collapsed && (
        <h4 className="sidebar-section-title">
          {title}
        </h4>
      )}
      {collapsed && <div className="h-2" />}
      {items.map((item) => (
        <NavItem key={item.href} item={item} />
      ))}
    </div>
  )

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out',
          collapsed ? 'w-[72px]' : 'w-[260px]',
          className
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center h-16 px-4 border-b border-sidebar-border',
          collapsed && 'justify-center px-2'
        )}>
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25 transition-transform duration-200 group-hover:scale-105">
              <span className="relative z-10">D</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight">DOD</span>
                <span className="text-[10px] text-muted-foreground font-medium tracking-wide">
                  Dash On Delivery
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4 px-3">
          <nav className="space-y-6">
            <NavSection title="Principal" items={mainNavItems} />

            <div className={cn('h-px bg-border/50', collapsed && 'mx-2')} />

            <NavSection title="Gestão" items={managementNavItems} />

            <div className={cn('h-px bg-border/50', collapsed && 'mx-2')} />

            <NavSection title="Financeiro" items={financialNavItems} />

            <div className={cn('h-px bg-border/50', collapsed && 'mx-2')} />

            <NavSection title="Operacional" items={operationalNavItems} />

            <div className={cn('h-px bg-border/50', collapsed && 'mx-2')} />

            {/* CONTROLE - Expandable Section */}
            <div className="space-y-1">
              {!collapsed ? (
                <Collapsible open={controlOpen} onOpenChange={setControlOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full group">
                    <h4 className="sidebar-section-title flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors">
                      <Shield className="h-3.5 w-3.5 text-red-500" />
                      Controle
                    </h4>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform duration-200",
                      controlOpen && "rotate-180"
                    )} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 mt-1">
                    {controlNavItems.map((item) => (
                      <NavItem key={item.href} item={item} />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <>
                  <div className="h-2" />
                  {controlNavItems.map((item) => (
                    <NavItem key={item.href} item={item} />
                  ))}
                </>
              )}
            </div>

            <div className={cn('h-px bg-border/50', collapsed && 'mx-2')} />

            <NavSection title="Integrações" items={integrationNavItems} />
          </nav>
        </ScrollArea>

        {/* Upgrade Card - Only show when expanded */}
        {!collapsed && (
          <div className="px-3 py-3">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 p-4 border border-primary/20">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Upgrade Pro</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Desbloqueie recursos avançados de tracking e relatórios.
                </p>
                <Button size="sm" className="w-full btn-glow">
                  Ver planos
                </Button>
              </div>
              {/* Decorative gradient blob */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
            </div>
          </div>
        )}

        {/* Bottom section */}
        <div className="border-t border-sidebar-border p-3 space-y-1">
          {/* Help */}
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full h-10 rounded-xl"
                >
                  <HelpCircle className="h-[18px] w-[18px] text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Ajuda</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-10 px-3 text-muted-foreground hover:text-foreground rounded-xl"
            >
              <HelpCircle className="h-[18px] w-[18px]" />
              <span className="text-sm font-medium">Ajuda & Suporte</span>
            </Button>
          )}

          {/* Collapse button */}
          <Button
            variant="ghost"
            size={collapsed ? 'icon' : 'default'}
            className={cn(
              'w-full h-10 rounded-xl text-muted-foreground hover:text-foreground',
              !collapsed && 'justify-start gap-3 px-3'
            )}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-[18px] w-[18px]" />
            ) : (
              <>
                <ChevronLeft className="h-[18px] w-[18px]" />
                <span className="text-sm font-medium">Recolher menu</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
