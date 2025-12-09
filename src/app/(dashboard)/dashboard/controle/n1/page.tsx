'use client'

import { useState, useMemo, useEffect } from 'react'
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
  Clock,
  Package,
  TrendingUp,
  AlertCircle,
  Link2,
  Unlink,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useN1Warehouse, N1_STATUS_MAP } from '@/hooks/use-n1-warehouse'

// Country configuration
const countries: Record<string, { flag: string; name: string; currency: string; symbol: string }> = {
  BR: { flag: '🇧🇷', name: 'Brasil', currency: 'BRL', symbol: 'R$' },
  PT: { flag: '🇵🇹', name: 'Portugal', currency: 'EUR', symbol: '€' },
  ES: { flag: '🇪🇸', name: 'Espanha', currency: 'EUR', symbol: '€' },
  IT: { flag: '🇮🇹', name: 'Itália', currency: 'EUR', symbol: '€' },
  AO: { flag: '🇦🇴', name: 'Angola', currency: 'AOA', symbol: 'Kz' },
  MZ: { flag: '🇲🇿', name: 'Moçambique', currency: 'MZN', symbol: 'MT' },
}

// Mock DOD orders (in production, this would come from your DOD API/database)
const dodOrders = [
  { id: 'DOD-001', country: 'PT', customer: 'João Silva', total: 289.90, status: 'SHIPPED', date: '2024-12-07', trackingCode: 'PT123456789' },
  { id: 'DOD-002', country: 'ES', customer: 'María García', total: 459.90, status: 'DELIVERED', date: '2024-12-06', trackingCode: 'ES987654321' },
  { id: 'DOD-003', country: 'PT', customer: 'Pedro Costa', total: 189.90, status: 'PENDING', date: '2024-12-07', trackingCode: '' },
  { id: 'DOD-004', country: 'IT', customer: 'Marco Rossi', total: 599.90, status: 'SHIPPED', date: '2024-12-05', trackingCode: 'IT456789123' },
  { id: 'DOD-005', country: 'ES', customer: 'Carlos López', total: 349.90, status: 'DELIVERED', date: '2024-12-04', trackingCode: 'ES321654987' },
  { id: 'DOD-006', country: 'PT', customer: 'Lucia Ferreira', total: 279.90, status: 'SHIPPED', date: '2024-12-07', trackingCode: 'PT147258369' },
  { id: 'DOD-007', country: 'IT', customer: 'Giuseppe Bianchi', total: 429.90, status: 'PENDING', date: '2024-12-07', trackingCode: '' },
  { id: 'DOD-008', country: 'ES', customer: 'Ana Martínez', total: 199.90, status: 'SHIPPED', date: '2024-12-06', trackingCode: 'ES963852741' },
  { id: 'DOD-009', country: 'PT', customer: 'Marcos Pereira', total: 529.90, status: 'RETURNED', date: '2024-12-03', trackingCode: 'PT852741963' },
  { id: 'DOD-010', country: 'IT', customer: 'Francesca Romano', total: 319.90, status: 'DELIVERED', date: '2024-12-05', trackingCode: 'IT741852963' },
  { id: 'DOD-011', country: 'BR', customer: 'Roberto Santos', total: 389.90, status: 'SHIPPED', date: '2024-12-07', trackingCode: 'BR123789456' },
  { id: 'DOD-012', country: 'AO', customer: 'Manuel Silva', total: 259.90, status: 'PENDING', date: '2024-12-07', trackingCode: '' },
]

