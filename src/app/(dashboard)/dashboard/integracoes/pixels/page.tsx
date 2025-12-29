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
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  Link2,
  Eye,
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
  CreditCard,
  Truck,
  PackageCheck,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Pixel {
  id: string
  platform: 'meta' | 'google' | 'tiktok'
  pixel_id: string
  name: string
  status: 'active' | 'inactive' | 'error'
  events_today: number
  last_event: string
}

interface UTMConfig {
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content: string
  utm_term: string
}

interface TestEvent {
  id: string
  event_name: string
  timestamp: string
  platform: string
  status: 'success' | 'failed' | 'pending'
  details: string
}

const mockPixels: Pixel[] = [
  {
    id: '1',
    platform: 'meta',
    pixel_id: '1234567890123456',
    name: 'Pixel Principal',
    status: 'active',
    events_today: 1250,
    last_event: '30s atrás',
  },
  {
    id: '2',
    platform: 'meta',
    pixel_id: '9876543210987654',
    name: 'Pixel Landing',
    status: 'active',
    events_today: 890,
    last_event: '2min atrás',
  },
  {
    id: '3',
    platform: 'google',
    pixel_id: 'AW-123456789',
    name: 'Google Tag',
    status: 'active',
    events_today: 650,
    last_event: '1min atrás',
  },
  {
    id: '4',
    platform: 'tiktok',
    pixel_id: 'CPIX123456789',
    name: 'TikTok Pixel',
    status: 'inactive',
    events_today: 0,
    last_event: '2h atrás',
  },
]

const mockTestEvents: TestEvent[] = [
  {
    id: '1',
    event_name: 'PageView',
    timestamp: '14:35:22',
    platform: 'Meta',
    status: 'success',
    details: 'Pixel 1234567890123456 - Landing Page',
  },
  {
    id: '2',
    event_name: 'InitiateCheckout',
    timestamp: '14:35:25',
    platform: 'Meta',
    status: 'success',
    details: 'Pixel 1234567890123456 - Checkout Page',
  },
  {
    id: '3',
    event_name: 'Purchase',
    timestamp: '14:35:30',
    platform: 'Google',
    status: 'success',
    details: 'Tag AW-123456789 - Thank You Page',
  },
  {
    id: '4',
    event_name: 'Purchase',
    timestamp: '14:35:30',
    platform: 'TikTok',
    status: 'failed',
    details: 'Erro: Pixel inativo',
  },
]

