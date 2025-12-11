'use client'

import { useState, useEffect, Suspense } from 'react'
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
  Loader2,
  Copy,
  CheckCheck,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useNotifications } from '@/contexts/notifications-context'
import { useCountry } from '@/contexts/country-context'
import { toast } from '@/hooks/use-toast'

function SettingsContent() {
  const { theme, setTheme } = useTheme()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('profile')
  const { preferences, updatePreference } = useNotifications()
  const { defaultCurrency, setDefaultCurrency } = useCountry()

  // Profile state
  const [profile, setProfile] = useState({
    firstName: 'Admin',
    lastName: 'DOD',
    email: 'admin@dashondelivery.com',
    phone: '+55 11 99999-9999',
  })
  const [savedProfile, setSavedProfile] = useState({
    firstName: 'Admin',
    lastName: 'DOD',
    email: 'admin@dashondelivery.com',
    phone: '+55 11 99999-9999',
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const hasProfileChanges = JSON.stringify(profile) !== JSON.stringify(savedProfile)

  // Company state
  const [company, setCompany] = useState({
    name: 'Dash On Delivery LTDA',
    cnpj: '12.345.678/0001-90',
    address: 'Rua Example, 123 - Centro',
    city: 'Sao Paulo',
    state: 'SP',
    currency: 'BRL',
  })
  const [savedCompany, setSavedCompany] = useState({
    name: 'Dash On Delivery LTDA',
    cnpj: '12.345.678/0001-90',
    address: 'Rua Example, 123 - Centro',
    city: 'Sao Paulo',
    state: 'SP',
    currency: 'BRL',
  })
  const [savingCompany, setSavingCompany] = useState(false)
  const hasCompanyChanges = JSON.stringify(company) !== JSON.stringify(savedCompany)

  // Appearance state
  const [language, setLanguage] = useState('pt-BR')
  const [savingAppearance, setSavingAppearance] = useState(false)

  // Security state
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  })
  const [savingPassword, setSavingPassword] = useState(false)

  // Integrations state
  const [integrations, setIntegrations] = useState([
    { name: 'Shopify', desc: 'Sincronize pedidos e produtos', connected: true, icon: '🛒' },
    { name: 'Facebook Ads', desc: 'Importe dados de campanhas', connected: true, icon: '📘' },
    { name: 'Google Analytics', desc: 'Acompanhe metricas de trafego', connected: false, icon: '📊' },
    { name: 'Slack', desc: 'Receba notificacoes no Slack', connected: false, icon: '💬' },
    { name: 'Zapier', desc: 'Automatize workflows', connected: false, icon: '⚡' },
  ])
  const [apiKeyCopied, setApiKeyCopied] = useState(false)
  const [webhookCopied, setWebhookCopied] = useState(false)

  // Sessions state
  const [sessions, setSessions] = useState([
    { device: 'MacBook Pro - Chrome', location: 'Sao Paulo, BR', current: true, time: 'Agora' },
    { device: 'iPhone 14 - Safari', location: 'Sao Paulo, BR', current: false, time: '2h atras' },
  ])

  // Save handlers
  const handleSaveProfile = async () => {
    setSavingProfile(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    setSavedProfile({ ...profile })
    setSavingProfile(false)
    toast({
      title: 'Perfil atualizado!',
      description: 'Suas informacoes foram salvas com sucesso.',
      className: 'bg-green-500 text-white border-green-600',
    })
  }

  const handleSaveCompany = async () => {
    setSavingCompany(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setSavedCompany({ ...company })
    setSavingCompany(false)
    toast({
      title: 'Dados da empresa atualizados!',
      description: 'As informacoes da empresa foram salvas com sucesso.',
      className: 'bg-green-500 text-white border-green-600',
    })
  }

  const handleSaveAppearance = async () => {
    setSavingAppearance(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setSavingAppearance(false)
    toast({
      title: 'Preferencias salvas!',
      description: 'Suas preferencias de aparencia foram atualizadas.',
      className: 'bg-green-500 text-white border-green-600',
    })
  }

  const handleUpdatePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: 'Erro!',
        description: 'As senhas nao coincidem.',
        variant: 'destructive',
      })
      return
    }
    if (passwords.new.length < 6) {
      toast({
        title: 'Erro!',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      })
      return
    }
    setSavingPassword(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setSavingPassword(false)
    setPasswords({ current: '', new: '', confirm: '' })
    toast({
      title: 'Senha atualizada!',
      description: 'Sua senha foi alterada com sucesso.',
      className: 'bg-green-500 text-white border-green-600',
    })
  }

  const handleToggleIntegration = (index: number) => {
    const updated = [...integrations]
    updated[index].connected = !updated[index].connected
    setIntegrations(updated)
    toast({
      title: updated[index].connected ? 'Integracao conectada!' : 'Integracao desconectada!',
      description: `${updated[index].name} foi ${updated[index].connected ? 'conectado' : 'desconectado'} com sucesso.`,
      className: 'bg-green-500 text-white border-green-600',
    })
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText('sk_live_xxxxxxxxxxxxxxxxxx')
    setApiKeyCopied(true)
    setTimeout(() => setApiKeyCopied(false), 2000)
    toast({
      title: 'API Key copiada!',
      description: 'A chave foi copiada para a area de transferencia.',
      className: 'bg-green-500 text-white border-green-600',
    })
  }

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText('https://api.dashondelivery.com/webhooks/...')
    setWebhookCopied(true)
    setTimeout(() => setWebhookCopied(false), 2000)
    toast({
      title: 'Webhook URL copiada!',
      description: 'A URL foi copiada para a area de transferencia.',
      className: 'bg-green-500 text-white border-green-600',
    })
  }

  const handleTestWebhook = async () => {
    toast({
      title: 'Testando webhook...',
      description: 'Enviando requisicao de teste.',
      className: 'bg-blue-500 text-white border-blue-600',
    })
    await new Promise(resolve => setTimeout(resolve, 1500))
    toast({
      title: 'Webhook funcionando!',
      description: 'A requisicao de teste foi recebida com sucesso.',
      className: 'bg-green-500 text-white border-green-600',
    })
  }

  const handleEndSession = (index: number) => {
    const updated = sessions.filter((_, i) => i !== index)
    setSessions(updated)
    toast({
      title: 'Sessao encerrada!',
      description: 'O dispositivo foi desconectado com sucesso.',
      className: 'bg-green-500 text-white border-green-600',
    })
  }

  const handleSetupTwoFactor = () => {
    toast({
      title: '2FA em configuracao',
      description: 'Funcionalidade de autenticacao de dois fatores sera implementada.',
      className: 'bg-blue-500 text-white border-blue-600',
    })
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    toast({
      title: 'Tema alterado!',
      description: `Tema ${newTheme === 'light' ? 'claro' : newTheme === 'dark' ? 'escuro' : 'do sistema'} ativado.`,
      className: 'bg-green-500 text-white border-green-600',
    })
  }

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    toast({
      title: 'Idioma alterado!',
      description: 'O idioma foi atualizado com sucesso.',
      className: 'bg-green-500 text-white border-green-600',
    })
  }

  const currencyOptions = [
    { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'USD', name: 'Dolar Americano', symbol: '$' },
    { code: 'AOA', name: 'Kwanza Angolano', symbol: 'Kz' },
  ]

  const handleCurrencyChange = (currencyCode: string) => {
    const currency = currencyOptions.find(c => c.code === currencyCode)
    if (currency) {
      setDefaultCurrency(currency)
      setCompany(prev => ({ ...prev, currency: currencyCode }))
      toast({
        title: 'Moeda padrao alterada!',
        description: `Todo o dashboard agora usa ${currency.name} (${currency.symbol}).`,
        className: 'bg-green-500 text-white border-green-600',
      })
    }
  }

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
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary transition-all">
                  {profile.firstName.charAt(0).toUpperCase()}{profile.lastName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <Button variant="outline" size="sm">Alterar foto</Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Max 2MB</p>
                  <p className="text-sm font-medium mt-2">{profile.firstName} {profile.lastName}</p>
                  <p className="text-xs text-muted-foreground">{profile.email}</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Sobrenome</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                {hasProfileChanges && (
                  <p className="text-sm text-amber-600 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Alteracoes nao salvas
                  </p>
                )}
                {!hasProfileChanges && (
                  <p className="text-sm text-green-600 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Tudo salvo
                  </p>
                )}
                <Button onClick={handleSaveProfile} disabled={savingProfile || !hasProfileChanges}>
                  {savingProfile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar alteracoes'
                  )}
                </Button>
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
                  <Input
                    id="companyName"
                    value={company.name}
                    onChange={(e) => setCompany(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={company.cnpj}
                    onChange={(e) => setCompany(prev => ({ ...prev, cnpj: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Endereco</Label>
                  <Input
                    id="address"
                    value={company.address}
                    onChange={(e) => setCompany(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={company.city}
                    onChange={(e) => setCompany(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Select
                    value={company.state}
                    onValueChange={(value) => setCompany(prev => ({ ...prev, state: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SP">Sao Paulo</SelectItem>
                      <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                      <SelectItem value="MG">Minas Gerais</SelectItem>
                      <SelectItem value="PR">Parana</SelectItem>
                      <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                      <SelectItem value="SC">Santa Catarina</SelectItem>
                      <SelectItem value="BA">Bahia</SelectItem>
                      <SelectItem value="PE">Pernambuco</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Moeda Padrao do Dashboard</h4>
                <p className="text-sm text-muted-foreground">Selecione a moeda que sera usada em todo o dashboard</p>
                <div className="grid gap-3 md:grid-cols-4">
                  {currencyOptions.map((currencyOption) => (
                    <Card
                      key={currencyOption.code}
                      className={`cursor-pointer transition-colors hover:border-primary/50 ${defaultCurrency.code === currencyOption.code ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => handleCurrencyChange(currencyOption.code)}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{currencyOption.code}</p>
                          <p className="text-xs text-muted-foreground">{currencyOption.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">{currencyOption.symbol}</span>
                          {defaultCurrency.code === currencyOption.code && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                {hasCompanyChanges && (
                  <p className="text-sm text-amber-600 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Alteracoes nao salvas
                  </p>
                )}
                {!hasCompanyChanges && (
                  <p className="text-sm text-green-600 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Tudo salvo
                  </p>
                )}
                <Button onClick={handleSaveCompany} disabled={savingCompany || !hasCompanyChanges}>
                  {savingCompany ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar alteracoes'
                  )}
                </Button>
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
                    className={`cursor-pointer transition-colors hover:border-primary/50 ${theme === 'light' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => handleThemeChange('light')}
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
                    className={`cursor-pointer transition-colors hover:border-primary/50 ${theme === 'dark' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => handleThemeChange('dark')}
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
                    className={`cursor-pointer transition-colors hover:border-primary/50 ${theme === 'system' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => handleThemeChange('system')}
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
                <Select value={language} onValueChange={handleLanguageChange}>
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
              {integrations.map((integration, index) => (
                <div key={integration.name} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
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
                  <Button
                    variant={integration.connected ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => handleToggleIntegration(index)}
                  >
                    {integration.connected ? 'Desconectar' : 'Conectar'}
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
                      <Button variant="outline" onClick={handleCopyApiKey}>
                        {apiKeyCopied ? (
                          <>
                            <CheckCheck className="mr-2 h-4 w-4 text-green-500" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <div className="flex gap-2">
                      <Input value="https://api.dashondelivery.com/webhooks/..." readOnly className="font-mono text-sm" />
                      <Button variant="outline" onClick={handleCopyWebhook}>
                        {webhookCopied ? (
                          <>
                            <CheckCheck className="mr-2 h-4 w-4 text-green-500" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={handleTestWebhook}>
                        Testar
                      </Button>
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
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwords.current}
                      onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwords.new}
                      onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                    />
                  </div>
                  <Button
                    className="w-fit"
                    onClick={handleUpdatePassword}
                    disabled={savingPassword || !passwords.current || !passwords.new || !passwords.confirm}
                  >
                    {savingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Atualizando...
                      </>
                    ) : (
                      'Atualizar Senha'
                    )}
                  </Button>
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
                  <Button variant="outline" onClick={handleSetupTwoFactor}>
                    <Key className="mr-2 h-4 w-4" />
                    Configurar 2FA
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Sessoes Ativas</h4>
                <div className="space-y-3">
                  {sessions.map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleEndSession(i)}
                        >
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

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  )
}
