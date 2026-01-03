'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  Facebook,
  Link2,
  Unlink,
  RefreshCw,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  TrendingUp,
  DollarSign,
  Target,
  Loader2,
} from 'lucide-react'
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
  createdAt: string
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

export default function MetaIntegrationPage() {
  const { toast } = useToast()

  const [connections, setConnections] = useState<AdConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showAddConnection, setShowAddConnection] = useState(false)
  const [showToken, setShowToken] = useState(false)

  const [newConnection, setNewConnection] = useState({
    name: '',
    email: '',
    accessToken: '',
    businessId: '',
    businessName: '',
    adAccounts: [] as { accountId: string; accountName: string; currency: string }[],
  })

  const [newAdAccount, setNewAdAccount] = useState({
    accountId: '',
    accountName: '',
    currency: 'BRL',
  })

  const fetchConnections = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/integrations/connections?workspaceId=${WORKSPACE_ID}&platform=META`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao buscar conexões')
      setConnections(data.connections || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConnections()
  }, [fetchConnections])

  const handleAddAdAccountToForm = () => {
    if (!newAdAccount.accountId || !newAdAccount.accountName) {
      toast({ title: 'Erro', description: 'Preencha ID e nome da conta', variant: 'destructive' })
      return
    }
    setNewConnection({
      ...newConnection,
      adAccounts: [...newConnection.adAccounts, { ...newAdAccount }],
    })
    setNewAdAccount({ accountId: '', accountName: '', currency: 'BRL' })
  }

  const handleRemoveAdAccountFromForm = (index: number) => {
    setNewConnection({
      ...newConnection,
      adAccounts: newConnection.adAccounts.filter((_, i) => i !== index),
    })
  }

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
        body: JSON.stringify({
          workspaceId: WORKSPACE_ID,
          platform: 'META',
          name: newConnection.name,
          email: newConnection.email || null,
          accessToken: newConnection.accessToken,
          businessId: newConnection.businessId || null,
          businessName: newConnection.businessName || null,
          adAccounts: newConnection.adAccounts,
        }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Erro ao criar conexão')

      toast({ title: 'Sucesso!', description: 'Conexão Meta criada com sucesso' })
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
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Erro ao desconectar')

      toast({ title: 'Desconectado', description: 'Conta Meta desconectada com sucesso' })
      fetchConnections()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleToggleAdAccount = async (connectionId: string, adAccount: AdAccount) => {
    try {
      const res = await fetch('/api/integrations/connections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: connectionId,
          adAccounts: [{ id: adAccount.id, isSelected: !adAccount.isSelected }],
        }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Erro ao atualizar')

      fetchConnections()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      case 'EXPIRED':
        return <Badge className="bg-yellow-100 text-yellow-800">Token Expirado</Badge>
      case 'ERROR':
        return <Badge variant="destructive">Erro</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (value: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    if (diffMins < 60) return `${diffMins}min atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    return `${Math.floor(diffHours / 24)}d atrás`
  }

  const totalSpend = connections.reduce((sum, c) => sum + c.totalSpend, 0)
  const totalSpendToday = connections.reduce((sum, c) => sum + c.totalSpendToday, 0)
  const totalAccounts = connections.reduce((sum, c) => sum + c.adAccounts.length, 0)
  const activeAccounts = connections.reduce((sum, c) => sum + c.selectedAccounts, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Facebook className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Meta Ads</h1>
            <p className="text-muted-foreground">Gerencie suas conexões com Facebook e Instagram Ads</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchConnections}>
            <RefreshCw className="h-4 w-4 mr-2" />Atualizar
          </Button>
          <Dialog open={showAddConnection} onOpenChange={setShowAddConnection}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Conectar Conta</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Conectar Conta Meta</DialogTitle>
                <DialogDescription>Adicione uma conta do Meta Business para sincronizar dados</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome da Conexão *</Label>
                    <Input placeholder="Ex: Conta Principal" value={newConnection.name} onChange={(e) => setNewConnection({ ...newConnection, name: e.target.value })} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input placeholder="email@exemplo.com" value={newConnection.email} onChange={(e) => setNewConnection({ ...newConnection, email: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Access Token *</Label>
                  <div className="flex gap-2">
                    <Input type={showToken ? 'text' : 'password'} placeholder="Token de acesso do Meta Business" value={newConnection.accessToken} onChange={(e) => setNewConnection({ ...newConnection, accessToken: e.target.value })} />
                    <Button variant="outline" size="icon" onClick={() => setShowToken(!showToken)}>
                      {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Obtenha em: developers.facebook.com/tools/explorer</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Business Manager ID</Label>
                    <Input placeholder="123456789" value={newConnection.businessId} onChange={(e) => setNewConnection({ ...newConnection, businessId: e.target.value })} />
                  </div>
                  <div>
                    <Label>Nome do Business</Label>
                    <Input placeholder="Minha Empresa" value={newConnection.businessName} onChange={(e) => setNewConnection({ ...newConnection, businessName: e.target.value })} />
                  </div>
                </div>
                <div className="border rounded-lg p-4 space-y-3">
                  <Label>Contas de Anúncios</Label>
                  {newConnection.adAccounts.length > 0 && (
                    <div className="space-y-2">
                      {newConnection.adAccounts.map((acc, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                          <span className="text-sm">{acc.accountName} ({acc.accountId}) - {acc.currency}</span>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveAdAccountFromForm(index)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="ID (act_123...)" value={newAdAccount.accountId} onChange={(e) => setNewAdAccount({ ...newAdAccount, accountId: e.target.value })} />
                    <Input placeholder="Nome da conta" value={newAdAccount.accountName} onChange={(e) => setNewAdAccount({ ...newAdAccount, accountName: e.target.value })} />
                    <div className="flex gap-2">
                      <Input placeholder="BRL" value={newAdAccount.currency} onChange={(e) => setNewAdAccount({ ...newAdAccount, currency: e.target.value })} className="w-20" />
                      <Button variant="outline" onClick={handleAddAdAccountToForm}><Plus className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddConnection(false)}>Cancelar</Button>
                <Button onClick={handleAddConnection} disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Conectar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conexões</p>
                <p className="text-2xl font-bold">{connections.length}</p>
              </div>
              <Link2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contas Ativas</p>
                <p className="text-2xl font-bold">{activeAccounts} / {totalAccounts}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gasto Hoje</p>
                <p className="text-2xl font-bold">{formatCurrency(totalSpendToday)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gasto Total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalSpend)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar conexões</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Conexões */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : connections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Facebook className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma conta conectada</h3>
            <p className="text-muted-foreground mb-4">Conecte sua conta do Meta Business para sincronizar dados</p>
            <Button onClick={() => setShowAddConnection(true)}><Plus className="h-4 w-4 mr-2" />Conectar Conta Meta</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {connections.map((connection) => (
            <Card key={connection.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Facebook className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {connection.name}
                        {getStatusBadge(connection.status)}
                      </CardTitle>
                      <CardDescription>
                        {connection.email || 'Sem email'} | Business: {connection.businessName || connection.businessId || 'N/A'} | Sync: {formatDate(connection.lastSyncAt)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={fetchConnections}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDeleteConnection(connection.id)}>
                      <Unlink className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {connection.errorMessage && (
                <CardContent className="pt-0">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{connection.errorMessage}</AlertDescription>
                  </Alert>
                </CardContent>
              )}

              {connection.adAccounts.length > 0 && (
                <CardContent>
                  <h4 className="font-medium mb-3">Contas de Anúncios</h4>
                  <div className="space-y-2">
                    {connection.adAccounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <Switch checked={account.isSelected} onCheckedChange={() => handleToggleAdAccount(connection.id, account)} />
                          <div>
                            <p className="font-medium">{account.accountName}</p>
                            <p className="text-sm text-muted-foreground">{account.accountId} | {account.currency}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(account.spendTotal, account.currency)}</p>
                          <p className="text-sm text-muted-foreground">Hoje: {formatCurrency(account.spendToday, account.currency)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Documentação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Como Conectar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Obtenha o Access Token</h4>
            <p className="text-sm text-muted-foreground">
              Acesse o <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Graph API Explorer</a> e gere um token com permissões: <code className="bg-muted px-1 rounded">ads_read</code>, <code className="bg-muted px-1 rounded">ads_management</code>
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">2. Encontre seu Business Manager ID</h4>
            <p className="text-sm text-muted-foreground">
              Acesse <a href="https://business.facebook.com/settings" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Business Settings</a> e copie o ID
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
