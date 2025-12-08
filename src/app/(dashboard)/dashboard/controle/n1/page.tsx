'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Warehouse,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Download,
  Upload,
  Filter,
  ArrowUpDown,
  Link2,
  Unlink,
  Clock,
  Package,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data - pedidos do DOD
const dodOrders = [
  { id: 'DOD-001', customer: 'João Silva', total: 289.90, status: 'SHIPPED', date: '2024-12-07', trackingCode: 'BR123456789' },
  { id: 'DOD-002', customer: 'Maria Santos', total: 459.90, status: 'DELIVERED', date: '2024-12-06', trackingCode: 'BR987654321' },
  { id: 'DOD-003', customer: 'Pedro Costa', total: 189.90, status: 'PENDING', date: '2024-12-07', trackingCode: '' },
  { id: 'DOD-004', customer: 'Ana Oliveira', total: 599.90, status: 'SHIPPED', date: '2024-12-05', trackingCode: 'BR456789123' },
  { id: 'DOD-005', customer: 'Carlos Lima', total: 349.90, status: 'DELIVERED', date: '2024-12-04', trackingCode: 'BR321654987' },
  { id: 'DOD-006', customer: 'Lucia Ferreira', total: 279.90, status: 'SHIPPED', date: '2024-12-07', trackingCode: 'BR147258369' },
  { id: 'DOD-007', customer: 'Roberto Alves', total: 429.90, status: 'PENDING', date: '2024-12-07', trackingCode: '' },
  { id: 'DOD-008', customer: 'Fernanda Souza', total: 199.90, status: 'SHIPPED', date: '2024-12-06', trackingCode: 'BR963852741' },
  { id: 'DOD-009', customer: 'Marcos Pereira', total: 529.90, status: 'RETURNED', date: '2024-12-03', trackingCode: 'BR852741963' },
  { id: 'DOD-010', customer: 'Julia Mendes', total: 319.90, status: 'DELIVERED', date: '2024-12-05', trackingCode: 'BR741852963' },
]

// Mock data - pedidos encontrados na N1 Warehouse
const n1Orders = [
  { id: 'N1-001', dodId: 'DOD-001', status: 'EM_SEPARACAO', lastUpdate: '2024-12-07 14:30' },
  { id: 'N1-002', dodId: 'DOD-002', status: 'ENTREGUE', lastUpdate: '2024-12-06 18:45' },
  { id: 'N1-004', dodId: 'DOD-004', status: 'ENVIADO', lastUpdate: '2024-12-05 09:15' },
  { id: 'N1-005', dodId: 'DOD-005', status: 'ENTREGUE', lastUpdate: '2024-12-04 16:20' },
  { id: 'N1-006', dodId: 'DOD-006', status: 'EM_SEPARACAO', lastUpdate: '2024-12-07 11:00' },
  { id: 'N1-008', dodId: 'DOD-008', status: 'ENVIADO', lastUpdate: '2024-12-06 10:30' },
  { id: 'N1-010', dodId: 'DOD-010', status: 'ENTREGUE', lastUpdate: '2024-12-05 15:45' },
]