const dodStatusMap: Record<string, { label: string; color: string }> = {
  'PENDING': { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-500' },
  'SHIPPED': { label: 'Enviado', color: 'bg-blue-500/10 text-blue-500' },
  'DELIVERED': { label: 'Entregue', color: 'bg-green-500/10 text-green-500' },
  'RETURNED': { label: 'Devolvido', color: 'bg-red-500/10 text-red-500' },
}

export default function N1ControlPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCountry, setFilterCountry] = useState('all')

  // Use N1 Warehouse hook with auto-sync every 30 seconds
  const {
    orders: n1Orders,
    isLoading,
    isSyncing,
    syncStatus,
    syncOrders,
    fetchOrders,
  } = useN1Warehouse({
    autoSync: true,
    syncInterval: 30000,
    enableSSE: false, // Enable for real-time SSE updates
  })

  // Compare DOD orders with N1 orders
  const comparisonData = useMemo(() => {
    const n1Map = new Map(n1Orders.map(o => [o.externalRef, o]))

    return dodOrders.map(dod => {
      const n1 = n1Map.get(dod.id)
      return {
        ...dod,
        n1Order: n1 || null,
        syncStatus: n1 ? 'synced' : 'not_found',
        n1Status: n1?.status,
        n1StatusLabel: n1?.statusLabel || (n1?.status ? N1_STATUS_MAP[n1.status]?.label : null),
      }
    })
  }, [n1Orders])

  // Filter data
  const filteredData = useMemo(() => {
    let data = comparisonData

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      data = data.filter(o =>
        o.id.toLowerCase().includes(term) ||
        o.customer.toLowerCase().includes(term) ||
        o.trackingCode.toLowerCase().includes(term) ||
        countries[o.country]?.name.toLowerCase().includes(term)
      )
    }

    if (filterStatus !== 'all') {
      if (filterStatus === 'synced') {
        data = data.filter(o => o.syncStatus === 'synced')
      } else if (filterStatus === 'not_found') {
        data = data.filter(o => o.syncStatus === 'not_found')
      }
    }

    if (filterCountry !== 'all') {
      data = data.filter(o => o.country === filterCountry)
    }

    return data
  }, [comparisonData, searchTerm, filterStatus, filterCountry])

  // Stats
  const stats = useMemo(() => {
    const synced = comparisonData.filter(o => o.syncStatus === 'synced').length
    const notFound = comparisonData.filter(o => o.syncStatus === 'not_found').length
    const total = comparisonData.length
    const syncRate = total > 0 ? (synced / total * 100).toFixed(1) : 0

    // Country breakdown
    const byCountry = Object.keys(countries).reduce((acc, code) => {
      acc[code] = comparisonData.filter(o => o.country === code).length
      return acc
    }, {} as Record<string, number>)

    return { synced, notFound, total, syncRate, byCountry }
  }, [comparisonData])

  // Get unique countries from orders
  const activeCountries = useMemo(() => {
    const uniqueCountries = Array.from(new Set(comparisonData.map(o => o.country)))
    return uniqueCountries.map(code => ({ code, ...countries[code] }))
  }, [comparisonData])

  const handleSync = async () => {
    await syncOrders()
  }

  // Format last sync time
  const formatLastSync = (dateStr: string | null) => {
    if (!dateStr) return 'Nunca sincronizado'
    const date = new Date(dateStr)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
                Comparação de pedidos DOD × N1 Warehouse (Tempo Real)
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={cn(
              syncStatus.connected
                ? "bg-green-500/10 text-green-500 border-green-500/20"
                : "bg-red-500/10 text-red-500 border-red-500/20"
            )}
          >
            {syncStatus.connected ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                {syncStatus.mode === 'demo' ? 'Demo' : 'Conectado'}
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Desconectado
              </>
            )}
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <a href="https://n1warehouse.com/dashboard" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir N1
            </a>
          </Button>
          <Button
            size="sm"
            onClick={handleSync}
            disabled={isSyncing || isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", (isSyncing || isLoading) && "animate-spin")} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
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
      <Card className={cn(
        "border-blue-500/20",
        syncStatus.connected ? "bg-blue-500/5" : "bg-yellow-500/5 border-yellow-500/20"
      )}>
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Clock className={cn("h-4 w-4", syncStatus.connected ? "text-blue-500" : "text-yellow-500")} />
              <span className="text-muted-foreground">Última sincronização:</span>
              <span className="font-medium">{formatLastSync(syncStatus.lastSyncAt)}</span>
              {syncStatus.mode === 'demo' && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  Modo Demo
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn(
                syncStatus.connected
                  ? "bg-green-500/10 text-green-500 border-green-500/20"
                  : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
              )}>
                {syncStatus.connected ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {syncStatus.message}
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {syncStatus.message}
                  </>
                )}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Country Stats */}
      <div className="flex flex-wrap gap-2">
        {activeCountries.map(country => (
          <Badge
            key={country.code}
            variant="outline"
            className={cn(
              "cursor-pointer transition-colors",
              filterCountry === country.code
                ? "bg-primary/10 border-primary"
                : "hover:bg-muted"
            )}
            onClick={() => setFilterCountry(filterCountry === country.code ? 'all' : country.code)}
          >
            <span className="mr-1">{country.flag}</span>
            {country.name}
            <span className="ml-1.5 text-muted-foreground">
              ({stats.byCountry[country.code] || 0})
            </span>
          </Badge>
        ))}
        {filterCountry !== 'all' && (
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setFilterCountry('all')}>
            Limpar filtro
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID, cliente, país ou rastreio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCountry} onValueChange={setFilterCountry}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="País" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os países</SelectItem>
            {activeCountries.map(country => (
              <SelectItem key={country.code} value={country.code}>
                <span className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  {country.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
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
                {isLoading && <span className="ml-2 text-blue-500">(Carregando...)</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>País</TableHead>
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
                  {filteredData.map((order) => {
                    const country = countries[order.country]
                    const n1StatusInfo = order.n1Status ? N1_STATUS_MAP[order.n1Status] : null
                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          <span className="text-lg" title={country?.name}>{country?.flag}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">{order.id}</span>
                        </TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{country?.symbol} {order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={dodStatusMap[order.status]?.color}>
                            {dodStatusMap[order.status]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {n1StatusInfo ? (
                            <Badge className={n1StatusInfo.color}>
                              {order.n1StatusLabel || n1StatusInfo.label}
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
                    )
                  })}
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
                    <TableHead>País</TableHead>
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
                    .map((order) => {
                      const country = countries[order.country]
                      return (
                        <TableRow key={order.id}>
                          <TableCell>
                            <span className="text-lg" title={country?.name}>{country?.flag}</span>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{order.id}</TableCell>
                          <TableCell>{order.customer}</TableCell>
                          <TableCell>{country?.symbol} {order.total.toFixed(2)}</TableCell>
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
                      )
                    })}
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
                value={process.env.NEXT_PUBLIC_N1_API_URL || "https://api.n1warehouse.com/v1"}
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
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Badge variant={syncStatus.connected ? "default" : "secondary"}>
                {syncStatus.mode === 'demo' ? 'Modo Demo' : 'Produção'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {syncStatus.mode === 'demo'
                  ? 'Configure as variáveis de ambiente para produção'
                  : 'Conectado à API de produção'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => fetchOrders()}>
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
