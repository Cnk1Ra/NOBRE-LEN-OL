'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Facebook,
  Link2,
  Unlink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Settings,
  Activity,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Zap,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ConnectedAccount {
  id: string
  name: string
  email: string
  business_manager_id: string
  business_manager_name: string
  ad_accounts: AdAccount[]
  pixels: Pixel[]
  connected_at: string
  status: 'active' | 'expired' | 'error'
  last_sync: string
}

interface AdAccount {
  id: string
  name: string
  currency: string
  timezone: string
  status: 'active' | 'disabled'
  spend_cap?: number
  amount_spent: number
  selected: boolean
}

interface Pixel {
  id: string
  name: string
  last_fired: string
  events_today: number
  selected: boolean
}

// Mock connected accounts
const mockAccounts: ConnectedAccount[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@example.com',
    business_manager_id: '123456789',
    business_manager_name: 'Empresa ABC',
    ad_accounts: [
      {
        id: 'act_111111111',
        name: 'Conta Principal - BR',
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        status: 'active',
        spend_cap: 50000,
        amount_spent: 12500,
        selected: true,
      },
      {
        id: 'act_222222222',
        name: 'Conta COD - MA',
        currency: 'MAD',
        timezone: 'Africa/Casablanca',
        status: 'active',
        amount_spent: 8500,
        selected: true,
      },
    ],
    pixels: [
      {
        id: 'px_111111111',
        name: 'Pixel Principal',
        last_fired: '2 min atrás',
        events_today: 1250,
        selected: true,
      },
      {
        id: 'px_222222222',
        name: 'Pixel Landing Page',
        last_fired: '5 min atrás',
        events_today: 890,
        selected: true,
      },
    ],
    connected_at: '2024-01-15',
    status: 'active',
    last_sync: '2 min atrás',
  },
]

