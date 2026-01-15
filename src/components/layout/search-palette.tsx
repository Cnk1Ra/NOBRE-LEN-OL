'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Package,
  ShoppingCart,
  Users,
  Settings,
  Truck,
  CreditCard,
  BarChart3,
  FileText,
  Search,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

interface SearchResult {
  id: string
  type: 'order' | 'product' | 'customer'
  title: string
  subtitle?: string
  status?: string
  value?: number
}

interface SearchPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-600',
  SHIPPED: 'bg-blue-500/10 text-blue-600',
  DELIVERED: 'bg-green-500/10 text-green-600',
  RETURNED: 'bg-red-500/10 text-red-600',
  OUT_FOR_DELIVERY: 'bg-purple-500/10 text-purple-600',
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregue',
  RETURNED: 'Devolvido',
  OUT_FOR_DELIVERY: 'Em Entrega',
}

const quickActions = [
  { id: 'orders', label: 'Ver Pedidos', icon: ShoppingCart, href: '/dashboard/orders' },
  { id: 'products', label: 'Gerenciar Produtos', icon: Package, href: '/dashboard/products' },
  { id: 'customers', label: 'Ver Clientes', icon: Users, href: '/dashboard/customers' },
  { id: 'deliveries', label: 'Acompanhar Entregas', icon: Truck, href: '/dashboard/deliveries' },
  { id: 'financial', label: 'Financeiro', icon: CreditCard, href: '/dashboard/financial' },
  { id: 'reports', label: 'Relatorios', icon: BarChart3, href: '/dashboard/reports' },
  { id: 'settings', label: 'Configuracoes', icon: Settings, href: '/dashboard/settings' },
]

export function SearchPalette({ open, onOpenChange }: SearchPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])

  // Search API
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      return
    }

    setIsSearching(true)
    try {
      // Search orders
      const ordersResponse = await fetch(`/api/orders?search=${encodeURIComponent(searchQuery)}&limit=5`)
      const ordersData = ordersResponse.ok ? await ordersResponse.json() : { data: [] }

      // Search products
      const productsResponse = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`)
      const productsData = productsResponse.ok ? await productsResponse.json() : { data: [] }

      const searchResults: SearchResult[] = []

      // Add orders to results
      if (ordersData.data) {
        ordersData.data.forEach((order: any) => {
          searchResults.push({
            id: order.id,
            type: 'order',
            title: `Pedido #${order.id.slice(-8).toUpperCase()}`,
            subtitle: order.customerName,
            status: order.status,
            value: order.total,
          })
        })
      }

      // Add products to results
      if (productsData.data) {
        productsData.data.forEach((product: any) => {
          searchResults.push({
            id: product.id,
            type: 'product',
            title: product.name,
            subtitle: `SKU: ${product.sku || 'N/A'}`,
            value: product.price,
          })
        })
      }

      setResults(searchResults)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        performSearch(query)
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, performSearch])

  // Clear on close
  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
    }
  }, [open])

  const handleSelect = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }

  const orderResults = results.filter(r => r.type === 'order')
  const productResults = results.filter(r => r.type === 'product')

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Buscar pedidos, produtos, clientes..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isSearching ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Buscando...</span>
          </div>
        ) : (
          <>
            <CommandEmpty>
              {query.length > 0 ? (
                <div className="flex flex-col items-center py-4">
                  <Search className="h-10 w-10 text-muted-foreground/30 mb-2" />
                  <p>Nenhum resultado encontrado para "{query}"</p>
                </div>
              ) : (
                <p>Digite para buscar...</p>
              )}
            </CommandEmpty>

            {/* Search Results */}
            {orderResults.length > 0 && (
              <CommandGroup heading="Pedidos">
                {orderResults.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.title}
                    onSelect={() => handleSelect(`/dashboard/orders/${result.id}`)}
                    className="flex items-center gap-3 py-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                      <ShoppingCart className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{result.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                    </div>
                    {result.status && (
                      <Badge variant="secondary" className={statusColors[result.status]}>
                        {statusLabels[result.status] || result.status}
                      </Badge>
                    )}
                    {result.value && (
                      <span className="text-sm font-medium">
                        {formatCurrency(result.value, 'BRL')}
                      </span>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {productResults.length > 0 && (
              <>
                {orderResults.length > 0 && <CommandSeparator />}
                <CommandGroup heading="Produtos">
                  {productResults.map((result) => (
                    <CommandItem
                      key={result.id}
                      value={result.title}
                      onSelect={() => handleSelect(`/dashboard/products/${result.id}`)}
                      className="flex items-center gap-3 py-3"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10">
                        <Package className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{result.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                      </div>
                      {result.value && (
                        <span className="text-sm font-medium">
                          {formatCurrency(result.value, 'BRL')}
                        </span>
                      )}
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {/* Quick Actions - Show when no search query */}
            {query.length === 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Acoes Rapidas">
                  {quickActions.map((action) => (
                    <CommandItem
                      key={action.id}
                      value={action.label}
                      onSelect={() => handleSelect(action.href)}
                      className="flex items-center gap-3 py-2"
                    >
                      <action.icon className="h-4 w-4 text-muted-foreground" />
                      <span>{action.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