const n1StatusMap: Record<string, { label: string; color: string }> = {
  'PENDENTE': { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-500' },
  'EM_SEPARACAO': { label: 'Em Separação', color: 'bg-blue-500/10 text-blue-500' },
  'ENVIADO': { label: 'Enviado', color: 'bg-purple-500/10 text-purple-500' },
  'ENTREGUE': { label: 'Entregue', color: 'bg-green-500/10 text-green-500' },
  'DEVOLVIDO': { label: 'Devolvido', color: 'bg-red-500/10 text-red-500' },
}

const dodStatusMap: Record<string, { label: string; color: string }> = {
  'PENDING': { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-500' },
  'SHIPPED': { label: 'Enviado', color: 'bg-blue-500/10 text-blue-500' },
  'DELIVERED': { label: 'Entregue', color: 'bg-green-500/10 text-green-500' },
  'RETURNED': { label: 'Devolvido', color: 'bg-red-500/10 text-red-500' },
}

export default function N1ControlPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [lastSync, setLastSync] = useState('2024-12-07 15:30')

  // Compare orders - find matches and mismatches
  const comparisonData = useMemo(() => {
    const n1Map = new Map(n1Orders.map(o => [o.dodId, o]))

    return dodOrders.map(dod => {
      const n1 = n1Map.get(dod.id)
      return {
        ...dod,
        n1Order: n1 || null,
        syncStatus: n1 ? 'synced' : 'not_found',
      }
    })
  }, [])

  // Filter data
  const filteredData = useMemo(() => {
    let data = comparisonData

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      data = data.filter(o =>
        o.id.toLowerCase().includes(term) ||
        o.customer.toLowerCase().includes(term) ||
        o.trackingCode.toLowerCase().includes(term)
      )
    }

    if (filterStatus !== 'all') {
      if (filterStatus === 'synced') {
        data = data.filter(o => o.syncStatus === 'synced')
      } else if (filterStatus === 'not_found') {
        data = data.filter(o => o.syncStatus === 'not_found')
      }
    }

    return data
  }, [comparisonData, searchTerm, filterStatus])

  // Stats
  const stats = useMemo(() => {
    const synced = comparisonData.filter(o => o.syncStatus === 'synced').length
    const notFound = comparisonData.filter(o => o.syncStatus === 'not_found').length
    const total = comparisonData.length
    const syncRate = total > 0 ? (synced / total * 100).toFixed(1) : 0

    return { synced, notFound, total, syncRate }
  }, [comparisonData])

  const handleSync = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLastSync(new Date().toLocaleString('pt-BR'))
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Warehouse className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">N1 Warehouse</h1>
              <p className="text-sm text-muted-foreground">
                Comparação de pedidos DOD × N1 Warehouse
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <a href="https://n1warehouse.com/dashboard" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir N1
            </a>
          </Button>
          <Button
            size="sm"
            onClick={handleSync}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            {isLoading ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Pedidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Link2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.synced}</p>
                <p className="text-xs text-muted-foreground">Sincronizados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <Unlink className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.notFound}</p>
                <p className="text-xs text-muted-foreground">Não Encontrados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.syncRate}%</p>
                <p className="text-xs text-muted-foreground">Taxa de Sincronização</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Sync Info */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">Última sincronização:</span>
              <span className="font-medium">{lastSync}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Conectado
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID, cliente ou código de rastreio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os pedidos</SelectItem>
            <SelectItem value="synced">Sincronizados</SelectItem>
            <SelectItem value="not_found">Não encontrados</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="comparison" className="space-y-4">
        <TabsList>
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
          <TabsTrigger value="not_found">
            Não Encontrados
            {stats.notFound > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                {stats.notFound}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="divergences">Divergências</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparação de Pedidos</CardTitle>
              <CardDescription>
                Pedidos do DOD comparados com a N1 Warehouse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID DOD</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status DOD</TableHead>
                    <TableHead>Status N1</TableHead>
                    <TableHead>Sincronização</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>R$ {order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={dodStatusMap[order.status]?.color}>
                          {dodStatusMap[order.status]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {order.n1Order ? (
                          <Badge className={n1StatusMap[order.n1Order.status]?.color}>
                            {n1StatusMap[order.n1Order.status]?.label}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {order.syncStatus === 'synced' ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Sincronizado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                            <XCircle className="h-3 w-3 mr-1" />
                            Não encontrado
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="not_found" className="space-y-4">
          <Card className="border-red-500/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <CardTitle>Pedidos Não Encontrados na N1</CardTitle>
              </div>
              <CardDescription>
                Estes pedidos existem no DOD mas não foram encontrados na N1 Warehouse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID DOD</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status DOD</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData
                    .filter(o => o.syncStatus === 'not_found')
                    .map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>R$ {order.total.toFixed(2)}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <Badge className={dodStatusMap[order.status]?.color}>
                            {dodStatusMap[order.status]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Enviar para N1
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="divergences" className="space-y-4">
          <Card className="border-yellow-500/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <CardTitle>Divergências de Status</CardTitle>
              </div>
              <CardDescription>
                Pedidos com status diferente entre DOD e N1 Warehouse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma divergência encontrada</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Todos os pedidos sincronizados estão com status compatível entre as plataformas.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Integration Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Integração</CardTitle>
          <CardDescription>
            Configure a conexão com a N1 Warehouse
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">URL da API N1</label>
              <Input
                value="https://api.n1warehouse.com/v1"
                readOnly
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Token de Acesso</label>
              <Input
                value="••••••••••••••••"
                type="password"
                readOnly
                className="bg-muted/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline">
              Testar Conexão
            </Button>
            <Button variant="outline">
              Reconfigurar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
