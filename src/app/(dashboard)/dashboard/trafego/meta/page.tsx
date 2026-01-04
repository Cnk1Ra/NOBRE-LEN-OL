'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  MoreHorizontal,
  TrendingUp,
  DollarSign,
  Target,
  Eye,
  ShoppingCart,
  BarChart3,
  Pause,
  Play,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Facebook,
  ExternalLink,
  Zap,
  Copy,
  Check,
  Code,
  Link2,
  Link2Off,
  Settings,
  User,
  Building2,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Info,
  Webhook,
} from 'lucide-react'
import { useCountry } from '@/contexts/country-context'
import { useMeta } from '@/contexts/meta-context'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

// Types
interface MetaProfile {
  id: string
  name: string
  email: string
  accessToken: string
  tokenExpiry: Date
  isConnected: boolean
  adAccounts: AdAccount[]
  pixels: Pixel[]
  createdAt: Date
}

interface AdAccount {
  id: string
  accountId: string
  name: string
  status: 'active' | 'disabled'
  currency: string
  isEnabled: boolean
  spent: number
  dailyBudget: number
}

interface Pixel {
  id: string
  pixelId: string
  name: string
  isActive: boolean
  lastActivity?: Date
  eventsReceived: number
}

interface Campaign {
  id: string
  name: string
  status: 'active' | 'paused' | 'ended'
  objective: string
  budget: number
  budgetType: 'daily' | 'lifetime'
  spent: number
  revenue: number
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  cpc: number
  cpm: number
  cpa: number
  roas: number
  profit: number
  startDate: string
}

// Meta profiles and campaigns - starts empty, will be populated when Meta is connected
const mockProfiles: MetaProfile[] = []

const mockCampaigns: Campaign[] = []