export default function MetaIntegrationPage() {
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<ConnectedAccount[]>(mockAccounts)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showTokenDialog, setShowTokenDialog] = useState(false)
  const [accessToken, setAccessToken] = useState('')
  const [showToken, setShowToken] = useState(false)

  const handleConnectFacebook = () => {
    setIsConnecting(true)
    // Simulate OAuth flow
    setTimeout(() => {
      setIsConnecting(false)
      toast({
        title: 'Conta conectada!',
        description: 'Sua conta do Facebook foi conectada com sucesso.',
      })
    }, 2000)
  }

  const handleDisconnect = (accountId: string) => {
    setAccounts(accounts.filter(a => a.id !== accountId))
    toast({
      title: 'Conta desconectada',
      description: 'A conta foi removida das integrações.',
    })
  }

  const handleRefresh = (accountId: string) => {
    toast({
      title: 'Sincronizando...',
      description: 'Atualizando dados da conta do Meta.',
    })
  }

  const toggleAdAccount = (accountId: string, adAccountId: string) => {
    setAccounts(accounts.map(acc => {
      if (acc.id === accountId) {
        return {
          ...acc,
          ad_accounts: acc.ad_accounts.map(aa =>
            aa.id === adAccountId ? { ...aa, selected: !aa.selected } : aa
          )
        }
      }
      return acc
    }))
  }

  const togglePixel = (accountId: string, pixelId: string) => {
    setAccounts(accounts.map(acc => {
      if (acc.id === accountId) {
        return {
          ...acc,
          pixels: acc.pixels.map(px =>
            px.id === pixelId ? { ...px, selected: !px.selected } : px
          )
        }
      }
      return acc
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copiado!',
      description: 'ID copiado para a área de transferência.',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#1877F2]/10">
              <Facebook className="h-6 w-6 text-[#1877F2]" />
            </div>
            Integração Meta Ads
          </h1>
          <p className="text-muted-foreground mt-1">
            Conecte suas contas do Facebook/Instagram para importar dados de campanhas
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Conectar Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Conectar conta do Meta</DialogTitle>
              <DialogDescription>
                Escolha como deseja conectar sua conta
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Button
                className="w-full gap-2 h-12 bg-[#1877F2] hover:bg-[#1877F2]/90"
                onClick={handleConnectFacebook}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Facebook className="h-5 w-5" />
                )}
                {isConnecting ? 'Conectando...' : 'Conectar com Facebook'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full gap-2 h-12"
                onClick={() => setShowTokenDialog(true)}
              >
                <Settings className="h-4 w-4" />
                Usar Access Token Manual
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#1877F2]/10 to-transparent border-[#1877F2]/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#1877F2]/20">
                <Users className="h-5 w-5 text-[#1877F2]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contas Conectadas</p>
                <p className="text-2xl font-bold">{accounts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/20">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ad Accounts Ativos</p>
                <p className="text-2xl font-bold">
                  {accounts.reduce((acc, a) => acc + a.ad_accounts.filter(aa => aa.selected).length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <Activity className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pixels Ativos</p>
                <p className="text-2xl font-bold">
                  {accounts.reduce((acc, a) => acc + a.pixels.filter(px => px.selected).length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-500/20">
                <Zap className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Eventos Hoje</p>
                <p className="text-2xl font-bold">
                  {accounts.reduce((acc, a) => acc + a.pixels.reduce((sum, px) => sum + px.events_today, 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connected Accounts */}
      {accounts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Facebook className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhuma conta conectada</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Conecte sua conta do Meta para começar a importar dados de campanhas e otimizar seu tracking
            </p>
            <Button className="gap-2 bg-[#1877F2] hover:bg-[#1877F2]/90">
              <Facebook className="h-4 w-4" />
              Conectar primeira conta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#1877F2] to-[#E1306C] flex items-center justify-center text-white font-bold text-lg">
                      {account.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {account.name}
                        {account.status === 'active' && (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Ativo
                          </Badge>
                        )}
                        {account.status === 'expired' && (
                          <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Token Expirado
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {account.email} • BM: {account.business_manager_name}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleRefresh(account.id)}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDisconnect(account.id)}
                    >
                      <Unlink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="ad_accounts">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="ad_accounts">Ad Accounts</TabsTrigger>
                    <TabsTrigger value="pixels">Pixels</TabsTrigger>
                    <TabsTrigger value="settings">Configurações</TabsTrigger>
                  </TabsList>

                  <TabsContent value="ad_accounts" className="space-y-3">
                    {account.ad_accounts.map((adAccount) => (
                      <div
                        key={adAccount.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Switch
                            checked={adAccount.selected}
                            onCheckedChange={() => toggleAdAccount(account.id, adAccount.id)}
                          />
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              {adAccount.name}
                              {adAccount.status === 'active' && (
                                <span className="h-2 w-2 rounded-full bg-green-500" />
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <span>{adAccount.id}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => copyToClipboard(adAccount.id)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {adAccount.currency} {adAccount.amount_spent.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Gasto total
                          </p>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="pixels" className="space-y-3">
                    {account.pixels.map((pixel) => (
                      <div
                        key={pixel.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Switch
                            checked={pixel.selected}
                            onCheckedChange={() => togglePixel(account.id, pixel.id)}
                          />
                          <div>
                            <p className="font-medium">{pixel.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <span>{pixel.id}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => copyToClipboard(pixel.id)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-500 flex items-center gap-1">
                            <Activity className="h-4 w-4" />
                            {pixel.events_today.toLocaleString()} eventos
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Último: {pixel.last_fired}
                          </p>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4">
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <p className="font-medium">Sincronização automática</p>
                          <p className="text-sm text-muted-foreground">
                            Atualizar dados a cada 15 minutos
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <p className="font-medium">Importar custos históricos</p>
                          <p className="text-sm text-muted-foreground">
                            Sincronizar dados dos últimos 30 dias
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <p className="font-medium">CAPI (Conversions API)</p>
                          <p className="text-sm text-muted-foreground">
                            Enviar eventos server-side para melhor tracking
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="p-4 rounded-lg border">
                        <p className="font-medium mb-2">Token de Acesso</p>
                        <div className="flex gap-2">
                          <Input
                            type={showToken ? 'text' : 'password'}
                            value="EAAGo4BAp...XYZ"
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Button variant="outline" size="icon" onClick={() => setShowToken(!showToken)}>
                            {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="outline" size="icon">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Conectado em {account.connected_at} • Última sync: {account.last_sync}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Manual Token Dialog */}
      <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Access Token Manual</DialogTitle>
            <DialogDescription>
              Cole seu token de acesso do Facebook para configuração avançada
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Access Token</Label>
              <Input
                type="password"
                placeholder="EAAGo4BAp..."
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Obtenha seu token em{' '}
                <a
                  href="https://developers.facebook.com/tools/explorer/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Graph API Explorer
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
            <Button className="w-full" onClick={() => setShowTokenDialog(false)}>
              Salvar Token
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Documentation */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Documentação e Recursos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="#"
              className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
            >
              <h4 className="font-medium group-hover:text-primary transition-colors">
                Guia de Configuração
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Como conectar sua conta e configurar o tracking
              </p>
            </a>
            <a
              href="#"
              className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
            >
              <h4 className="font-medium group-hover:text-primary transition-colors">
                Conversions API (CAPI)
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Configurar eventos server-side para COD
              </p>
            </a>
            <a
              href="#"
              className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
            >
              <h4 className="font-medium group-hover:text-primary transition-colors">
                Troubleshooting
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Resolver problemas comuns de integração
              </p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
