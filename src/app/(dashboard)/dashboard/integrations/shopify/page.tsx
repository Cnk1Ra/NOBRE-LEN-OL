'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Store,
  Check,
  X,
  RefreshCw,
  Settings,
  Link2,
  Unlink,
  Package,
  ShoppingCart,
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/utils'

// Mock data
const shopifyStore = {
  connected: true,
  storeDomain: 'minha-loja.myshopify.com',
  storeName: 'Minha Loja',
  lastSyncAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  stats: {
    products: 24,
    orders: 427,
    customers: 312,
  },
  syncSettings: {
    autoSyncOrders: true,
    autoSyncProducts: true,
    autoSyncInventory: true,
    syncInterval: 15, // minutes
  },
}

const syncHistory = [
  {
    id: '1',
    type: 'orders',
    status: 'success',
    message: '15 novos pedidos sincronizados',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: '2',
    type: 'inventory',
    status: 'success',
    message: 'Estoque atualizado para 24 produtos',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '3',
    type: 'products',
    status: 'success',
    message: '2 novos produtos importados',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: '4',
    type: 'orders',
    status: 'error',
    message: 'Falha ao sincronizar - Erro de conexão',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
]

export default function ShopifyIntegrationPage() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [storeDomain, setStoreDomain] = useState('')

  const handleConnect = async () => {
    setIsConnecting(true)
    // Simulação de conexão
    setTimeout(() => {
      setIsConnecting(false)
    }, 2000)
  }

  const handleSync = async () => {
    setIsSyncing(true)
    // Simulação de sincronização
    setTimeout(() => {
      setIsSyncing(false)
    }, 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integração Shopify</h1>
          <p className="text-muted-foreground">
            Conecte sua loja Shopify para sincronizar pedidos e produtos
          </p>
        </div>
        {shopifyStore.connected && (
          <Button onClick={handleSync} disabled={isSyncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
          </Button>
        )}
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#96bf48] text-white">
                <Store className="h-7 w-7" />
              </div>
              <div>
                <CardTitle>Shopify</CardTitle>
                <CardDescription>
                  {shopifyStore.connected
                    ? `Conectado a ${shopifyStore.storeDomain}`
                    : 'Conecte sua loja Shopify'}
                </CardDescription>
              </div>
            </div>
            <Badge variant={shopifyStore.connected ? 'success' : 'secondary'}>
              {shopifyStore.connected ? (
                <>
                  <Check className="mr-1 h-3 w-3" />
                  Conectado
                </>
              ) : (
                <>
                  <X className="mr-1 h-3 w-3" />
                  Desconectado
                </>
              )}
            </Badge>
          </div>
        </CardHeader>

        {shopifyStore.connected ? (
          <>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <Package className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{shopifyStore.stats.products}</p>
                    <p className="text-sm text-muted-foreground">Produtos</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <ShoppingCart className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{shopifyStore.stats.orders}</p>
                    <p className="text-sm text-muted-foreground">Pedidos</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <Users className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{shopifyStore.stats.customers}</p>
                    <p className="text-sm text-muted-foreground">Clientes</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Última sincronização: {formatDate(shopifyStore.lastSyncAt)}</span>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-between">
              <Button variant="outline" asChild>
                <a
                  href={`https://${shopifyStore.storeDomain}/admin`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir Admin Shopify
                </a>
              </Button>
              <Button variant="destructive" size="sm">
                <Unlink className="mr-2 h-4 w-4" />
                Desconectar
              </Button>
            </CardFooter>
          </>
        ) : (
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeDomain">Domínio da Loja</Label>
                <div className="flex gap-2">
                  <Input
                    id="storeDomain"
                    placeholder="sua-loja.myshopify.com"
                    value={storeDomain}
                    onChange={(e) => setStoreDomain(e.target.value)}
                  />
                  <Button onClick={handleConnect} disabled={isConnecting || !storeDomain}>
                    {isConnecting ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Link2 className="mr-2 h-4 w-4" />
                    )}
                    {isConnecting ? 'Conectando...' : 'Conectar'}
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-muted/50">
                <h4 className="font-medium mb-2">Como conectar:</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Digite o domínio da sua loja Shopify</li>
                  <li>Clique em "Conectar"</li>
                  <li>Autorize o acesso no painel do Shopify</li>
                  <li>Pronto! Seus dados serão sincronizados automaticamente</li>
                </ol>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Sync Settings */}
      {shopifyStore.connected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações de Sincronização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sincronizar Pedidos Automaticamente</Label>
                <p className="text-sm text-muted-foreground">
                  Novos pedidos serão importados automaticamente
                </p>
              </div>
              <Switch defaultChecked={shopifyStore.syncSettings.autoSyncOrders} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sincronizar Produtos</Label>
                <p className="text-sm text-muted-foreground">
                  Manter produtos sincronizados com o Shopify
                </p>
              </div>
              <Switch defaultChecked={shopifyStore.syncSettings.autoSyncProducts} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sincronizar Estoque</Label>
                <p className="text-sm text-muted-foreground">
                  Atualizar níveis de estoque automaticamente
                </p>
              </div>
              <Switch defaultChecked={shopifyStore.syncSettings.autoSyncInventory} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Intervalo de Sincronização</Label>
                <p className="text-sm text-muted-foreground">
                  Frequência de verificação de novos dados
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  defaultValue={shopifyStore.syncSettings.syncInterval}
                  className="w-20"
                  min="5"
                  max="60"
                />
                <span className="text-sm text-muted-foreground">minutos</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button>Salvar Configurações</Button>
          </CardFooter>
        </Card>
      )}

      {/* Sync History */}
      {shopifyStore.connected && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Sincronização</CardTitle>
            <CardDescription>
              Últimas sincronizações realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {syncHistory.map((sync) => (
                <div
                  key={sync.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    {sync.status === 'success' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{sync.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(sync.timestamp)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={sync.status === 'success' ? 'success' : 'destructive'}
                  >
                    {sync.type === 'orders'
                      ? 'Pedidos'
                      : sync.type === 'products'
                      ? 'Produtos'
                      : 'Estoque'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Webhooks */}
      {shopifyStore.connected && (
        <Card>
          <CardHeader>
            <CardTitle>Webhooks Configurados</CardTitle>
            <CardDescription>
              Eventos que disparam atualizações automáticas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { name: 'orders/create', description: 'Novo pedido criado', active: true },
                { name: 'orders/updated', description: 'Pedido atualizado', active: true },
                { name: 'orders/fulfilled', description: 'Pedido enviado', active: true },
                { name: 'products/create', description: 'Novo produto', active: true },
                { name: 'inventory_levels/update', description: 'Estoque atualizado', active: true },
                { name: 'refunds/create', description: 'Reembolso criado', active: false },
              ].map((webhook) => (
                <div
                  key={webhook.name}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-mono text-sm">{webhook.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {webhook.description}
                    </p>
                  </div>
                  <Badge variant={webhook.active ? 'success' : 'secondary'}>
                    {webhook.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
