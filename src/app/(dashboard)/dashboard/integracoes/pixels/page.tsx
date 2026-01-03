'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  Activity,
  Plus,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Code,
  Eye,
  EyeOff,
  Settings,
  Zap,
  Facebook,
  Search,
  Music2,
  Loader2,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Pixel {
  id: string
  platform: 'META' | 'GOOGLE' | 'TIKTOK'
  pixelId: string
  name: string
  accessToken?: string | null
  testEventCode?: string | null
  isActive: boolean
  eventsToday: number
  lastEventAt: string | null
  totalEvents?: number
  createdAt: string
}

interface UTMConfig {
  id: string
  name: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmContent: string
  utmTerm: string
  isDefault: boolean
}

interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  isActive: boolean
  lastTriggeredAt: string | null
  failCount: number
  totalRequests: number
  successRate: number
}

interface TrackingEvent {
  id: string
  eventName: string
  visitorId: string
  createdAt: string
  country?: string
  currency?: string
  orderValue?: number
  utmSource?: string
  pageUrl?: string
}

interface ApiError {
  error: string
  code: string
  details?: string
}

// Workspace ID temporário - em produção viria do contexto/sessão
const WORKSPACE_ID = 'default-workspace'

export default function PixelsPage() {
  const { toast } = useToast()

  // Estados de dados
  const [pixels, setPixels] = useState<Pixel[]>([])
  const [utmConfigs, setUtmConfigs] = useState<UTMConfig[]>([])
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [events, setEvents] = useState<TrackingEvent[]>([])
  const [eventStats, setEventStats] = useState<any>(null)

  // Estados de loading
  const [loadingPixels, setLoadingPixels] = useState(true)
  const [loadingUtms, setLoadingUtms] = useState(true)
  const [loadingWebhooks, setLoadingWebhooks] = useState(true)
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Estados de erro
  const [pixelsError, setPixelsError] = useState<string | null>(null)
  const [utmsError, setUtmsError] = useState<string | null>(null)
  const [webhooksError, setWebhooksError] = useState<string | null>(null)
  const [eventsError, setEventsError] = useState<string | null>(null)

  // Estados de UI
  const [copied, setCopied] = useState<string | null>(null)
  const [showAddPixel, setShowAddPixel] = useState(false)
  const [showAddUtm, setShowAddUtm] = useState(false)
  const [showAddWebhook, setShowAddWebhook] = useState(false)
  const [expandedScripts, setExpandedScripts] = useState<Record<string, boolean>>({})

  // Formulários
  const [newPixel, setNewPixel] = useState({
    platform: 'META' as 'META' | 'GOOGLE' | 'TIKTOK',
    pixelId: '',
    name: '',
    accessToken: '',
    testEventCode: '',
  })

  const [newUtm, setNewUtm] = useState({
    name: '',
    utmSource: '{platform}',
    utmMedium: 'cpc',
    utmCampaign: '{campaign_name}',
    utmContent: '{ad_name}',
    utmTerm: '{adset_name}',
    isDefault: false,
  })

  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: ['PageView', 'Purchase', 'Lead', 'InitiateCheckout'],
    generateSecret: true,
  })

  // Buscar dados
  const fetchPixels = useCallback(async () => {
    setLoadingPixels(true)
    setPixelsError(null)
    try {
      const res = await fetch(`/api/integrations/pixels?workspaceId=${WORKSPACE_ID}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao buscar pixels')
      setPixels(data.pixels || [])
    } catch (error: any) {
      setPixelsError(error.message)
      console.error('Erro ao buscar pixels:', error)
    } finally {
      setLoadingPixels(false)
    }
  }, [])

  const fetchUtms = useCallback(async () => {
    setLoadingUtms(true)
    setUtmsError(null)
    try {
      const res = await fetch(`/api/integrations/utm?workspaceId=${WORKSPACE_ID}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao buscar UTMs')
      setUtmConfigs(data.utmConfigs || [])
    } catch (error: any) {
      setUtmsError(error.message)
      console.error('Erro ao buscar UTMs:', error)
    } finally {
      setLoadingUtms(false)
    }
  }, [])

  const fetchWebhooks = useCallback(async () => {
    setLoadingWebhooks(true)
    setWebhooksError(null)
    try {
      const res = await fetch(`/api/integrations/webhooks?workspaceId=${WORKSPACE_ID}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao buscar webhooks')
      setWebhooks(data.webhooks || [])
    } catch (error: any) {
      setWebhooksError(error.message)
      console.error('Erro ao buscar webhooks:', error)
    } finally {
      setLoadingWebhooks(false)
    }
  }, [])

  const fetchEvents = useCallback(async () => {
    setLoadingEvents(true)
    setEventsError(null)
    try {
      const res = await fetch(`/api/integrations/events?workspaceId=${WORKSPACE_ID}&limit=20`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao buscar eventos')
      setEvents(data.events || [])
      setEventStats(data.stats || null)
    } catch (error: any) {
      setEventsError(error.message)
      console.error('Erro ao buscar eventos:', error)
    } finally {
      setLoadingEvents(false)
    }
  }, [])

  useEffect(() => {
    fetchPixels()
    fetchUtms()
    fetchWebhooks()
    fetchEvents()
  }, [fetchPixels, fetchUtms, fetchWebhooks, fetchEvents])

  // Handlers
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    toast({ title: 'Copiado!', description: 'Conteúdo copiado para a área de transferência' })
    setTimeout(() => setCopied(null), 2000)
  }

  const handleAddPixel = async () => {
    if (!newPixel.pixelId || !newPixel.name) {
      toast({ title: 'Erro', description: 'Preencha todos os campos obrigatórios', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/integrations/pixels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: WORKSPACE_ID,
          ...newPixel,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar pixel')
      }

      toast({ title: 'Sucesso!', description: 'Pixel criado com sucesso' })
      setShowAddPixel(false)
      setNewPixel({ platform: 'META', pixelId: '', name: '', accessToken: '', testEventCode: '' })
      fetchPixels()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePixel = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este pixel?')) return

    try {
      const res = await fetch(`/api/integrations/pixels?id=${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Erro ao excluir pixel')

      toast({ title: 'Sucesso!', description: 'Pixel excluído com sucesso' })
      fetchPixels()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  const handleTogglePixel = async (pixel: Pixel) => {
    try {
      const res = await fetch('/api/integrations/pixels', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pixel.id, isActive: !pixel.isActive }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Erro ao atualizar pixel')

      toast({ title: 'Sucesso!', description: `Pixel ${pixel.isActive ? 'desativado' : 'ativado'}` })
      fetchPixels()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  const handleAddUtm = async () => {
    if (!newUtm.name) {
      toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/integrations/utm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: WORKSPACE_ID, ...newUtm }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Erro ao criar UTM')

      toast({ title: 'Sucesso!', description: 'Configuração UTM criada' })
      setShowAddUtm(false)
      setNewUtm({ name: '', utmSource: '{platform}', utmMedium: 'cpc', utmCampaign: '{campaign_name}', utmContent: '{ad_name}', utmTerm: '{adset_name}', isDefault: false })
      fetchUtms()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteUtm = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração?')) return

    try {
      const res = await fetch(`/api/integrations/utm?id=${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Erro ao excluir UTM')

      toast({ title: 'Sucesso!', description: 'Configuração UTM excluída' })
      fetchUtms()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  const handleAddWebhook = async () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast({ title: 'Erro', description: 'Nome e URL são obrigatórios', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/integrations/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: WORKSPACE_ID, ...newWebhook }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Erro ao criar webhook')

      if (data.webhook?.secretVisible) {
        toast({
          title: 'Webhook criado!',
          description: `Secret: ${data.webhook.secretVisible.substring(0, 20)}... (salve agora, não será mostrado novamente)`,
        })
      } else {
        toast({ title: 'Sucesso!', description: 'Webhook criado' })
      }

      setShowAddWebhook(false)
      setNewWebhook({ name: '', url: '', events: ['PageView', 'Purchase', 'Lead', 'InitiateCheckout'], generateSecret: true })
      fetchWebhooks()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este webhook?')) return

    try {
      const res = await fetch(`/api/integrations/webhooks?id=${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Erro ao excluir webhook')

      toast({ title: 'Sucesso!', description: 'Webhook excluído' })
      fetchWebhooks()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  const handleToggleWebhook = async (webhook: Webhook) => {
    try {
      const res = await fetch('/api/integrations/webhooks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: webhook.id, isActive: !webhook.isActive }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Erro ao atualizar webhook')

      toast({ title: 'Sucesso!', description: `Webhook ${webhook.isActive ? 'desativado' : 'ativado'}` })
      fetchWebhooks()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'META': return <Facebook className="h-4 w-4 text-blue-500" />
      case 'GOOGLE': return <Search className="h-4 w-4 text-red-500" />
      case 'TIKTOK': return <Music2 className="h-4 w-4 text-pink-500" />
      default: return <Code className="h-4 w-4" />
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'META': return 'bg-blue-100 text-blue-800'
      case 'GOOGLE': return 'bg-red-100 text-red-800'
      case 'TIKTOK': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSecs < 60) return `${diffSecs}s atrás`
    if (diffMins < 60) return `${diffMins}min atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    return `${diffDays}d atrás`
  }

  // Gerar script de tracking
  const getTrackingScript = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://seu-dominio.com'
    return `<!-- DOD Tracking Script -->
<script>
(function() {
  var DOD_WEBHOOK = '${baseUrl}/api/webhook/tracking';
  var DOD_WORKSPACE = '${WORKSPACE_ID}';

  function generateId() {
    return 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  function getVisitorId() {
    var id = localStorage.getItem('dod_visitor_id');
    if (!id) {
      id = generateId();
      localStorage.setItem('dod_visitor_id', id);
    }
    return id;
  }

  function getUTMParams() {
    var p = new URLSearchParams(window.location.search);
    return {
      utm_source: p.get('utm_source'),
      utm_medium: p.get('utm_medium'),
      utm_campaign: p.get('utm_campaign'),
      utm_content: p.get('utm_content'),
      utm_term: p.get('utm_term'),
      fbclid: p.get('fbclid'),
      gclid: p.get('gclid'),
      ttclid: p.get('ttclid'),
      visitor_id: getVisitorId(),
      landing_page: window.location.href
    };
  }

  function sendEvent(eventName, eventData) {
    var payload = {
      event: eventName,
      workspaceId: DOD_WORKSPACE,
      timestamp: new Date().toISOString(),
      tracking: getUTMParams(),
      data: eventData || {},
      page: { url: window.location.href, title: document.title }
    };

    fetch(DOD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(function(e) { console.error('[DOD]', e); });

    // Também dispara para pixels configurados
    if (typeof fbq !== 'undefined') fbq('track', eventName, eventData);
    if (typeof gtag !== 'undefined') gtag('event', eventName, eventData);
    if (typeof ttq !== 'undefined') ttq.track(eventName, eventData);
  }

  // Auto PageView
  sendEvent('PageView', { page_type: window.location.pathname });

  // Expor globalmente
  window.DOD = {
    track: sendEvent,
    purchase: function(data) {
      sendEvent('Purchase', {
        value: data.value,
        currency: data.currency || 'BRL',
        order_id: data.order_id,
        content_name: data.product_name
      });
    },
    lead: function(data) {
      sendEvent('Lead', data);
    },
    initiateCheckout: function(data) {
      sendEvent('InitiateCheckout', data);
    }
  };
})();
</script>`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pixels & Tracking</h1>
          <p className="text-muted-foreground">Gerencie seus pixels e configurações de tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { fetchPixels(); fetchUtms(); fetchWebhooks(); fetchEvents(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {eventStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Eventos Hoje</p>
                  <p className="text-2xl font-bold">{eventStats.eventsToday?.toLocaleString() || 0}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Purchases</p>
                  <p className="text-2xl font-bold">{eventStats.byType?.purchases?.toLocaleString() || 0}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Leads</p>
                  <p className="text-2xl font-bold">{eventStats.byType?.leads?.toLocaleString() || 0}</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold">
                    R$ {(eventStats.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="pixels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pixels">Pixels ({pixels.length})</TabsTrigger>
          <TabsTrigger value="scripts">Scripts</TabsTrigger>
          <TabsTrigger value="utm">UTMs ({utmConfigs.length})</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks ({webhooks.length})</TabsTrigger>
          <TabsTrigger value="events">Eventos ({events.length})</TabsTrigger>
        </TabsList>

        {/* Tab Pixels */}
        <TabsContent value="pixels" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Pixels Configurados</h2>
            <Dialog open={showAddPixel} onOpenChange={setShowAddPixel}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> Adicionar Pixel</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Pixel</DialogTitle>
                  <DialogDescription>Configure um pixel para tracking de conversões</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Plataforma *</Label>
                    <Select value={newPixel.platform} onValueChange={(v) => setNewPixel({ ...newPixel, platform: v as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="META">Meta (Facebook/Instagram)</SelectItem>
                        <SelectItem value="GOOGLE">Google Ads / Analytics</SelectItem>
                        <SelectItem value="TIKTOK">TikTok Ads</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>ID do Pixel *</Label>
                    <Input
                      placeholder={newPixel.platform === 'META' ? '1234567890123456' : newPixel.platform === 'GOOGLE' ? 'AW-123456789' : 'CPIX123456789'}
                      value={newPixel.pixelId}
                      onChange={(e) => setNewPixel({ ...newPixel, pixelId: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Nome *</Label>
                    <Input
                      placeholder="Ex: Pixel Principal"
                      value={newPixel.name}
                      onChange={(e) => setNewPixel({ ...newPixel, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Access Token (opcional, para Conversions API)</Label>
                    <Input
                      type="password"
                      placeholder="Token de acesso"
                      value={newPixel.accessToken}
                      onChange={(e) => setNewPixel({ ...newPixel, accessToken: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Test Event Code (opcional)</Label>
                    <Input
                      placeholder="TEST12345"
                      value={newPixel.testEventCode}
                      onChange={(e) => setNewPixel({ ...newPixel, testEventCode: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddPixel(false)}>Cancelar</Button>
                  <Button onClick={handleAddPixel} disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Adicionar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {pixelsError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro ao carregar pixels</AlertTitle>
              <AlertDescription>{pixelsError}</AlertDescription>
            </Alert>
          )}

          {loadingPixels ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : pixels.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <Code className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Nenhum pixel configurado</h3>
                <p className="text-muted-foreground mb-4">Adicione um pixel para começar a rastrear conversões</p>
                <Button onClick={() => setShowAddPixel(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Pixel
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pixels.map((pixel) => (
                <Card key={pixel.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      {getPlatformIcon(pixel.platform)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{pixel.name}</span>
                          <Badge variant="outline" className={getPlatformColor(pixel.platform)}>
                            {pixel.platform}
                          </Badge>
                          {pixel.isActive ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800">Ativo</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800">Inativo</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ID: {pixel.pixelId} | Eventos hoje: {pixel.eventsToday} | Último: {formatDate(pixel.lastEventAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={pixel.isActive} onCheckedChange={() => handleTogglePixel(pixel)} />
                      <Button variant="ghost" size="icon" onClick={() => handleCopy(pixel.pixelId, pixel.id)}>
                        {copied === pixel.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeletePixel(pixel.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab Scripts */}
        <TabsContent value="scripts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Script de Tracking</CardTitle>
              <CardDescription>Cole este script antes do &lt;/head&gt; em suas landing pages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                  {getTrackingScript()}
                </pre>
                <Button
                  className="absolute top-2 right-2"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(getTrackingScript(), 'script')}
                >
                  {copied === 'script' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Como usar</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li><code>DOD.track('EventName', {'{data}'}</code> - Enviar evento customizado</li>
                    <li><code>DOD.purchase({'{value, currency, order_id}'})</code> - Registrar compra</li>
                    <li><code>DOD.lead({'{data}'})</code> - Registrar lead</li>
                    <li><code>DOD.initiateCheckout({'{data}'})</code> - Início do checkout</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab UTMs */}
        <TabsContent value="utm" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Configurações UTM</h2>
            <Dialog open={showAddUtm} onOpenChange={setShowAddUtm}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> Adicionar Configuração</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Configuração UTM</DialogTitle>
                  <DialogDescription>Defina o padrão de UTMs para suas campanhas</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nome</Label>
                    <Input value={newUtm.name} onChange={(e) => setNewUtm({ ...newUtm, name: e.target.value })} placeholder="Ex: Padrão Meta" />
                  </div>
                  <div>
                    <Label>utm_source</Label>
                    <Input value={newUtm.utmSource} onChange={(e) => setNewUtm({ ...newUtm, utmSource: e.target.value })} />
                  </div>
                  <div>
                    <Label>utm_medium</Label>
                    <Input value={newUtm.utmMedium} onChange={(e) => setNewUtm({ ...newUtm, utmMedium: e.target.value })} />
                  </div>
                  <div>
                    <Label>utm_campaign</Label>
                    <Input value={newUtm.utmCampaign} onChange={(e) => setNewUtm({ ...newUtm, utmCampaign: e.target.value })} />
                  </div>
                  <div>
                    <Label>utm_content</Label>
                    <Input value={newUtm.utmContent} onChange={(e) => setNewUtm({ ...newUtm, utmContent: e.target.value })} />
                  </div>
                  <div>
                    <Label>utm_term</Label>
                    <Input value={newUtm.utmTerm} onChange={(e) => setNewUtm({ ...newUtm, utmTerm: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={newUtm.isDefault} onCheckedChange={(v) => setNewUtm({ ...newUtm, isDefault: v })} />
                    <Label>Definir como padrão</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddUtm(false)}>Cancelar</Button>
                  <Button onClick={handleAddUtm} disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Adicionar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {utmsError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro ao carregar UTMs</AlertTitle>
              <AlertDescription>{utmsError}</AlertDescription>
            </Alert>
          )}

          {loadingUtms ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : utmConfigs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Nenhuma configuração UTM</h3>
                <p className="text-muted-foreground mb-4">Configure padrões de UTM para suas campanhas</p>
                <Button onClick={() => setShowAddUtm(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Configuração
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {utmConfigs.map((utm) => (
                <Card key={utm.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{utm.name}</span>
                        {utm.isDefault && <Badge>Padrão</Badge>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteUtm(utm.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>utm_source: <code className="bg-muted px-1 rounded">{utm.utmSource}</code></p>
                      <p>utm_medium: <code className="bg-muted px-1 rounded">{utm.utmMedium}</code></p>
                      <p>utm_campaign: <code className="bg-muted px-1 rounded">{utm.utmCampaign}</code></p>
                      <p>utm_content: <code className="bg-muted px-1 rounded">{utm.utmContent}</code></p>
                      <p>utm_term: <code className="bg-muted px-1 rounded">{utm.utmTerm}</code></p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab Webhooks */}
        <TabsContent value="webhooks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Webhooks</h2>
            <Dialog open={showAddWebhook} onOpenChange={setShowAddWebhook}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> Adicionar Webhook</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Webhook</DialogTitle>
                  <DialogDescription>Configure um endpoint para receber eventos</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nome</Label>
                    <Input value={newWebhook.name} onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })} placeholder="Ex: CRM Integration" />
                  </div>
                  <div>
                    <Label>URL do Webhook</Label>
                    <Input value={newWebhook.url} onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })} placeholder="https://seu-endpoint.com/webhook" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={newWebhook.generateSecret} onCheckedChange={(v) => setNewWebhook({ ...newWebhook, generateSecret: v })} />
                    <Label>Gerar Secret para assinatura HMAC</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddWebhook(false)}>Cancelar</Button>
                  <Button onClick={handleAddWebhook} disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Adicionar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {webhooksError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro ao carregar webhooks</AlertTitle>
              <AlertDescription>{webhooksError}</AlertDescription>
            </Alert>
          )}

          {loadingWebhooks ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : webhooks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Nenhum webhook configurado</h3>
                <p className="text-muted-foreground mb-4">Adicione webhooks para integrar com outros sistemas</p>
                <Button onClick={() => setShowAddWebhook(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Webhook
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {webhooks.map((webhook) => (
                <Card key={webhook.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{webhook.name}</span>
                          {webhook.isActive ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800">Ativo</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800">Inativo</Badge>
                          )}
                          {webhook.failCount > 5 && (
                            <Badge variant="destructive">Falhas: {webhook.failCount}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate max-w-md">{webhook.url}</p>
                        <p className="text-xs text-muted-foreground">
                          Último disparo: {formatDate(webhook.lastTriggeredAt)} | Requests: {webhook.totalRequests} | Taxa de sucesso: {webhook.successRate}%
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={webhook.isActive} onCheckedChange={() => handleToggleWebhook(webhook)} />
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteWebhook(webhook.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab Eventos */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Eventos Recentes</h2>
            <Button variant="outline" onClick={fetchEvents}>
              <RefreshCw className="h-4 w-4 mr-2" /> Atualizar
            </Button>
          </div>

          {eventsError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro ao carregar eventos</AlertTitle>
              <AlertDescription>{eventsError}</AlertDescription>
            </Alert>
          )}

          {loadingEvents ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Nenhum evento registrado</h3>
                <p className="text-muted-foreground">Os eventos aparecerão aqui quando o script for instalado</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead>Visitante</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Badge variant={
                          event.eventName === 'Purchase' ? 'default' :
                          event.eventName === 'Lead' ? 'secondary' :
                          'outline'
                        }>
                          {event.eventName}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{event.visitorId.substring(0, 15)}...</TableCell>
                      <TableCell>{event.utmSource || '-'}</TableCell>
                      <TableCell>
                        {event.orderValue ? `R$ ${event.orderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                      </TableCell>
                      <TableCell>{formatDate(event.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
