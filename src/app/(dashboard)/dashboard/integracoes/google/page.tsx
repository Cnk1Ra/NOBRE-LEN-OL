'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Search, Link2, Unlink, RefreshCw, AlertCircle, Plus, Trash2, Eye, EyeOff, TrendingUp, DollarSign, Target, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AdConnection {
  id: string
  platform: string
  name: string
  email: string | null
  businessId: string | null
  businessName: string | null
  status: string
  lastSyncAt: string | null
  errorMessage: string | null
  totalSpend: number
  totalSpendToday: number
  selectedAccounts: number
  adAccounts: AdAccount[]
}

interface AdAccount {
  id: string
  accountId: string
  accountName: string
  currency: string
  timezone: string
  status: string
  isSelected: boolean
  spendToday: number
  spendTotal: number
}

const WORKSPACE_ID = 'default-workspace'

export default function GoogleIntegrationPage() {
  const { toast } = useToast()
  const [connections, setConnections] = useState<AdConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showAddConnection, setShowAddConnection] = useState(false)
  const [showToken, setShowToken] = useState(false)

  const [newConnection, setNewConnection] = useState({
    name: '', email: '', accessToken: '', businessId: '', businessName: '',
    adAccounts: [] as { accountId: string; accountName: string; currency: string }[],
  })
  const [newAdAccount, setNewAdAccount] = useState({ accountId: '', accountName: '', currency: 'BRL' })

  const fetchConnections = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/integrations/connections?workspaceId=${WORKSPACE_ID}&platform=GOOGLE`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao buscar conexões')
      setConnections(data.connections || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchConnections() }, [fetchConnections])

  const handleAddConnection = async () => {
    if (!newConnection.name || !newConnection.accessToken) {
      toast({ title: 'Erro', description: 'Nome e Access Token são obrigatórios', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/integrations/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: WORKSPACE_ID, platform: 'GOOGLE', ...newConnection }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao criar conexão')
      toast({ title: 'Sucesso!', description: 'Conexão Google criada com sucesso' })
      setShowAddConnection(false)
      setNewConnection({ name: '', email: '', accessToken: '', businessId: '', businessName: '', adAccounts: [] })
      fetchConnections()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteConnection = async (id: string) => {
    if (!confirm('Tem certeza que deseja desconectar esta conta?')) return
    try {
      const res = await fetch(`/api/integrations/connections?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao desconectar')
      toast({ title: 'Desconectado', description: 'Conta Google desconectada' })
      fetchConnections()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleToggleAdAccount = async (connectionId: string, adAccount: AdAccount) => {
    try {
      await fetch('/api/integrations/connections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: connectionId, adAccounts: [{ id: adAccount.id, isSelected: !adAccount.isSelected }] }),
      })
      fetchConnections()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const formatCurrency = (value: number, currency: string = 'BRL') => new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value)
  const formatDate = (d: string | null) => {
    if (!d) return 'Nunca'
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
    if (diff < 60) return `${diff}min atrás`
    if (diff < 1440) return `${Math.floor(diff / 60)}h atrás`
    return `${Math.floor(diff / 1440)}d atrás`
  }

  const getStatusBadge = (status: string) => {
    if (status === 'ACTIVE') return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
    if (status === 'EXPIRED') return <Badge className="bg-yellow-100 text-yellow-800">Expirado</Badge>
    if (status === 'ERROR') return <Badge variant="destructive">Erro</Badge>
    return <Badge variant="outline">{status}</Badge>
  }

  const totalSpend = connections.reduce((s, c) => s + c.totalSpend, 0)
  const totalSpendToday = connections.reduce((s, c) => s + c.totalSpendToday, 0)
  const totalAccounts = connections.reduce((s, c) => s + c.adAccounts.length, 0)
  const activeAccounts = connections.reduce((s, c) => s + c.selectedAccounts, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg"><Search className="h-6 w-6 text-red-600" /></div>
          <div>
            <h1 className="text-2xl font-bold">Google Ads</h1>
            <p className="text-muted-foreground">Gerencie suas conexões com Google Ads e Analytics</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchConnections}><RefreshCw className="h-4 w-4 mr-2" />Atualizar</Button>
          <Dialog open={showAddConnection} onOpenChange={setShowAddConnection}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Conectar Conta</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Conectar Conta Google</DialogTitle>
                <DialogDescription>Adicione uma conta do Google Ads para sincronizar dados</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Nome *</Label><Input placeholder="Ex: Google Ads Principal" value={newConnection.name} onChange={(e) => setNewConnection({ ...newConnection, name: e.target.value })} /></div>
                  <div><Label>Email</Label><Input placeholder="email@exemplo.com" value={newConnection.email} onChange={(e) => setNewConnection({ ...newConnection, email: e.target.value })} /></div>
                </div>
                <div>
                  <Label>Access Token / API Key *</Label>
                  <div className="flex gap-2">
                    <Input type={showToken ? 'text' : 'password'} placeholder="Token de acesso" value={newConnection.accessToken} onChange={(e) => setNewConnection({ ...newConnection, accessToken: e.target.value })} />
                    <Button variant="outline" size="icon" onClick={() => setShowToken(!showToken)}>{showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Customer ID</Label><Input placeholder="123-456-7890" value={newConnection.businessId} onChange={(e) => setNewConnection({ ...newConnection, businessId: e.target.value })} /></div>
                  <div><Label>Nome da Conta</Label><Input placeholder="Minha Empresa" value={newConnection.businessName} onChange={(e) => setNewConnection({ ...newConnection, businessName: e.target.value })} /></div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddConnection(false)}>Cancelar</Button>
                <Button onClick={handleAddConnection} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Conectar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Conexões</p><p className="text-2xl font-bold">{connections.length}</p></div><Link2 className="h-8 w-8 text-red-500" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Contas Ativas</p><p className="text-2xl font-bold">{activeAccounts} / {totalAccounts}</p></div><Target className="h-8 w-8 text-green-500" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Gasto Hoje</p><p className="text-2xl font-bold">{formatCurrency(totalSpendToday)}</p></div><DollarSign className="h-8 w-8 text-yellow-500" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Gasto Total</p><p className="text-2xl font-bold">{formatCurrency(totalSpend)}</p></div><TrendingUp className="h-8 w-8 text-purple-500" /></div></CardContent></Card>
      </div>

      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

      {loading ? (
        <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : connections.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <Search className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma conta conectada</h3>
          <p className="text-muted-foreground mb-4">Conecte sua conta do Google Ads</p>
          <Button onClick={() => setShowAddConnection(true)}><Plus className="h-4 w-4 mr-2" />Conectar</Button>
        </CardContent></Card>
      ) : (
        <div className="space-y-4">
          {connections.map((conn) => (
            <Card key={conn.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg"><Search className="h-5 w-5 text-red-600" /></div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">{conn.name} {getStatusBadge(conn.status)}</CardTitle>
                      <CardDescription>{conn.email || 'Sem email'} | ID: {conn.businessId || 'N/A'} | Sync: {formatDate(conn.lastSyncAt)}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={fetchConnections}><RefreshCw className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" onClick={() => handleDeleteConnection(conn.id)}><Unlink className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </div>
              </CardHeader>
              {conn.errorMessage && <CardContent className="pt-0"><Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{conn.errorMessage}</AlertDescription></Alert></CardContent>}
              {conn.adAccounts.length > 0 && (
                <CardContent>
                  <h4 className="font-medium mb-3">Contas de Anúncios</h4>
                  <div className="space-y-2">
                    {conn.adAccounts.map((acc) => (
                      <div key={acc.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <Switch checked={acc.isSelected} onCheckedChange={() => handleToggleAdAccount(conn.id, acc)} />
                          <div><p className="font-medium">{acc.accountName}</p><p className="text-sm text-muted-foreground">{acc.accountId} | {acc.currency}</p></div>
                        </div>
                        <div className="text-right"><p className="font-medium">{formatCurrency(acc.spendTotal, acc.currency)}</p><p className="text-sm text-muted-foreground">Hoje: {formatCurrency(acc.spendToday, acc.currency)}</p></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">Como Conectar</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><h4 className="font-medium">1. Obtenha as credenciais</h4><p className="text-sm text-muted-foreground">Acesse <a href="https://console.cloud.google.com" target="_blank" className="text-blue-600 hover:underline">Google Cloud Console</a> e configure a API do Google Ads</p></div>
          <div><h4 className="font-medium">2. Encontre seu Customer ID</h4><p className="text-sm text-muted-foreground">O Customer ID está no canto superior direito do Google Ads (formato: 123-456-7890)</p></div>
        </CardContent>
      </Card>
    </div>
  )
}
