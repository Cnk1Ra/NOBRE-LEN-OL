'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  MoreHorizontal,
  Package,
  Edit,
  Trash2,
  Eye,
  Copy,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Product {
  id: string
  name: string
  sku: string
  price: number
  costPrice: number
  stock: number
  category: string
  status: 'active' | 'inactive' | 'out_of_stock'
  sold: number
  revenue: number
  image?: string
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Produto Premium X',
    sku: 'SKU-001',
    price: 289.90,
    costPrice: 120.00,
    stock: 45,
    category: 'Eletronicos',
    status: 'active',
    sold: 156,
    revenue: 45224.40,
  },
  {
    id: '2',
    name: 'Kit Completo Y',
    sku: 'SKU-002',
    price: 459.90,
    costPrice: 180.00,
    stock: 23,
    category: 'Kits',
    status: 'active',
    sold: 89,
    revenue: 40931.10,
  },
  {
    id: '3',
    name: 'Acessorio Z',
    sku: 'SKU-003',
    price: 89.90,
    costPrice: 35.00,
    stock: 0,
    category: 'Acessorios',
    status: 'out_of_stock',
    sold: 234,
    revenue: 21036.60,
  },
  {
    id: '4',
    name: 'Produto Basico W',
    sku: 'SKU-004',
    price: 149.90,
    costPrice: 60.00,
    stock: 78,
    category: 'Basicos',
    status: 'active',
    sold: 67,
    revenue: 10043.30,
  },
  {
    id: '5',
    name: 'Combo Especial V',
    sku: 'SKU-005',
    price: 599.90,
    costPrice: 250.00,
    stock: 12,
    category: 'Combos',
    status: 'active',
    sold: 34,
    revenue: 20396.60,
  },
  {
    id: '6',
    name: 'Produto Descontinuado',
    sku: 'SKU-006',
    price: 199.90,
    costPrice: 80.00,
    stock: 5,
    category: 'Outros',
    status: 'inactive',
    sold: 12,
    revenue: 2398.80,
  },
]

const statusLabels = {
  active: 'Ativo',
  inactive: 'Inativo',
  out_of_stock: 'Sem Estoque',
}

const statusVariants: Record<string, 'success' | 'secondary' | 'destructive'> = {
  active: 'success',
  inactive: 'secondary',
  out_of_stock: 'destructive',
}

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProducts = mockProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalProducts = mockProducts.length
  const activeProducts = mockProducts.filter(p => p.status === 'active').length
  const totalRevenue = mockProducts.reduce((sum, p) => sum + p.revenue, 0)
  const totalSold = mockProducts.reduce((sum, p) => sum + p.sold, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie seu catalogo de produtos
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Produtos</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Produtos Ativos</p>
                <p className="text-2xl font-bold text-green-500">{activeProducts}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unidades Vendidas</p>
                <p className="text-2xl font-bold">{totalSold}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue, 'BRL')}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Products Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-video bg-muted flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.sku}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-lg font-bold">{formatCurrency(product.price, 'BRL')}</p>
                  <p className="text-xs text-muted-foreground">Custo: {formatCurrency(product.costPrice, 'BRL')}</p>
                </div>
                <Badge variant={statusVariants[product.status]}>
                  {statusLabels[product.status]}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t text-center">
                <div>
                  <p className="text-sm font-medium">{product.stock}</p>
                  <p className="text-xs text-muted-foreground">Estoque</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{product.sold}</p>
                  <p className="text-xs text-muted-foreground">Vendidos</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-500">
                    {(((product.price - product.costPrice) / product.price) * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Margem</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
