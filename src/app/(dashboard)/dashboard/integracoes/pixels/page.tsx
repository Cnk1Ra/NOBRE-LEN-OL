'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
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
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Activity,
  Plus,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Play,
  RefreshCw,
  Code,
  Eye,
  EyeOff,
  ExternalLink,
  Settings,
  Zap,
  Target,
  Facebook,
  Search,
  Music2,
  FlaskConical,
  MousePointerClick,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  Globe,
  Link2,
  Webhook,
  FileCode2,
  ArrowLeft,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface Pixel {
  id: string
  platform: 'meta' | 'google' | 'tiktok'
  pixel_id: string
  name: string
  status: 'active' | 'inactive' | 'error'
  events_today: number
  last_event: string
}

const mockPixels: Pixel[] = [
  { id: '1', platform: 'meta', pixel_id: '1234567890123456', name: 'Pixel Principal', status: 'active', events_today: 1250, last_event: '30s atrás' },
  { id: '2', platform: 'meta', pixel_id: '9876543210987654', name: 'Pixel Landing', status: 'active', events_today: 890, last_event: '2min atrás' },
  { id: '3', platform: 'google', pixel_id: 'AW-123456789', name: 'Google Tag', status: 'active', events_today: 650, last_event: '1min atrás' },
  { id: '4', platform: 'tiktok', pixel_id: 'CPIX123456789', name: 'TikTok Pixel', status: 'inactive', events_today: 0, last_event: '2h atrás' },
]

const platformConfig = {
  meta: { name: 'Meta', icon: Facebook, color: '#1877F2', bgColor: 'bg-[#1877F2]/10' },
  google: { name: 'Google', icon: Search, color: '#EA4335', bgColor: 'bg-[#EA4335]/10' },
  tiktok: { name: 'TikTok', icon: Music2, color: '#000000', bgColor: 'bg-black/10' },
}

// Scripts templates
const scriptTemplates = [
  {
    id: 'padrao',
    name: 'Script Padrão',
    description: 'Script de tracking padrão para lojas BRL',
    currency: 'BRL',
    recommended: true,
  },
  {
    id: 'auto',
    name: 'Script Auto-Detecção',
    description: 'Detecta automaticamente país e moeda pelo domínio',
    currency: 'AUTO',
    recommended: false,
  },
  {
    id: 'eur',
    name: 'Europa (EUR)',
    description: 'Portugal, Espanha, França, Itália, Alemanha',
    currency: 'EUR',
    recommended: false,
  },
  {
    id: 'mad',
    name: 'Marrocos (MAD)',
    description: 'Script otimizado para Dirham Marroquino',
    currency: 'MAD',
    recommended: false,
  },
  {
    id: 'aed',
    name: 'Emirados (AED)',
    description: 'Dubai, Abu Dhabi - Dirham dos Emirados',
    currency: 'AED',
    recommended: false,
  },
  {
    id: 'pln',
    name: 'Polônia (PLN)',
    description: 'Script para Zloty Polonês',
    currency: 'PLN',
    recommended: false,
  },
]

