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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Search,
  Link2,
  Unlink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Plus,
  Copy,
  ExternalLink,
  Settings,
  Activity,
  Users,
  Target,
  Zap,
  BarChart3,
  TrendingUp,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ConnectedAccount {
  id: string
  name: string
  email: string
  customer_id: string
  accounts: GoogleAdAccount[]
  conversion_actions: ConversionAction[]
  connected_at: string
  status: 'active' | 'expired' | 'error'
  last_sync: string
}

interface GoogleAdAccount {
  id: string
  name: string
  currency: string
  timezone: string
  status: 'enabled' | 'suspended' | 'cancelled'
  amount_spent: number
  selected: boolean
}

interface ConversionAction {
  id: string
  name: string
  type: 'purchase' | 'lead' | 'pageview' | 'custom'
  status: 'enabled' | 'disabled'
  conversions_30d: number
  selected: boolean
}

const mockAccounts: ConnectedAccount[] = [
  {
    id: '1',
    name: 'Marketing Team',
    email: 'marketing@example.com',
    customer_id: '123-456-7890',
    accounts: [
      {
        id: '1234567890',
        name: 'COD Brasil - Search',
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        status: 'enabled',
        amount_spent: 25000,
        selected: true,
      },
      {
        id: '0987654321',
        name: 'COD Marrocos - Display',
        currency: 'MAD',
        timezone: 'Africa/Casablanca',
        status: 'enabled',
        amount_spent: 15000,
        selected: true,
      },
    ],
    conversion_actions: [
      {
        id: 'conv_1',
        name: 'Purchase',
        type: 'purchase',
        status: 'enabled',
        conversions_30d: 450,
        selected: true,
      },
      {
        id: 'conv_2',
        name: 'Lead Form Submit',
        type: 'lead',
        status: 'enabled',
        conversions_30d: 1250,
        selected: true,
      },
      {
        id: 'conv_3',
        name: 'Add to Cart',
        type: 'custom',
        status: 'enabled',
        conversions_30d: 890,
        selected: false,
      },
    ],
    connected_at: '2024-02-01',
    status: 'active',
    last_sync: '5 min atrás',
  },
]

