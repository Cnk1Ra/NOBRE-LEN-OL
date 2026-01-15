'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  Loader2,
  Save,
  RefreshCw,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

interface Product {
  id: string
  name: string
  sku: string
  salePrice: number
  costPrice: number
  description?: string
  imageUrl?: string
  isActive: boolean
  inventory?: {
    quantity: number
    minQuantity: number
  }
  _count?: {
    orderItems: number
  }
}

interface Stats {
  total: number
  active: number
  lowStock: number
  totalValue: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, lowStock: 0, totalValue: 0 })

  // Create/Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/products?${params}`)
      if (!response.ok) throw new Error('Erro ao carregar produtos')

      const data = await response.json()
      setProducts(data.data || [])
      setStats(data.stats || { total: 0, active: 0, lowStock: 0, totalValue: 0 })
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os produtos.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm, fetchProducts])

  // Handle create
  const handleCreate = () => {
    setIsCreating(true)
    setEditingProduct({
      name: '',
      sku: '',
      salePrice: 0,
      costPrice: 0,
      description: '',
      isActive: true,
    })
    setEditModalOpen(true)
  }

  // Handle edit
  const handleEdit = (product: Product) => {
    setIsCreating(false)
    setEditingProduct({ ...product })
    setEditModalOpen(true)
  }

  // Handle save
  const handleSave = async () => {
    if (!editingProduct) return

    if (!editingProduct.name || !editingProduct.sku) {
      toast({
        title: 'Erro',
        description: 'Nome e SKU são obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      const url = isCreating ? '/api/products' : `/api/products/${editingProduct.id}`
      const method = isCreating ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingProduct.name,
          sku: editingProduct.sku,
          salePrice: editingProduct.salePrice,
          costPrice: editingProduct.costPrice,
          description: editingProduct.description,
          isActive: editingProduct.isActive,
        }),
      })

      if (!response.ok) throw new Error('Erro ao salvar produto')

      const savedProduct = await response.json()

      if (isCreating) {
        setProducts(prev => [savedProduct, ...prev])
      } else {
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? savedProduct : p))
      }

      setEditModalOpen(false)
      setEditingProduct(null)

      toast({
        title: isCreating ? 'Produto criado!' : 'Produto atualizado!',
        description: `${savedProduct.name} foi ${isCreating ? 'criado' : 'atualizado'} com sucesso.`,
        className: 'bg-green-500 text-white border-green-600',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o produto.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle delete
  const handleDelete = (productId: string) => {
    setDeletingProductId(productId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingProductId) return

    try {
      const response = await fetch(`/api/products/${deletingProductId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Erro ao excluir produto')

      setProducts(prev => prev.filter(p => p.id !== deletingProductId))
      setDeleteDialogOpen(false)

      toast({
        title: 'Produto removido!',
        description: 'O produto foi desativado com sucesso.',
        className: 'bg-green-500 text-white border-green-600',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o produto.',
        variant: 'destructive',
      })
    } finally {
      setDeletingProductId(null)
    }
  }

  // Handle copy
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copiado!',
      description: `${label} copiado para a área de transferência.`,
      className: 'bg-green-500 text-white border-green-600',
    })
  }

  const getStatusLabel = (product: Product) => {
    if (!product.isActive) return 'Inativo'
    if (product.inventory && product.inventory.quantity === 0) return 'Sem Estoque'
    if (product.inventory && product.inventory.quantity <= product.inventory.minQuantity) return 'Estoque Baixo'
    return 'Ativo'
  }

  const getStatusVariant = (product: Product): 'success' | 'secondary' | 'destructive' | 'warning' => {
    if (!product.isActive) return 'secondary'
    if (product.inventory && product.inventory.quantity === 0) return 'destructive'
    if (product.inventory && product.inventory.quantity <= product.inventory.minQuantity) return 'warning'
    return 'success'
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Create/Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isCreating ? <Plus className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
              {isCreating ? 'Novo Produto' : `Editar ${editingProduct?.name}`}
            </DialogTitle>
            <DialogDescription>
              {isCreating ? 'Preencha os dados do novo produto.' : 'Faça as alterações necessárias.'}
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Produto *</Label>
                <Input
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="Ex: Produto Premium X"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SKU *</Label>
                  <Input
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    placeholder="Ex: SKU-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editingProduct.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isActive: e.target.value === 'active' })}
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço de Venda (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingProduct.salePrice || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, salePrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Custo (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingProduct.costPrice || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Descrição do produto..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isCreating ? 'Criar Produto' : 'Salvar Alterações'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar este produto? Ele não aparecerá mais na lista de produtos ativos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie seu catalogo de produtos
          </p>
        </div>
        <Button onClick={handleCreate}>
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
                <p className="text-2xl font-bold">{stats.total}</p>
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
                <p className="text-2xl font-bold text-green-500">{stats.active}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estoque Baixo</p>
                <p className="text-2xl font-bold text-orange-500">{stats.lowStock}</p>
              </div>
              <Package className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor em Estoque</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalValue, 'BRL')}</p>
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
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Package className="h-12 w-12 mb-4" />
          <p>Nenhum produto encontrado</p>
          {searchTerm && <p className="text-sm">Tente uma busca diferente</p>}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full" />
                ) : (
                  <Package className="h-12 w-12 text-muted-foreground" />
                )}
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
                      <DropdownMenuItem onClick={() => handleEdit(product)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCopy(product.sku, 'SKU')}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar SKU
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Desativar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-lg font-bold">{formatCurrency(product.salePrice, 'BRL')}</p>
                    <p className="text-xs text-muted-foreground">Custo: {formatCurrency(product.costPrice, 'BRL')}</p>
                  </div>
                  <Badge variant={getStatusVariant(product)}>
                    {getStatusLabel(product)}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t text-center">
                  <div>
                    <p className="text-sm font-medium">{product.inventory?.quantity || 0}</p>
                    <p className="text-xs text-muted-foreground">Estoque</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{product._count?.orderItems || 0}</p>
                    <p className="text-xs text-muted-foreground">Vendidos</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-500">
                      {product.salePrice > 0 ? (((product.salePrice - product.costPrice) / product.salePrice) * 100).toFixed(0) : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">Margem</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
