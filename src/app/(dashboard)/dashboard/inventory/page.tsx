'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Search,
  Plus,
  RefreshCw,
  BarChart3,
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

// Inventory data - starts empty, will be populated from API/database
const inventoryItems: {
  id: string
  name: string
  sku: string
  quantity: number
  minQuantity: number
  costPrice: number
  salePrice: number
  location: string
  lastRestockAt: string
  status: string
}[] = []

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'normal':
      return <Badge variant="success">Normal</Badge>
    case 'low':
      return <Badge variant="warning">Baixo</Badge>
    case 'critical':
      return <Badge variant="destructive">Crítico</Badge>
    case 'out':
      return <Badge variant="destructive">Esgotado</Badge>
    default:
      return <Badge variant="secondary">-</Badge>
  }
}

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalItems = inventoryItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalValue = inventoryItems.reduce(
    (sum, item) => sum + item.quantity * item.costPrice,
    0
  )
  const lowStockItems = inventoryItems.filter(
    (item) => item.status === 'low' || item.status === 'critical' || item.status === 'out'
  ).length
  const outOfStockItems = inventoryItems.filter(
    (item) => item.status === 'out'
  ).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estoque</h1>
          <p className="text-muted-foreground">
            Gerencie o inventário dos seus produtos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sincronizar Shopify
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Entrada de Estoque
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <Package className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(totalItems)}</p>
                <p className="text-xs text-muted-foreground">Itens em Estoque</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                <BarChart3 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
                <p className="text-xs text-muted-foreground">Valor em Estoque</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lowStockItems}</p>
                <p className="text-xs text-muted-foreground">Estoque Baixo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10">
                <TrendingDown className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{outOfStockItems}</p>
                <p className="text-xs text-muted-foreground">Esgotados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Inventário</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar produto ou SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Baixo</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                  <SelectItem value="out">Esgotado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4 text-left text-sm font-medium">Produto</th>
                  <th className="p-4 text-left text-sm font-medium">SKU</th>
                  <th className="p-4 text-left text-sm font-medium">Quantidade</th>
                  <th className="p-4 text-left text-sm font-medium">Nível</th>
                  <th className="p-4 text-left text-sm font-medium">Custo Unit.</th>
                  <th className="p-4 text-left text-sm font-medium">Valor Total</th>
                  <th className="p-4 text-left text-sm font-medium">Status</th>
                  <th className="p-4 text-left text-sm font-medium">Local</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const stockLevel = (item.quantity / (item.minQuantity * 2)) * 100
                  return (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <p className="font-medium">{item.name}</p>
                      </td>
                      <td className="p-4">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {item.sku}
                        </code>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.quantity}</span>
                          <span className="text-xs text-muted-foreground">
                            / min: {item.minQuantity}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 w-32">
                        <Progress
                          value={Math.min(stockLevel, 100)}
                          className={`h-2 ${
                            item.status === 'out'
                              ? '[&>div]:bg-red-500'
                              : item.status === 'critical'
                              ? '[&>div]:bg-red-500'
                              : item.status === 'low'
                              ? '[&>div]:bg-yellow-500'
                              : '[&>div]:bg-green-500'
                          }`}
                        />
                      </td>
                      <td className="p-4">
                        {formatCurrency(item.costPrice)}
                      </td>
                      <td className="p-4">
                        <span className="font-medium">
                          {formatCurrency(item.quantity * item.costPrice)}
                        </span>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {item.location}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {lowStockItems > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventoryItems
                .filter((item) => item.status !== 'normal')
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background border"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} em estoque (mínimo: {item.minQuantity})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(item.status)}
                      <Button size="sm">Reabastecer</Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