export default function MetaAdsPage() {
  const { formatCurrency } = useCountry()
  const { isConnected: metaConnected, refreshData, isLoading } = useMeta()

  // State
  const [activeTab, setActiveTab] = useState<'campaigns' | 'accounts' | 'integration'>('campaigns')
  const [profiles, setProfiles] = useState<MetaProfile[]>(mockProfiles)
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Dialog states
  const [showAddProfile, setShowAddProfile] = useState(false)
  const [showPixelScript, setShowPixelScript] = useState(false)
  const [selectedPixel, setSelectedPixel] = useState<Pixel | null>(null)
  const [newProfileToken, setNewProfileToken] = useState('')
  const [newProfileName, setNewProfileName] = useState('')
  const [copiedScript, setCopiedScript] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteProfileId, setDeleteProfileId] = useState<string | null>(null)

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('meta-profiles')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setProfiles(parsed.map((p: MetaProfile) => ({
          ...p,
          tokenExpiry: new Date(p.tokenExpiry),
          createdAt: new Date(p.createdAt),
        })))
      } catch {
        // Use mock data
      }
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (profiles.length > 0) {
      localStorage.setItem('meta-profiles', JSON.stringify(profiles))
    }
  }, [profiles])

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate totals
  const totals = campaigns.reduce((acc, c) => ({
    spent: acc.spent + c.spent,
    revenue: acc.revenue + c.revenue,
    profit: acc.profit + c.profit,
    conversions: acc.conversions + c.conversions,
  }), { spent: 0, revenue: 0, profit: 0, conversions: 0 })

  const avgRoas = totals.spent > 0 ? totals.revenue / totals.spent : 0

  // Toggle campaign status
  const toggleCampaignStatus = (campaignId: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        const newStatus = c.status === 'active' ? 'paused' : 'active'
        toast({
          title: newStatus === 'active' ? 'Campanha Ativada' : 'Campanha Pausada',
          description: `"${c.name}" foi ${newStatus === 'active' ? 'ativada' : 'pausada'}.`,
          className: newStatus === 'active' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white',
        })
        return { ...c, status: newStatus }
      }
      return c
    }))
  }

  // Toggle ad account
  const toggleAdAccount = (profileId: string, accountId: string) => {
    setProfiles(prev => prev.map(profile => {
      if (profile.id === profileId) {
        return {
          ...profile,
          adAccounts: profile.adAccounts.map(acc => {
            if (acc.id === accountId) {
              const newEnabled = !acc.isEnabled
              toast({
                title: newEnabled ? 'Conta Ativada' : 'Conta Desativada',
                description: `"${acc.name}" foi ${newEnabled ? 'ativada' : 'desativada'}.`,
                className: newEnabled ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white',
              })
              return { ...acc, isEnabled: newEnabled }
            }
            return acc
          })
        }
      }
      return profile
    }))
  }

  // Add new profile
  const handleAddProfile = () => {
    if (!newProfileToken.trim() || !newProfileName.trim()) {
      toast({
        title: 'Campos obrigatorios',
        description: 'Preencha o nome e o Access Token.',
        variant: 'destructive',
      })
      return
    }

    const newProfile: MetaProfile = {
      id: `profile-${Date.now()}`,
      name: newProfileName.trim(),
      email: 'novo@perfil.com',
      accessToken: newProfileToken.trim(),
      tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      isConnected: true,
      adAccounts: [],
      pixels: [],
      createdAt: new Date(),
    }

    setProfiles(prev => [...prev, newProfile])
    setNewProfileToken('')
    setNewProfileName('')
    setShowAddProfile(false)

    toast({
      title: 'Perfil Adicionado',
      description: `"${newProfile.name}" foi conectado com sucesso.`,
      className: 'bg-green-500 text-white',
    })
  }

  // Delete profile
  const handleDeleteProfile = () => {
    if (!deleteProfileId) return

    const profile = profiles.find(p => p.id === deleteProfileId)
    setProfiles(prev => prev.filter(p => p.id !== deleteProfileId))
    setShowDeleteConfirm(false)
    setDeleteProfileId(null)

    toast({
      title: 'Perfil Removido',
      description: `"${profile?.name}" foi desconectado.`,
      className: 'bg-red-500 text-white',
    })
  }

  // Generate Pixel script
  const generatePixelScript = (pixel: Pixel) => {
    return `<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixel.pixelId}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${pixel.pixelId}&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->

<!-- Eventos para Shopify - Adicione no theme.liquid -->
<script>
// ViewContent - Pagina de produto
{% if template contains 'product' %}
fbq('track', 'ViewContent', {
  content_ids: ['{{ product.id }}'],
  content_type: 'product',
  content_name: '{{ product.title }}',
  value: {{ product.price | money_without_currency | remove: ',' }},
  currency: '{{ shop.currency }}'
});
{% endif %}

// AddToCart
document.addEventListener('click', function(e) {
  if (e.target.matches('[data-add-to-cart], .add-to-cart, #AddToCart')) {
    fbq('track', 'AddToCart', {
      content_type: 'product',
      currency: '{{ shop.currency }}'
    });
  }
});

// InitiateCheckout
{% if template contains 'cart' %}
fbq('track', 'InitiateCheckout');
{% endif %}

// Purchase - Adicione na pagina de confirmacao
{% if first_time_accessed %}
fbq('track', 'Purchase', {
  content_ids: [{% for item in order.line_items %}'{{ item.product_id }}'{% unless forloop.last %},{% endunless %}{% endfor %}],
  content_type: 'product',
  value: {{ order.total_price | money_without_currency | remove: ',' }},
  currency: '{{ shop.currency }}'
});
{% endif %}
</script>`
  }

  // Copy script
  const copyScript = (pixel: Pixel) => {
    navigator.clipboard.writeText(generatePixelScript(pixel))
    setCopiedScript(true)
    setTimeout(() => setCopiedScript(false), 2000)
    toast({
      title: 'Script Copiado!',
      description: 'Cole no theme.liquid da sua loja Shopify.',
      className: 'bg-green-500 text-white',
    })
  }

  // Get all ad accounts from all profiles
  const allAdAccounts = profiles.flatMap(p =>
    p.adAccounts.map(acc => ({ ...acc, profileName: p.name, profileId: p.id }))
  )

  const enabledAccounts = allAdAccounts.filter(a => a.isEnabled)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1877F2]/10">
            <Facebook className="h-8 w-8 text-[#1877F2]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meta Ads</h1>
            <p className="text-muted-foreground">
              {profiles.length} perfil(s) conectado(s) • {enabledAccounts.length} conta(s) ativa(s)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refreshData()} disabled={isLoading} className="gap-2">
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Sincronizar
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => window.open('https://business.facebook.com', '_blank')}>
            <ExternalLink className="h-4 w-4" />
            Meta Business
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Investido</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(totals.spent)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Receita</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totals.revenue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Lucro</p>
                <p className={cn("text-xl font-bold", totals.profit >= 0 ? "text-green-600" : "text-red-600")}>
                  {formatCurrency(totals.profit)}
                </p>
              </div>
              <Zap className="h-8 w-8 text-emerald-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">ROAS Medio</p>
                <p className={cn("text-xl font-bold", avgRoas >= 3 ? "text-green-600" : avgRoas >= 2 ? "text-yellow-600" : "text-red-600")}>
                  {avgRoas.toFixed(2)}x
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Conversoes</p>
                <p className="text-xl font-bold">{totals.conversions}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="campaigns" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Campanhas
          </TabsTrigger>
          <TabsTrigger value="accounts" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Contas de Anuncio
          </TabsTrigger>
          <TabsTrigger value="integration" className="gap-2">
            <Code className="h-4 w-4" />
            Integracao
          </TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar campanha..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="paused">Pausadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredCampaigns.length} campanha(s)
            </div>
          </div>

          {/* Campaigns Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Status</TableHead>
                    <TableHead>Campanha</TableHead>
                    <TableHead className="text-right">Gasto</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                    <TableHead className="text-right">Lucro</TableHead>
                    <TableHead className="text-right">ROAS</TableHead>
                    <TableHead className="text-right">Conv.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map(campaign => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <Switch
                          checked={campaign.status === 'active'}
                          onCheckedChange={() => toggleCampaignStatus(campaign.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-xs text-muted-foreground">{campaign.objective}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-red-600">
                        {formatCurrency(campaign.spent)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(campaign.revenue)}
                      </TableCell>
                      <TableCell className={cn("text-right font-bold", campaign.profit >= 0 ? "text-green-600" : "text-red-600")}>
                        {formatCurrency(campaign.profit)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={cn("text-white", campaign.roas >= 3 ? "bg-green-500" : campaign.roas >= 2 ? "bg-yellow-500" : "bg-red-500")}>
                          {campaign.roas.toFixed(1)}x
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{campaign.conversions}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4">
          {/* Profiles */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Perfis Conectados</h3>
            <Button onClick={() => setShowAddProfile(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Perfil
            </Button>
          </div>

          {profiles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <User className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum perfil conectado</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Adicione um perfil Meta para gerenciar suas contas de anuncio.
                </p>
                <Button onClick={() => setShowAddProfile(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Perfil
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {profiles.map(profile => (
                <Card key={profile.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2]/10">
                          <User className="h-5 w-5 text-[#1877F2]" />
                        </div>
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {profile.name}
                            {profile.isConnected ? (
                              <Badge className="bg-green-500 text-white">Conectado</Badge>
                            ) : (
                              <Badge variant="destructive">Desconectado</Badge>
                            )}
                          </CardTitle>
                          <CardDescription>{profile.email}</CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => refreshData()}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Sincronizar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setDeleteProfileId(profile.id)
                              setShowDeleteConfirm(true)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover Perfil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Contas de Anuncio</span>
                        <span className="font-medium">{profile.adAccounts.length}</span>
                      </div>

                      {profile.adAccounts.length > 0 && (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[60px]">Ativa</TableHead>
                              <TableHead>Conta</TableHead>
                              <TableHead>ID</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Gasto Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {profile.adAccounts.map(account => (
                              <TableRow key={account.id}>
                                <TableCell>
                                  <Switch
                                    checked={account.isEnabled}
                                    onCheckedChange={() => toggleAdAccount(profile.id, account.id)}
                                    disabled={account.status === 'disabled'}
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{account.name}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                    {account.accountId}
                                  </code>
                                </TableCell>
                                <TableCell>
                                  {account.status === 'active' ? (
                                    <Badge className="bg-green-500 text-white">Ativo</Badge>
                                  ) : (
                                    <Badge variant="destructive">Desativado</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatCurrency(account.spent)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Integration Tab */}
        <TabsContent value="integration" className="space-y-6">
          {/* Pixels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5 text-[#1877F2]" />
                Meta Pixel
              </CardTitle>
              <CardDescription>
                Configure o Pixel para rastrear eventos da sua loja
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profiles.flatMap(p => p.pixels).length === 0 ? (
                <div className="text-center py-8">
                  <Code className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h4 className="font-medium mb-2">Nenhum Pixel configurado</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Adicione um Pixel para comecar a rastrear eventos.
                  </p>
                </div>
              ) : (
                profiles.map(profile =>
                  profile.pixels.map(pixel => (
                    <div key={pixel.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg",
                          pixel.isActive ? "bg-green-500/10" : "bg-red-500/10"
                        )}>
                          {pixel.isActive ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{pixel.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {pixel.pixelId} • {pixel.eventsReceived.toLocaleString()} eventos
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedPixel(pixel)
                          setShowPixelScript(true)
                        }}
                        className="gap-2"
                      >
                        <Code className="h-4 w-4" />
                        Ver Script
                      </Button>
                    </div>
                  ))
                )
              )}

              {/* Add Pixel Button */}
              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Adicionar Novo Pixel</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>ID do Pixel</Label>
                    <Input placeholder="Ex: 1234567890" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome do Pixel</Label>
                    <Input placeholder="Ex: Pixel Loja Principal" />
                  </div>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Pixel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Shopify Integration Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                Integracao com Shopify
              </CardTitle>
              <CardDescription>
                Siga os passos para configurar o Pixel na sua loja
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Copie o script do Pixel</p>
                    <p className="text-sm text-muted-foreground">
                      Clique em "Ver Script" no Pixel que deseja usar
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Acesse o tema da Shopify</p>
                    <p className="text-sm text-muted-foreground">
                      Loja Online {">"} Temas {">"} Editar codigo {">"} theme.liquid
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Cole o script antes do {"</head>"}</p>
                    <p className="text-sm text-muted-foreground">
                      Encontre a tag {"</head>"} e cole o script logo acima dela
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Salve e teste</p>
                    <p className="text-sm text-muted-foreground">
                      Use o Meta Pixel Helper para verificar se esta funcionando
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => window.open('https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc', '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  Baixar Meta Pixel Helper
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Events Received */}
          <Card>
            <CardHeader>
              <CardTitle>Eventos Recebidos</CardTitle>
              <CardDescription>Ultimos eventos rastreados pelo Pixel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">12,450</p>
                  <p className="text-sm text-muted-foreground">PageView</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">3,280</p>
                  <p className="text-sm text-muted-foreground">ViewContent</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">890</p>
                  <p className="text-sm text-muted-foreground">AddToCart</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">245</p>
                  <p className="text-sm text-muted-foreground">Purchase</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Profile Dialog */}
      <Dialog open={showAddProfile} onOpenChange={setShowAddProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Facebook className="h-5 w-5 text-[#1877F2]" />
              Adicionar Perfil Meta
            </DialogTitle>
            <DialogDescription>
              Conecte um novo perfil para gerenciar mais contas de anuncio
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Perfil</Label>
              <Input
                placeholder="Ex: Perfil Empresa X"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Access Token</Label>
              <Input
                type="password"
                placeholder="Cole o Access Token aqui..."
                value={newProfileToken}
                onChange={(e) => setNewProfileToken(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Obtenha o token no <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Graph API Explorer</a>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProfile(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddProfile} className="gap-2 bg-[#1877F2] hover:bg-[#166FE5]">
              <Link2 className="h-4 w-4" />
              Conectar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pixel Script Dialog */}
      <Dialog open={showPixelScript} onOpenChange={setShowPixelScript}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Script do Pixel - {selectedPixel?.name}
            </DialogTitle>
            <DialogDescription>
              Copie e cole este script no theme.liquid da sua loja Shopify
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <pre className="p-4 rounded-lg bg-muted text-xs overflow-x-auto max-h-[400px]">
                <code>{selectedPixel ? generatePixelScript(selectedPixel) : ''}</code>
              </pre>
              <Button
                size="sm"
                className="absolute top-2 right-2 gap-2"
                onClick={() => selectedPixel && copyScript(selectedPixel)}
              >
                {copiedScript ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPixelScript(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Profile Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Remover Perfil
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este perfil? Todas as contas de anuncio associadas serao desconectadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProfile}
              className="bg-red-500 hover:bg-red-600"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