export default function GoogleIntegrationPage() {
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<ConnectedAccount[]>(mockAccounts)
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnectGoogle = () => {
    setIsConnecting(true)
    setTimeout(() => {
      setIsConnecting(false)
      toast({
        title: 'Conta conectada!',
        description: 'Sua conta do Google Ads foi conectada com sucesso.',
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
      description: 'Atualizando dados do Google Ads.',
    })
  }

  const toggleAdAccount = (accountId: string, adAccountId: string) => {
    setAccounts(accounts.map(acc => {
      if (acc.id === accountId) {
        return {
          ...acc,
          accounts: acc.accounts.map(aa =>
            aa.id === adAccountId ? { ...aa, selected: !aa.selected } : aa
          )
        }
      }
      return acc
    }))
  }

  const toggleConversion = (accountId: string, conversionId: string) => {
    setAccounts(accounts.map(acc => {
      if (acc.id === accountId) {
        return {
          ...acc,
          conversion_actions: acc.conversion_actions.map(ca =>
            ca.id === conversionId ? { ...ca, selected: !ca.selected } : ca
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

  const getConversionTypeBadge = (type: string) => {
    const styles = {
      purchase: 'bg-green-500/10 text-green-500 border-green-500/20',
      lead: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      pageview: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      custom: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    }
    return styles[type as keyof typeof styles] || styles.custom
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#4285F4]/10 via-[#EA4335]/10 to-[#FBBC05]/10">
              <Search className="h-6 w-6 text-[#EA4335]" />
            </div>
            Integração Google Ads
          </h1>
          <p className="text-muted-foreground mt-1">
            Conecte suas contas do Google Ads para importar dados de campanhas
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
              <DialogTitle>Conectar conta do Google</DialogTitle>
              <DialogDescription>
                Autorize o acesso à sua conta Google Ads
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Button
                className="w-full gap-2 h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
                onClick={handleConnectGoogle}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                {isConnecting ? 'Conectando...' : 'Continuar com Google'}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Você será redirecionado para autenticação do Google
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#4285F4]/10 to-transparent border-[#4285F4]/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#4285F4]/20">
                <Users className="h-5 w-5 text-[#4285F4]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contas Conectadas</p>
                <p className="text-2xl font-bold">{accounts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#34A853]/10 to-transparent border-[#34A853]/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#34A853]/20">
                <Target className="h-5 w-5 text-[#34A853]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ad Accounts Ativos</p>
                <p className="text-2xl font-bold">
                  {accounts.reduce((acc, a) => acc + a.accounts.filter(aa => aa.selected).length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#FBBC05]/10 to-transparent border-[#FBBC05]/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#FBBC05]/20">
                <Activity className="h-5 w-5 text-[#FBBC05]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversões Ativas</p>
                <p className="text-2xl font-bold">
                  {accounts.reduce((acc, a) => acc + a.conversion_actions.filter(ca => ca.selected).length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#EA4335]/10 to-transparent border-[#EA4335]/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#EA4335]/20">
                <TrendingUp className="h-5 w-5 text-[#EA4335]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversões (30d)</p>
                <p className="text-2xl font-bold">
                  {accounts.reduce((acc, a) => acc + a.conversion_actions.reduce((sum, ca) => sum + ca.conversions_30d, 0), 0).toLocaleString()}
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
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhuma conta conectada</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Conecte sua conta do Google Ads para importar dados de campanhas e otimizar seu tracking
            </p>
            <Button className="gap-2">
              <Search className="h-4 w-4" />
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
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#4285F4] via-[#EA4335] to-[#FBBC05] flex items-center justify-center text-white font-bold text-lg">
                      G
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
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {account.email} • Customer ID: {account.customer_id}
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
                <Tabs defaultValue="accounts">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="accounts">Contas de Anúncio</TabsTrigger>
                    <TabsTrigger value="conversions">Conversões</TabsTrigger>
                    <TabsTrigger value="settings">Configurações</TabsTrigger>
                  </TabsList>

                  <TabsContent value="accounts" className="space-y-3">
                    {account.accounts.map((adAccount) => (
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
                              {adAccount.status === 'enabled' && (
                                <span className="h-2 w-2 rounded-full bg-green-500" />
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <span>ID: {adAccount.id}</span>
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

                  <TabsContent value="conversions" className="space-y-3">
                    {account.conversion_actions.map((conversion) => (
                      <div
                        key={conversion.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Switch
                            checked={conversion.selected}
                            onCheckedChange={() => toggleConversion(account.id, conversion.id)}
                          />
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              {conversion.name}
                              <Badge variant="outline" className={getConversionTypeBadge(conversion.type)}>
                                {conversion.type}
                              </Badge>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ID: {conversion.id}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-500 flex items-center gap-1">
                            <BarChart3 className="h-4 w-4" />
                            {conversion.conversions_30d.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Últimos 30 dias
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
                          <p className="font-medium">Enhanced Conversions</p>
                          <p className="text-sm text-muted-foreground">
                            Usar dados first-party para melhor atribuição
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <p className="font-medium">Offline Conversions</p>
                          <p className="text-sm text-muted-foreground">
                            Enviar eventos de entrega COD como conversões
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
                Como conectar sua conta Google Ads
              </p>
            </a>
            <a
              href="#"
              className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
            >
              <h4 className="font-medium group-hover:text-primary transition-colors">
                Enhanced Conversions
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Configurar atribuição avançada para COD
              </p>
            </a>
            <a
              href="#"
              className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
            >
              <h4 className="font-medium group-hover:text-primary transition-colors">
                Offline Conversions
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Enviar eventos de entrega para Google
              </p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
