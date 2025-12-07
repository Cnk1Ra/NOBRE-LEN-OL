'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
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
} from 'lucide-react'
import { useState } from 'react'

const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Pedidos',
    href: '/dashboard/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Entregas COD',
    href: '/dashboard/deliveries',
    icon: Truck,
  },
  {
    title: 'Tracking',
    href: '/dashboard/tracking',
    icon: Target,
  },
  {
    title: 'Campanhas',
    href: '/dashboard/campaigns',
    icon: TrendingUp,
  },
]

const managementNavItems = [
  {
    title: 'Produtos',
    href: '/dashboard/products',
    icon: Package,
  },
  {
    title: 'Estoque',
    href: '/dashboard/inventory',
    icon: BarChart3,
  },
  {
    title: 'Países',
    href: '/dashboard/countries',
    icon: Globe,
  },
]

const financialNavItems = [
  {
    title: 'Financeiro',
    href: '/dashboard/financial',
    icon: DollarSign,
  },
  {
    title: 'Sócios',
    href: '/dashboard/partners',
    icon: Users,
  },
  {
    title: 'Relatórios',
    href: '/dashboard/reports',
    icon: PieChart,
  },
]

const operationalNavItems = [
  {
    title: 'Tarefas',
    href: '/dashboard/tasks',
    icon: CheckSquare,
  },
  {
    title: 'Pendências',
    href: '/dashboard/pending',
    icon: AlertCircle,
  },
]

const integrationNavItems = [
  {
    title: 'Shopify',
    href: '/dashboard/integrations/shopify',
    icon: Store,
  },
  {
    title: 'Configurações',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const NavItem = ({ item }: { item: typeof mainNavItems[0] }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    const Icon = item.icon

    return (
      <Link
        href={item.href}
        className={cn(
          'sidebar-link',
          isActive && 'active',
          collapsed && 'justify-center px-2'
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span>{item.title}</span>}
      </Link>
    )
  }

  const NavSection = ({ title, items }: { title: string; items: typeof mainNavItems }) => (
    <div className="space-y-1">
      {!collapsed && (
        <h4 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h4>
      )}
      {items.map((item) => (
        <NavItem key={item.href} item={item} />
      ))}
    </div>
  )

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-card transition-all duration-300',
        collapsed ? 'w-[70px]' : 'w-[260px]',
        className
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center border-b h-16 px-4',
        collapsed && 'justify-center px-2'
      )}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            D
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight">DOD</span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                Dash On Delivery
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-6 px-3">
          <NavSection title="Principal" items={mainNavItems} />
          <Separator />
          <NavSection title="Gestão" items={managementNavItems} />
          <Separator />
          <NavSection title="Financeiro" items={financialNavItems} />
          <Separator />
          <NavSection title="Operacional" items={operationalNavItems} />
          <Separator />
          <NavSection title="Integrações" items={integrationNavItems} />
        </nav>
      </ScrollArea>

      {/* Collapse button */}
      <div className="border-t p-3">
        <Button
          variant="ghost"
          size="sm"
          className={cn('w-full', collapsed && 'px-0')}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Recolher
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}
