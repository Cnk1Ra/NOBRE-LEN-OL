'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Building,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  Plug,
  Mail,
  Smartphone,
  Moon,
  Sun,
  Check,
  ExternalLink,
  Key,
  Webhook,
  Package,
  Truck,
  AlertTriangle,
  CheckCircle,
  Volume2,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useNotifications, NotificationPreferences } from '@/contexts/notifications-context'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('profile')
  const { preferences, updatePreference } = useNotifications()

  // Handle URL parameter for tab selection
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['profile', 'company', 'notifications', 'appearance', 'integrations', 'security'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuracoes</h1>
        <p className="text-muted-foreground">
          Gerencie suas preferencias e configuracoes da conta
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="notifications">Notificacoes</TabsTrigger>
          <TabsTrigger value="appearance">Aparencia</TabsTrigger>
          <TabsTrigger value="integrations">Integracoes</TabsTrigger>
          <TabsTrigger value="security">Seguranca</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informacoes do Perfil
              </CardTitle>
              <CardDescription>
                Atualize suas informacoes pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                  AD
                </div>
                <div>
                  <Button variant="outline" size="sm">Alterar foto</Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Max 2MB</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input id="firstName" defaultValue="Admin" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Sobrenome</Label>
                  <Input id="lastName" defaultValue="DOD" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="admin@dashondelivery.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" defaultValue="+55 11 99999-9999" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Salvar alteracoes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Tab */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Dados da Empresa
              </CardTitle>
              <CardDescription>
                Informacoes da sua empresa para notas fiscais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da Empresa</Label>
                  <Input id="companyName" defaultValue="Dash On Delivery LTDA" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" defaultValue="12.345.678/0001-90" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Endereco</Label>
                  <Input id="address" defaultValue="Rua Example, 123 - Centro" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" defaultValue="Sao Paulo" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Select defaultValue="SP">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SP">Sao Paulo</SelectItem>
                      <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                      <SelectItem value="MG">Minas Gerais</SelectItem>
                      <SelectItem value="PR">Parana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Moeda Padrao</h4>
                <div className="grid gap-3 md:grid-cols-4">
                  {[
                    { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$' },
                    { code: 'EUR', name: 'Euro', symbol: '€' },
                    { code: 'USD', name: 'Dolar Americano', symbol: '$' },
                    { code: 'AOA', name: 'Kwanza Angolano', symbol: 'Kz' },
                  ].map((currency) => (
                    <Card
                      key={currency.code}
                      className={`cursor-pointer transition-colors ${currency.code === 'BRL' ? 'border-primary' : ''}`}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{currency.code}</p>
                          <p className="text-xs text-muted-foreground">{currency.name}</p>
                        </div>
                        <span className="text-lg font-bold">{currency.symbol}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Salvar alteracoes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="space-y-6">
            {/* Notification Channels */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Canais de Notificacao
                </CardTitle>
                <CardDescription>
                  Escolha como deseja receber notificacoes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">Receber notificacoes por email</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.email}
                    onCheckedChange={(checked) => updatePreference('email', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Push</p>
                      <p className="text-sm text-muted-foreground">Notificacoes no navegador</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.push}
                    onCheckedChange={(checked) => updatePreference('push', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                      <Volume2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Som</p>
                      <p className="text-sm text-muted-foreground">Tocar som ao receber notificacao</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.sound}
                    onCheckedChange={(checked) => updatePreference('sound', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Tipos de Notificacao
                </CardTitle>
                <CardDescription>
                  Ative ou desative tipos especificos de notificacoes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Pedidos</p>
                      <p className="text-sm text-muted-foreground">Novos pedidos e atualizacoes</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.order}
                    onCheckedChange={(checked) => updatePreference('order', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Entregas</p>
                      <p className="text-sm text-muted-foreground">Atualizacoes de entrega e rastreamento</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.delivery}
                    onCheckedChange={(checked) => updatePreference('delivery', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Estoque</p>
                      <p className="text-sm text-muted-foreground">Alertas de estoque baixo</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.stock}
                    onCheckedChange={(checked) => updatePreference('stock', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Sucesso</p>
                      <p className="text-sm text-muted-foreground">Metas atingidas e conquistas</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.success}
                    onCheckedChange={(checked) => updatePreference('success', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-500">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Alertas</p>
                      <p className="text-sm text-muted-foreground">Avisos e problemas importantes</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.warning}
                    onCheckedChange={(checked) => updatePreference('warning', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Sistema</p>
                      <p className="text-sm text-muted-foreground">Atualizacoes e novidades do sistema</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.system}
                    onCheckedChange={(checked) => updatePreference('system', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Aparencia
              </CardTitle>
              <CardDescription>
                Personalize a aparencia do dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Tema</h4>
                <div className="grid gap-3 md:grid-cols-3">
                  <Card
                    className={`cursor-pointer transition-colors ${theme === 'light' ? 'border-primary' : ''}`}
                    onClick={() => setTheme('light')}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <Sun className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Claro</p>
                        <p className="text-xs text-muted-foreground">Tema claro padrao</p>
                      </div>
                      {theme === 'light' && <Check className="h-4 w-4 text-primary ml-auto" />}
                    </CardContent>
                  </Card>
                  <Card
                    className={`cursor-pointer transition-colors ${theme === 'dark' ? 'border-primary' : ''}`}
                    onClick={() => setTheme('dark')}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <Moon className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Escuro</p>
                        <p className="text-xs text-muted-foreground">Tema escuro</p>
                      </div>
                      {theme === 'dark' && <Check className="h-4 w-4 text-primary ml-auto" />}
                    </CardContent>
                  </Card>
                  <Card
                    className={`cursor-pointer transition-colors ${theme === 'system' ? 'border-primary' : ''}`}
                    onClick={() => setTheme('system')}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <Globe className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Sistema</p>
                        <p className="text-xs text-muted-foreground">Seguir preferencia</p>
                      </div>
                      {theme === 'system' && <Check className="h-4 w-4 text-primary ml-auto" />}
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Idioma</h4>
                <Select defaultValue="pt-BR">
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Portugues (Brasil)</SelectItem>
                    <SelectItem value="pt-PT">Portugues (Portugal)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es">Espanol</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-5 w-5" />
                Integracoes
              </CardTitle>
              <CardDescription>
                Conecte seus servicos e plataformas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Shopify', desc: 'Sincronize pedidos e produtos', connected: true, icon: '🛒' },
                { name: 'Facebook Ads', desc: 'Importe dados de campanhas', connected: true, icon: '📘' },
                { name: 'Google Analytics', desc: 'Acompanhe metricas de trafego', connected: false, icon: '📊' },
                { name: 'Slack', desc: 'Receba notificacoes no Slack', connected: false, icon: '💬' },
                { name: 'Zapier', desc: 'Automatize workflows', connected: false, icon: '⚡' },
              ].map((integration) => (
                <div key={integration.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{integration.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{integration.name}</p>
                        {integration.connected && (
                          <Badge variant="success" className="text-xs">Conectado</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{integration.desc}</p>
                    </div>
                  </div>
                  <Button variant={integration.connected ? 'outline' : 'default'} size="sm">
                    {integration.connected ? 'Configurar' : 'Conectar'}
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              ))}

              <Separator className="my-6" />

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Webhook className="h-4 w-4" />
                  API & Webhooks
                </h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <div className="flex gap-2">
                      <Input type="password" value="sk_live_xxxxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                      <Button variant="outline">Copiar</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <div className="flex gap-2">
                      <Input value="https://api.dashondelivery.com/webhooks/..." readOnly className="font-mono text-sm" />
                      <Button variant="outline">Testar</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Seguranca
              </CardTitle>
              <CardDescription>
                Proteja sua conta com opcoes de seguranca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Alterar Senha</h4>
                <div className="grid gap-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button className="w-fit">Atualizar Senha</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Autenticacao de Dois Fatores</h4>
                    <p className="text-sm text-muted-foreground">
                      Adicione uma camada extra de seguranca
                    </p>
                  </div>
                  <Button variant="outline">
                    <Key className="mr-2 h-4 w-4" />
                    Configurar 2FA
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Sessoes Ativas</h4>
                <div className="space-y-3">
                  {[
                    { device: 'MacBook Pro - Chrome', location: 'Sao Paulo, BR', current: true, time: 'Agora' },
                    { device: 'iPhone 14 - Safari', location: 'Sao Paulo, BR', current: false, time: '2h atras' },
                  ].map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{session.device}</p>
                          {session.current && <Badge variant="success">Atual</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {session.location} • {session.time}
                        </p>
                      </div>
                      {!session.current && (
                        <Button variant="ghost" size="sm" className="text-destructive">
                          Encerrar
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