export default function PixelsUTMsPage() {
  const { toast } = useToast()
  const [pixels, setPixels] = useState<Pixel[]>(mockPixels)
  const [testEvents, setTestEvents] = useState<TestEvent[]>(mockTestEvents)
  const [copied, setCopied] = useState<string | null>(null)
  const [isAddingPixel, setIsAddingPixel] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  const [utmConfig, setUtmConfig] = useState<UTMConfig>({
    utm_source: '{platform}',
    utm_medium: 'cpc',
    utm_campaign: '{campaign_name}',
    utm_content: '{ad_name}',
    utm_term: '{adset_name}',
  })

  const [newPixel, setNewPixel] = useState({
    platform: 'meta' as 'meta' | 'google' | 'tiktok',
    pixel_id: '',
    name: '',
  })

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'meta':
        return <Facebook className="h-4 w-4 text-[#1877F2]" />
      case 'google':
        return <Search className="h-4 w-4 text-[#EA4335]" />
      case 'tiktok':
        return <Music2 className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'meta':
        return 'text-[#1877F2] bg-[#1877F2]/10 border-[#1877F2]/20'
      case 'google':
        return 'text-[#EA4335] bg-[#EA4335]/10 border-[#EA4335]/20'
      case 'tiktok':
        return 'bg-black/10 border-black/20 dark:bg-white/10 dark:border-white/20'
      default:
        return 'bg-muted'
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
    toast({
      title: 'Copiado!',
      description: 'Código copiado para a área de transferência.',
    })
  }

  const addPixel = () => {
    if (!newPixel.pixel_id || !newPixel.name) return

    const pixel: Pixel = {
      id: Date.now().toString(),
      platform: newPixel.platform,
      pixel_id: newPixel.pixel_id,
      name: newPixel.name,
      status: 'inactive',
      events_today: 0,
      last_event: 'Nunca',
    }

    setPixels([...pixels, pixel])
    setNewPixel({ platform: 'meta', pixel_id: '', name: '' })
    setIsAddingPixel(false)
    toast({
      title: 'Pixel adicionado!',
      description: `${pixel.name} foi adicionado com sucesso.`,
    })
  }

  const removePixel = (id: string) => {
    setPixels(pixels.filter(p => p.id !== id))
    toast({
      title: 'Pixel removido',
      description: 'O pixel foi removido das configurações.',
    })
  }

  const runTest = () => {
    setIsTesting(true)
    setTimeout(() => {
      setIsTesting(false)
      toast({
        title: 'Teste concluído!',
        description: 'Todos os eventos foram disparados. Verifique os resultados.',
      })
    }, 3000)
  }

  const generateTrackingScript = () => {
    const metaPixels = pixels.filter(p => p.platform === 'meta' && p.status === 'active')
    const googlePixels = pixels.filter(p => p.platform === 'google' && p.status === 'active')
    const tiktokPixels = pixels.filter(p => p.platform === 'tiktok' && p.status === 'active')

    let script = `<!-- DOD Tracking Script -->\n<script>\n`
    script += `// UTM Parameters\nconst utmParams = new URLSearchParams(window.location.search);\n`
    script += `const utm_source = utmParams.get('utm_source') || '';\n`
    script += `const utm_medium = utmParams.get('utm_medium') || '';\n`
    script += `const utm_campaign = utmParams.get('utm_campaign') || '';\n\n`

    if (metaPixels.length > 0) {
      script += `// Meta Pixel\n`
      metaPixels.forEach(p => {
        script += `!function(f,b,e,v,n,t,s){...}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');\n`
        script += `fbq('init', '${p.pixel_id}');\n`
        script += `fbq('track', 'PageView');\n\n`
      })
    }

    if (googlePixels.length > 0) {
      script += `// Google Tag\n`
      googlePixels.forEach(p => {
        script += `gtag('config', '${p.pixel_id}');\n\n`
      })
    }

    if (tiktokPixels.length > 0) {
      script += `// TikTok Pixel\n`
      tiktokPixels.forEach(p => {
        script += `ttq.load('${p.pixel_id}');\n`
        script += `ttq.page();\n\n`
      })
    }

    script += `</script>`
    return script
  }

  const generateUTMUrl = (baseUrl: string) => {
    const params = new URLSearchParams()
    if (utmConfig.utm_source) params.append('utm_source', utmConfig.utm_source)
    if (utmConfig.utm_medium) params.append('utm_medium', utmConfig.utm_medium)
    if (utmConfig.utm_campaign) params.append('utm_campaign', utmConfig.utm_campaign)
    if (utmConfig.utm_content) params.append('utm_content', utmConfig.utm_content)
    if (utmConfig.utm_term) params.append('utm_term', utmConfig.utm_term)
    return `${baseUrl}?${params.toString()}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lime-500/10">
              <Activity className="h-6 w-6 text-lime-500" />
            </div>
            Pixels, UTMs & Testes
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure pixels de tracking, parâmetros UTM e teste suas integrações
          </p>
        </div>
      </div>

      <Tabs defaultValue="pixels" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-xl">
          <TabsTrigger value="pixels" className="gap-2">
            <Target className="h-4 w-4" />
            Pixels
          </TabsTrigger>
          <TabsTrigger value="utms" className="gap-2">
            <Link2 className="h-4 w-4" />
            UTMs
          </TabsTrigger>
          <TabsTrigger value="scripts" className="gap-2">
            <Code className="h-4 w-4" />
            Scripts
          </TabsTrigger>
          <TabsTrigger value="testes" className="gap-2">
            <FlaskConical className="h-4 w-4" />
            Testes
          </TabsTrigger>
        </TabsList>

        {/* PIXELS TAB */}
        <TabsContent value="pixels" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Pixels Configurados</h2>
              <p className="text-sm text-muted-foreground">
                Gerencie seus pixels de todas as plataformas
              </p>
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
                    Configure um novo pixel para tracking
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
                          <span className="flex items-center gap-2">
                            <Facebook className="h-4 w-4 text-[#1877F2]" />
                            Meta (Facebook/Instagram)
                          </span>
                        </SelectItem>
                        <SelectItem value="google">
                          <span className="flex items-center gap-2">
                            <Search className="h-4 w-4 text-[#EA4335]" />
                            Google Ads
                          </span>
                        </SelectItem>
                        <SelectItem value="tiktok">
                          <span className="flex items-center gap-2">
                            <Music2 className="h-4 w-4" />
                            TikTok Ads
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>ID do Pixel</Label>
                    <Input
                      placeholder={newPixel.platform === 'meta' ? '1234567890123456' : newPixel.platform === 'google' ? 'AW-123456789' : 'CPIX123456789'}
                      value={newPixel.pixel_id}
                      onChange={(e) => setNewPixel({ ...newPixel, pixel_id: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome de Identificação</Label>
                    <Input
                      placeholder="Ex: Pixel Principal"
                      value={newPixel.name}
                      onChange={(e) => setNewPixel({ ...newPixel, name: e.target.value })}
                    />
                  </div>
                  <Button className="w-full" onClick={addPixel}>
                    Adicionar Pixel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {pixels.map((pixel) => (
              <Card key={pixel.id} className="overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${getPlatformColor(pixel.platform)}`}>
                      {getPlatformIcon(pixel.platform)}
                    </div>
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {pixel.name}
                        {pixel.status === 'active' && (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Ativo
                          </Badge>
                        )}
                        {pixel.status === 'inactive' && (
                          <Badge variant="outline" className="text-muted-foreground">
                            Inativo
                          </Badge>
                        )}
                        {pixel.status === 'error' && (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Erro
                          </Badge>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="font-mono">{pixel.pixel_id}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => copyToClipboard(pixel.pixel_id, pixel.id)}
                        >
                          {copied === pixel.id ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-green-500">
                        {pixel.events_today.toLocaleString()} eventos
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Último: {pixel.last_event}
                      </p>
                    </div>
                    <Switch checked={pixel.status === 'active'} />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => removePixel(pixel.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* UTMS TAB */}
        <TabsContent value="utms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de UTMs</CardTitle>
              <CardDescription>
                Configure os parâmetros UTM padrão para suas campanhas. Use variáveis dinâmicas como {'{platform}'}, {'{campaign_name}'}, etc.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>utm_source</Label>
                  <Input
                    value={utmConfig.utm_source}
                    onChange={(e) => setUtmConfig({ ...utmConfig, utm_source: e.target.value })}
                    placeholder="{platform}"
                  />
                  <p className="text-xs text-muted-foreground">
                    Origem do tráfego (facebook, google, tiktok)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>utm_medium</Label>
                  <Input
                    value={utmConfig.utm_medium}
                    onChange={(e) => setUtmConfig({ ...utmConfig, utm_medium: e.target.value })}
                    placeholder="cpc"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tipo de mídia (cpc, cpm, banner)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>utm_campaign</Label>
                  <Input
                    value={utmConfig.utm_campaign}
                    onChange={(e) => setUtmConfig({ ...utmConfig, utm_campaign: e.target.value })}
                    placeholder="{campaign_name}"
                  />
                  <p className="text-xs text-muted-foreground">
                    Nome da campanha
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>utm_content</Label>
                  <Input
                    value={utmConfig.utm_content}
                    onChange={(e) => setUtmConfig({ ...utmConfig, utm_content: e.target.value })}
                    placeholder="{ad_name}"
                  />
                  <p className="text-xs text-muted-foreground">
                    Conteúdo/Criativo do anúncio
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>utm_term</Label>
                  <Input
                    value={utmConfig.utm_term}
                    onChange={(e) => setUtmConfig({ ...utmConfig, utm_term: e.target.value })}
                    placeholder="{adset_name}"
                  />
                  <p className="text-xs text-muted-foreground">
                    Termo/Conjunto de anúncios
                  </p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Variáveis Disponíveis</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    '{platform}',
                    '{campaign_id}',
                    '{campaign_name}',
                    '{adset_id}',
                    '{adset_name}',
                    '{ad_id}',
                    '{ad_name}',
                    '{placement}',
                    '{site_source_name}',
                  ].map((variable) => (
                    <Badge
                      key={variable}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => copyToClipboard(variable, variable)}
                    >
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Preview da URL</h3>
                <div className="p-4 rounded-lg bg-muted font-mono text-sm break-all">
                  {generateUTMUrl('https://sualoja.com/produto')}
                </div>
                <Button
                  variant="outline"
                  className="mt-4 gap-2"
                  onClick={() => copyToClipboard(generateUTMUrl('https://sualoja.com/produto'), 'utm-url')}
                >
                  <Copy className="h-4 w-4" />
                  Copiar URL
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SubIDs para Cloakers</CardTitle>
              <CardDescription>
                Configure parâmetros adicionais para compatibilidade com cloakers (The White Rabbit, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['sub1', 'sub2', 'sub3', 'sub4', 'sub5', 'sub6', 'sub7', 'sub8'].map((sub, index) => (
                  <div key={sub} className="space-y-2">
                    <Label>{sub}</Label>
                    <Input
                      placeholder={index === 0 ? '{click_id}' : index === 1 ? '{campaign_id}' : ''}
                      defaultValue={index === 0 ? '{click_id}' : index === 1 ? '{campaign_id}' : index === 2 ? '{adset_id}' : index === 3 ? '{ad_id}' : ''}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SCRIPTS TAB */}
        <TabsContent value="scripts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Script de Tracking Universal
              </CardTitle>
              <CardDescription>
                Copie e cole este script na seção {'<head>'} do seu site para ativar o tracking de todos os pixels configurados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Textarea
                  value={generateTrackingScript()}
                  readOnly
                  className="font-mono text-xs min-h-[300px] bg-muted"
                />
                <Button
                  size="sm"
                  className="absolute top-2 right-2 gap-2"
                  onClick={() => copyToClipboard(generateTrackingScript(), 'script')}
                >
                  {copied === 'script' ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MousePointerClick className="h-4 w-4 text-blue-500" />
                  Landing Page
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Script para captura de UTMs e PageView
                </p>
                <Button variant="outline" className="w-full gap-2">
                  <Copy className="h-4 w-4" />
                  Copiar Script
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-orange-500" />
                  Checkout
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Script para InitiateCheckout e AddPaymentInfo
                </p>
                <Button variant="outline" className="w-full gap-2">
                  <Copy className="h-4 w-4" />
                  Copiar Script
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <PackageCheck className="h-4 w-4 text-green-500" />
                  Thank You
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Script para Purchase e Lead
                </p>
                <Button variant="outline" className="w-full gap-2">
                  <Copy className="h-4 w-4" />
                  Copiar Script
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TESTES TAB */}
        <TabsContent value="testes" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5" />
                    Testar Integrações
                  </CardTitle>
                  <CardDescription>
                    Dispare eventos de teste para verificar se os pixels estão funcionando corretamente
                  </CardDescription>
                </div>
                <Button onClick={runTest} disabled={isTesting} className="gap-2">
                  {isTesting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Iniciar Teste
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 text-center">
                    <MousePointerClick className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                    <p className="font-medium">PageView</p>
                    <p className="text-xs text-muted-foreground">Visualização de página</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 text-center">
                    <ShoppingCart className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                    <p className="font-medium">InitiateCheckout</p>
                    <p className="text-xs text-muted-foreground">Início do checkout</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 text-center">
                    <CreditCard className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                    <p className="font-medium">Purchase</p>
                    <p className="text-xs text-muted-foreground">Compra realizada</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 text-center">
                    <Truck className="h-8 w-8 mx-auto text-green-500 mb-2" />
                    <p className="font-medium">Delivered</p>
                    <p className="text-xs text-muted-foreground">Entrega confirmada</p>
                  </CardContent>
                </Card>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Plataforma</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.event_name}</TableCell>
                      <TableCell className="font-mono text-sm">{event.timestamp}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{event.platform}</Badge>
                      </TableCell>
                      <TableCell>
                        {event.status === 'success' && (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Sucesso
                          </Badge>
                        )}
                        {event.status === 'failed' && (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Falhou
                          </Badge>
                        )}
                        {event.status === 'pending' && (
                          <Badge variant="outline">
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            Pendente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {event.details}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ferramentas de Debug</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="https://www.facebook.com/events_manager"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Facebook className="h-5 w-5 text-[#1877F2]" />
                    <div>
                      <h4 className="font-medium group-hover:text-primary transition-colors">
                        Meta Events Manager
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Verificar eventos do Pixel
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                  </div>
                </a>
                <a
                  href="https://tagassistant.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Search className="h-5 w-5 text-[#EA4335]" />
                    <div>
                      <h4 className="font-medium group-hover:text-primary transition-colors">
                        Google Tag Assistant
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Debug de tags Google
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                  </div>
                </a>
                <a
                  href="https://ads.tiktok.com/help"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Music2 className="h-5 w-5" />
                    <div>
                      <h4 className="font-medium group-hover:text-primary transition-colors">
                        TikTok Pixel Helper
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Debug do Pixel TikTok
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