export default function PixelsPage() {
  const { toast } = useToast()
  const [pixels, setPixels] = useState<Pixel[]>(mockPixels)
  const [copied, setCopied] = useState<string | null>(null)
  const [isAddingPixel, setIsAddingPixel] = useState(false)
  const [expandedScript, setExpandedScript] = useState<string | null>(null)
  const [newPixel, setNewPixel] = useState({
    platform: 'meta' as 'meta' | 'google' | 'tiktok',
    pixel_id: '',
    name: '',
  })

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    toast({ title: 'Copiado!', description: 'Script copiado para a área de transferência.' })
    setTimeout(() => setCopied(null), 2000)
  }

  const getPlatformIcon = (platform: string) => {
    const config = platformConfig[platform as keyof typeof platformConfig]
    if (!config) return null
    const Icon = config.icon
    return <Icon className="h-5 w-5" style={{ color: config.color }} />
  }

  const getStatusBadge = (status: string) => {
    if (status === 'active') return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />Ativo</Badge>
    if (status === 'inactive') return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Inativo</Badge>
    return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Erro</Badge>
  }

  const handleAddPixel = () => {
    if (!newPixel.pixel_id || !newPixel.name) {
      toast({ title: 'Erro', description: 'Preencha todos os campos.', variant: 'destructive' })
      return
    }
    const pixel: Pixel = {
      id: Date.now().toString(),
      ...newPixel,
      status: 'active',
      events_today: 0,
      last_event: 'Agora',
    }
    setPixels([...pixels, pixel])
    setNewPixel({ platform: 'meta', pixel_id: '', name: '' })
    setIsAddingPixel(false)
    toast({ title: 'Pixel adicionado!', description: 'Configure o script na sua loja.' })
  }

  const handleDeletePixel = (id: string) => {
    setPixels(pixels.filter(p => p.id !== id))
    toast({ title: 'Pixel removido', description: 'O pixel foi removido da lista.' })
  }

  const generateScript = (currency: string) => {
    return `<!-- DOD Tracking Script - ${currency} -->
<script>
(function() {
  const DOD_CONFIG = {
    webhookUrl: 'https://seu-dashboard.com/api/webhook/tracking',
    currency: '${currency}',
    pixelMeta: '${pixels.find(p => p.platform === 'meta')?.pixel_id || 'SEU_PIXEL_ID'}',
    pixelGoogle: '${pixels.find(p => p.platform === 'google')?.pixel_id || 'SEU_TAG_ID'}',
    pixelTikTok: '${pixels.find(p => p.platform === 'tiktok')?.pixel_id || 'SEU_PIXEL_ID'}'
  };

  // Visitor tracking
  const visitorId = localStorage.getItem('dod_vid') || 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2,9);
  localStorage.setItem('dod_vid', visitorId);

  // UTM capture
  const params = new URLSearchParams(window.location.search);
  const utm = {
    source: params.get('utm_source') || 'direct',
    medium: params.get('utm_medium') || '',
    campaign: params.get('utm_campaign') || '',
    content: params.get('utm_content') || '',
    term: params.get('utm_term') || ''
  };

  // Send event function
  window.DOD_Track = function(event, data) {
    fetch(DOD_CONFIG.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event, data, visitorId, utm,
        currency: DOD_CONFIG.currency,
        url: window.location.href,
        timestamp: new Date().toISOString()
      })
    }).catch(console.error);
  };

  // Auto PageView
  DOD_Track('PageView', { title: document.title });
})();
</script>`
  }

  const totalEvents = pixels.reduce((acc, p) => acc + p.events_today, 0)
  const activePixels = pixels.filter(p => p.status === 'active').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/integracoes">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Code className="h-6 w-6 text-primary" />
              Pixels & Scripts
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus pixels de tracking e scripts de conversão
            </p>
          </div>
        </div>
        <Dialog open={isAddingPixel} onOpenChange={setIsAddingPixel}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Pixel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Pixel</DialogTitle>
              <DialogDescription>
                Configure um novo pixel de tracking para sua loja
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Plataforma</Label>
                <Select
                  value={newPixel.platform}
                  onValueChange={(v) => setNewPixel({ ...newPixel, platform: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meta">
                      <div className="flex items-center gap-2">
                        <Facebook className="h-4 w-4 text-[#1877F2]" />
                        Meta (Facebook/Instagram)
                      </div>
                    </SelectItem>
                    <SelectItem value="google">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-[#EA4335]" />
                        Google Ads
                      </div>
                    </SelectItem>
                    <SelectItem value="tiktok">
                      <div className="flex items-center gap-2">
                        <Music2 className="h-4 w-4" />
                        TikTok Ads
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>ID do Pixel</Label>
                <Input
                  placeholder={newPixel.platform === 'google' ? 'AW-123456789' : '1234567890123456'}
                  value={newPixel.pixel_id}
                  onChange={(e) => setNewPixel({ ...newPixel, pixel_id: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nome (identificação)</Label>
                <Input
                  placeholder="Ex: Pixel Principal"
                  value={newPixel.name}
                  onChange={(e) => setNewPixel({ ...newPixel, name: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingPixel(false)}>Cancelar</Button>
              <Button onClick={handleAddPixel}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pixels.length}</p>
                <p className="text-sm text-muted-foreground">Pixels Totais</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activePixels}</p>
                <p className="text-sm text-muted-foreground">Pixels Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalEvents.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Eventos Hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Zap className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">99.8%</p>
                <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="pixels" className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-4">
          <TabsTrigger value="pixels" className="gap-1.5">
            <Target className="h-4 w-4" />
            Pixels
          </TabsTrigger>
          <TabsTrigger value="scripts" className="gap-1.5">
            <FileCode2 className="h-4 w-4" />
            Scripts
          </TabsTrigger>
          <TabsTrigger value="utm" className="gap-1.5">
            <Link2 className="h-4 w-4" />
            UTMs
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-1.5">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        {/* Pixels Tab */}
        <TabsContent value="pixels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pixels Configurados</CardTitle>
              <CardDescription>Gerencie seus pixels de tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pixels.map((pixel) => (
                  <div
                    key={pixel.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${platformConfig[pixel.platform].bgColor}`}>
                        {getPlatformIcon(pixel.platform)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{pixel.name}</p>
                          {getStatusBadge(pixel.status)}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="font-mono">{pixel.pixel_id}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(pixel.pixel_id, pixel.id)}
                          >
                            {copied === pixel.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{pixel.events_today.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">eventos hoje</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{pixel.last_event}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeletePixel(pixel.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {pixels.length === 0 && (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum pixel configurado</p>
                    <Button className="mt-4" onClick={() => setIsAddingPixel(true)}>
                      Adicionar Primeiro Pixel
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scripts Tab */}
        <TabsContent value="scripts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Scripts de Tracking COD</CardTitle>
              <CardDescription>
                Escolha o script adequado para sua loja e copie para o cabeçalho do site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {scriptTemplates.map((template) => (
                <Collapsible
                  key={template.id}
                  open={expandedScript === template.id}
                  onOpenChange={() => setExpandedScript(expandedScript === template.id ? null : template.id)}
                >
                  <div className="border rounded-lg overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <FileCode2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{template.name}</p>
                              {template.recommended && (
                                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                  Recomendado
                                </Badge>
                              )}
                              <Badge variant="outline">{template.currency}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(generateScript(template.currency), template.id)
                            }}
                          >
                            {copied === template.id ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                            Copiar
                          </Button>
                          {expandedScript === template.id ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 bg-muted/30 border-t">
                        <pre className="text-xs font-mono bg-black/90 text-green-400 p-4 rounded-lg overflow-x-auto">
                          {generateScript(template.currency)}
                        </pre>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </CardContent>
          </Card>

          {/* Installation Guide */}
          <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-blue-500" />
                Como Instalar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">1</span>
                <p>Copie o script desejado clicando no botão "Copiar"</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">2</span>
                <p>Cole no <code className="bg-muted px-1 rounded">&lt;head&gt;</code> do seu site, antes do <code className="bg-muted px-1 rounded">&lt;/head&gt;</code></p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">3</span>
                <p>Substitua os IDs de pixel pelos seus próprios IDs configurados acima</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">4</span>
                <p>Configure o <code className="bg-muted px-1 rounded">webhookUrl</code> com a URL do seu dashboard</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* UTM Tab */}
        <TabsContent value="utm" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuração de UTMs</CardTitle>
              <CardDescription>
                Configure os parâmetros UTM para rastreamento de campanhas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>utm_source</Label>
                  <Input placeholder="{platform}" defaultValue="{platform}" />
                  <p className="text-xs text-muted-foreground">Origem do tráfego (facebook, google, tiktok)</p>
                </div>
                <div className="space-y-2">
                  <Label>utm_medium</Label>
                  <Input placeholder="cpc" defaultValue="cpc" />
                  <p className="text-xs text-muted-foreground">Meio de marketing (cpc, cpm, email)</p>
                </div>
                <div className="space-y-2">
                  <Label>utm_campaign</Label>
                  <Input placeholder="{campaign_name}" defaultValue="{campaign_name}" />
                  <p className="text-xs text-muted-foreground">Nome da campanha</p>
                </div>
                <div className="space-y-2">
                  <Label>utm_content</Label>
                  <Input placeholder="{ad_name}" defaultValue="{ad_name}" />
                  <p className="text-xs text-muted-foreground">Identificador do criativo/anúncio</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 mt-6">
                <Label className="mb-2 block">URL de Exemplo</Label>
                <code className="text-sm break-all text-primary">
                  https://sua-loja.com/?utm_source=facebook&utm_medium=cpc&utm_campaign=black_friday&utm_content=video_1
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Endpoints de Webhook</CardTitle>
              <CardDescription>
                URLs para receber eventos de tracking em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Tracking Events', url: '/api/webhook/tracking', active: true },
                { name: 'Conversions API (Meta)', url: '/api/webhook/meta-capi', active: true },
                { name: 'Offline Conversions (Google)', url: '/api/webhook/google-offline', active: true },
                { name: 'TikTok Events API', url: '/api/webhook/tiktok', active: false },
              ].map((webhook, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${webhook.active ? 'bg-green-500/10' : 'bg-muted'}`}>
                      <Webhook className={`h-5 w-5 ${webhook.active ? 'text-green-500' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className="font-medium">{webhook.name}</p>
                      <code className="text-sm text-muted-foreground">{webhook.url}</code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={webhook.active} />
                    <Button variant="ghost" size="icon">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
