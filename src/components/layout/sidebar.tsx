'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
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
  Package,
  Users,
  DollarSign,
  CheckSquare,
  Settings,
  BarChart3,
  Globe,
  Truck,
  AlertCircle,
  PieChart,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Zap,
  HelpCircle,
  Shield,
  Warehouse,
  CreditCard,
  FileCheck,
  GitCompare,
  Megaphone,
  Facebook,
  Search,
  Music2,
  Activity,
  Target,
  Crown,
} from 'lucide-react'
import { useState } from 'react'

// PRINCIPAL - Main navigation
const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    color: 'text-primary',
  },
  {
    title: 'Atribuição COD',
    href: '/dashboard/atribuicao',
    icon: Target,
    color: 'text-orange-500',
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
]

// TRAFEGO PAGO - Traffic sources with spend control
const trafficNavItems = [
  {
    title: 'Meta Ads',
    href: '/dashboard/trafego/meta',
    icon: Facebook,
    color: 'text-[#1877F2]',
  },
  {
    title: 'Google Ads',
    href: '/dashboard/trafego/google',
    icon: Search,
    color: 'text-[#EA4335]',
  },
  {
    title: 'TikTok Ads',
    href: '/dashboard/trafego/tiktok',
    icon: Music2,
    color: 'text-black dark:text-white',
  },
  {
    title: 'Gastos & BMs',
    href: '/dashboard/controle/anuncios',
    icon: Megaphone,
    color: 'text-pink-500',
  },
]

// INTEGRACOES - Platform connections
const integrationNavItems = [
  {
    title: 'Todas Integrações',
    href: '/dashboard/integrations',
    icon: Settings,
    color: 'text-purple-500',
  },
  {
    title: 'Conectar Meta',
    href: '/dashboard/integracoes/meta',
    icon: Facebook,
    color: 'text-[#1877F2]',
  },
  {
    title: 'Conectar Google',
    href: '/dashboard/integracoes/google',
    icon: Search,
    color: 'text-[#EA4335]',
  },
  {
    title: 'Conectar TikTok',
    href: '/dashboard/integracoes/tiktok',
    icon: Music2,
    color: 'text-black dark:text-white',
  },
  {
    title: 'Pixels & UTMs',
    href: '/dashboard/integracoes/pixels',
    icon: Activity,
    color: 'text-lime-500',
  },
]

// GESTAO - Management
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

// FINANCEIRO - Financial
const financialNavItems = [
  {
    title: 'Assinaturas',
    href: '/dashboard/assinaturas',
    icon: CreditCard,
    color: 'text-primary',
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

// OPERACIONAL - Operational
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

// CONTROLE - Control (focused on warehouse/delivery)
const controlNavItems = [
  {
    title: 'N1 Warehouse',
    href: '/dashboard/controle/n1',
    icon: Warehouse,
    color: 'text-blue-500',
  },
  {
    title: 'Conferência',
    href: '/dashboard/controle/conferencia',
    icon: FileCheck,
    color: 'text-orange-500',
  },
  {
    title: 'Divergências',
    href: '/dashboard/controle/divergencias',
    icon: GitCompare,
    color: 'text-red-500',
  },
  {
    title: 'Pagamentos',
    href: '/dashboard/controle/pagamentos',
    icon: CreditCard,
    color: 'text-purple-500',
  },
]

// SISTEMA - System settings
const systemNavItems = [
  {
    title: 'Configurações',
    href: '/dashboard/settings',
    icon: Settings,
    color: 'text-slate-500',
  },
]

// MATRIX ADMIN - Only visible for Matrix users
const matrixNavItem = {
  title: 'Painel Matrix',
  href: '/dashboard/admin',
  icon: Crown,
  color: 'text-purple-500',
}

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)
  const [controlOpen, setControlOpen] = useState(false)
  const [integracoesOpen, setIntegracoesOpen] = useState(false)

  const isMatrix = session?.user?.role === 'MATRIX'
  const isPaymentExempt = session?.user?.isPaymentExempt === true

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

            <NavSection title="Tráfego Pago" items={trafficNavItems} />

            {/* INTEGRACOES - Expandable Section */}
            <div className="space-y-1 mt-2">
              {!collapsed ? (
                <Collapsible open={integracoesOpen} onOpenChange={setIntegracoesOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full group">
                    <h4 className="sidebar-section-title flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors">
                      <Zap className="h-3.5 w-3.5 text-lime-500" />
                      Integrações
                    </h4>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform duration-200",
                      integracoesOpen && "rotate-180"
                    )} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 mt-1">
                    {integrationNavItems.map((item) => (
                      <NavItem key={item.href} item={item} />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <>
                  <div className="h-2" />
                  {integrationNavItems.map((item) => (
                    <NavItem key={item.href} item={item} />
                  ))}
                </>
              )}
            </div>

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

            <NavSection title="Sistema" items={systemNavItems} />

            {/* MATRIX ADMIN - Only visible for Matrix users */}
            {isMatrix && (
              <>
                <div className={cn('h-px bg-border/50', collapsed && 'mx-2')} />
                <div className="space-y-1">
                  {!collapsed && (
                    <h4 className="sidebar-section-title flex items-center gap-2">
                      <Crown className="h-3.5 w-3.5 text-purple-500" />
                      Matrix Admin
                    </h4>
                  )}
                  {collapsed && <div className="h-2" />}
                  <NavItem item={matrixNavItem} />
                </div>
              </>
            )}
          </nav>
        </ScrollArea>

        {/* Upgrade Card - Only show when expanded and user is not exempt */}
        {!collapsed && !isPaymentExempt && !isMatrix && (
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
                <Link href="/dashboard/pricing">
                  <Button size="sm" className="w-full btn-glow">
                    Ver planos
                  </Button>
                </Link>
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
