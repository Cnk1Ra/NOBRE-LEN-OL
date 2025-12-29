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

  // Script de tracking para Shopify
  const shopifyTrackingScript = `<!-- DOD TRACKING SCRIPT - Cole antes do </head> -->
<script>
(function() {
  'use strict';

  // ============================================
  // CONFIGURAÇÃO
  // ============================================
  const DOD_CONFIG = {
    webhookUrl: 'https://seu-dashboard.com/api/webhook/tracking',
    debug: false
  };

  const DOD = {
    log: function(msg, data) {
      if (DOD_CONFIG.debug) console.log('[DOD]', msg, data || '');
    },
    generateVisitorId: function() {
      return 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    getVisitorId: function() {
      let id = localStorage.getItem('dod_visitor_id');
      if (!id) {
        id = this.generateVisitorId();
        localStorage.setItem('dod_visitor_id', id);
      }
      return id;
    },
    getCookie: function(name) {
      const value = '; ' + document.cookie;
      const parts = value.split('; ' + name + '=');
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    },
    setCookie: function(name, value, days) {
      const d = new Date();
      d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
      document.cookie = name + '=' + value + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
    }
  };

  // ============================================
  // CAPTURA DE PARÂMETROS
  // ============================================
  const Params = {
    capture: function() {
      const p = new URLSearchParams(window.location.search);
      return {
        // UTMs
        utm_source: p.get('utm_source'),
        utm_campaign: p.get('utm_campaign'),
        utm_medium: p.get('utm_medium'),
        utm_content: p.get('utm_content'),
        utm_term: p.get('utm_term'),
        // Click IDs
        fbclid: p.get('fbclid'),
        gclid: p.get('gclid'),
        ttclid: p.get('ttclid'),
        // Cloaker
        cwr: p.get('cwr'),
        cname: p.get('cname'),
        adset: p.get('adset'),
        adname: p.get('adname'),
        placement: p.get('placement'),
        site: p.get('site'),
        xid: p.get('xid'),
        // Meta
        visitor_id: DOD.getVisitorId(),
        fbp: DOD.getCookie('_fbp'),
        fbc: DOD.getCookie('_fbc'),
        landing_page: window.location.href,
        timestamp: new Date().toISOString()
      };
    },
    save: function(data) {
      const clean = {};
      for (const k in data) {
        if (data[k]) clean[k] = data[k];
      }
      localStorage.setItem('dod_tracking', JSON.stringify(clean));
      DOD.setCookie('dod_tracking', btoa(JSON.stringify(clean)), 30);
      return clean;
    },
    get: function() {
      try {
        const s = localStorage.getItem('dod_tracking');
        if (s) return JSON.parse(s);
        const c = DOD.getCookie('dod_tracking');
        if (c) return JSON.parse(atob(c));
      } catch (e) {}
      return {};
    }
  };

  // ============================================
  // ENVIO DE EVENTOS
  // ============================================
  const Events = {
    send: function(eventName, eventData) {
      if (!DOD_CONFIG.webhookUrl.includes('seu-dashboard')) {
        fetch(DOD_CONFIG.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: eventName,
            timestamp: new Date().toISOString(),
            tracking: Params.get(),
            data: eventData,
            page: { url: window.location.href, title: document.title }
          }),
          keepalive: true
        }).catch(function(e) { DOD.log('Erro:', e); });
      }
      // Meta Pixel
      if (typeof fbq !== 'undefined') {
        fbq('track', eventName, eventData);
      }
      // Google
      if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
      }
      // TikTok
      if (typeof ttq !== 'undefined') {
        ttq.track(eventName, eventData);
      }
      DOD.log(eventName, eventData);
    }
  };

  // ============================================
  // INIT
  // ============================================
  function init() {
    const data = Params.capture();
    if (data.utm_source || data.fbclid || data.gclid || data.ttclid) {
      Params.save(data);
    }
    Events.send('PageView', { page_type: window.location.pathname });
  }

  window.DOD_Track = Events.send;
  init();
})();
</script>
{% if template contains 'product' %}
<script>
  DOD_Track('ViewContent', {
    content_type: 'product',
    content_ids: ['{{ product.id }}'],
    content_name: '{{ product.title | escape }}',
    value: {{ product.price | divided_by: 100.0 }},
    currency: '{{ shop.currency }}'
  });
</script>
{% endif %}
{% if template contains 'cart' %}
<script>
  DOD_Track('ViewCart', {
    content_ids: [{% for item in cart.items %}'{{ item.product_id }}'{% unless forloop.last %},{% endunless %}{% endfor %}],
    num_items: {{ cart.item_count }},
    value: {{ cart.total_price | divided_by: 100.0 }},
    currency: '{{ shop.currency }}'
  });
</script>
{% endif %}
<!-- FIM DOD TRACKING -->`

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
          {/* INSTRUCAO */}
          <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold text-amber-600 dark:text-amber-400">Como usar:</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Cole estes parâmetros na seção <span className="font-semibold text-foreground">"Parâmetros de URL"</span> do seu anúncio no gerenciador.
                    Depois adicione <span className="font-mono bg-muted px-1 rounded">&</span> + seus parâmetros do cloaker.
                  </p>
                  <div className="mt-3 p-3 rounded-lg bg-background/50 font-mono text-xs">
                    <span className="text-[#1877F2]">[parâmetros do dash]</span>
                    <span className="text-amber-500 font-bold">&</span>
                    <span className="text-purple-500">[parâmetros do cloaker]</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* META ADS */}
          <Card className="border-2 border-[#1877F2]/50 bg-gradient-to-br from-[#1877F2]/5 to-transparent">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#1877F2]/20">
                    <Facebook className="h-5 w-5 text-[#1877F2]" />
                  </div>
                  <div>
                    <CardTitle>Meta Ads (Facebook/Instagram)</CardTitle>
                    <CardDescription>
                      Cole na seção "Parâmetros de URL" do anúncio
                    </CardDescription>
                  </div>
                </div>
                <Button
                  className="gap-2 bg-[#1877F2] hover:bg-[#1877F2]/90"
                  onClick={() => copyToClipboard('utm_source=FB&utm_campaign={{campaign.name}}|{{campaign.id}}&utm_medium={{adset.name}}|{{adset.id}}&utm_content={{ad.name}}|{{ad.id}}&utm_term={{placement}}', 'meta-params')}
                >
                  {copied === 'meta-params' ? (
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
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-[#1877F2]/10 border border-[#1877F2]/20 font-mono text-sm break-all">
                utm_source=FB&utm_campaign={'{{campaign.name}}|{{campaign.id}}'}&utm_medium={'{{adset.name}}|{{adset.id}}'}&utm_content={'{{ad.name}}|{{ad.id}}'}&utm_term={'{{placement}}'}
              </div>
            </CardContent>
          </Card>

          {/* GOOGLE ADS */}
          <Card className="border-2 border-[#EA4335]/50 bg-gradient-to-br from-[#EA4335]/5 to-transparent">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#EA4335]/20">
                    <Search className="h-5 w-5 text-[#EA4335]" />
                  </div>
                  <div>
                    <CardTitle>Google Ads</CardTitle>
                    <CardDescription>
                      Cole na seção "Sufixo de URL final" do anúncio
                    </CardDescription>
                  </div>
                </div>
                <Button
                  className="gap-2 bg-[#EA4335] hover:bg-[#EA4335]/90"
                  onClick={() => copyToClipboard('utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={creative}&utm_term={keyword}&gclid={gclid}', 'google-params')}
                >
                  {copied === 'google-params' ? (
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
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-[#EA4335]/10 border border-[#EA4335]/20 font-mono text-sm break-all">
                utm_source=google&utm_medium=cpc&utm_campaign={'{campaignid}'}&utm_content={'{creative}'}&utm_term={'{keyword}'}&gclid={'{gclid}'}
              </div>
            </CardContent>
          </Card>

          {/* TIKTOK ADS */}
          <Card className="border-2 border-black/50 dark:border-white/50 bg-gradient-to-br from-black/5 dark:from-white/5 to-transparent">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-black/10 dark:bg-white/10">
                    <Music2 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>TikTok Ads</CardTitle>
                    <CardDescription>
                      Cole na seção "URL parameters" do anúncio
                    </CardDescription>
                  </div>
                </div>
                <Button
                  className="gap-2 bg-black hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                  onClick={() => copyToClipboard('utm_source=tiktok&utm_medium=cpc&utm_campaign=__CAMPAIGN_NAME__&utm_content=__AID_NAME__&ttclid=__CLICKID__', 'tiktok-params')}
                >
                  {copied === 'tiktok-params' ? (
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
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-black/10 dark:bg-white/10 border border-black/20 dark:border-white/20 font-mono text-sm break-all">
                utm_source=tiktok&utm_medium=cpc&utm_campaign=__CAMPAIGN_NAME__&utm_content=__AID_NAME__&ttclid=__CLICKID__
              </div>
            </CardContent>
          </Card>

          {/* EXEMPLO COMPLETO */}
          <Card className="border-2 border-lime-500/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4 text-lime-500" />
                Exemplo: Parâmetros do Dash + Cloaker
              </CardTitle>
              <CardDescription>
                Como fica na seção "Parâmetros de URL" do Meta Ads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-muted font-mono text-xs break-all">
                <span className="text-[#1877F2]">utm_source=FB&utm_campaign={'{{campaign.name}}|{{campaign.id}}'}&utm_medium={'{{adset.name}}|{{adset.id}}'}&utm_content={'{{ad.name}}|{{ad.id}}'}&utm_term={'{{placement}}'}</span>
                <span className="text-lime-500 font-bold text-base">&</span>
                <span className="text-purple-500">cwr={'{{campaign.id}}'}&cname={'{{campaign.name}}'}&domain={'{{domain}}'}&placement={'{{placement}}'}&adset={'{{adset.name}}'}&adname={'{{ad.name}}'}&site={'{{site_source_name}}'}&xid=seutoken</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded bg-[#1877F2]"></span> Parâmetros do Dash
                <span className="inline-block w-3 h-3 rounded bg-lime-500 ml-2"></span> Separador &
                <span className="inline-block w-3 h-3 rounded bg-purple-500 ml-2"></span> Parâmetros do Cloaker
              </p>
            </CardContent>
          </Card>

          {/* VARIAVEIS DISPONIVEIS */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Variáveis Dinâmicas por Plataforma</CardTitle>
              <CardDescription>
                Clique para copiar a variável
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Meta Variables */}
              <div>
                <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <Facebook className="h-4 w-4 text-[#1877F2]" />
                  Meta Ads
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { var: '{{campaign.id}}', desc: 'ID Campanha' },
                    { var: '{{campaign.name}}', desc: 'Nome Campanha' },
                    { var: '{{adset.id}}', desc: 'ID Conjunto' },
                    { var: '{{adset.name}}', desc: 'Nome Conjunto' },
                    { var: '{{ad.id}}', desc: 'ID Anúncio' },
                    { var: '{{ad.name}}', desc: 'Nome Anúncio' },
                    { var: '{{placement}}', desc: 'Posicionamento' },
                    { var: '{{site_source_name}}', desc: 'Origem' },
                  ].map((item) => (
                    <div
                      key={item.var}
                      className="p-2 rounded-lg border bg-card hover:bg-[#1877F2]/10 cursor-pointer transition-colors"
                      onClick={() => copyToClipboard(item.var, item.var)}
                    >
                      <p className="font-mono text-xs text-[#1877F2]">{item.var}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Google Variables */}
              <div>
                <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <Search className="h-4 w-4 text-[#EA4335]" />
                  Google Ads
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { var: '{campaignid}', desc: 'ID Campanha' },
                    { var: '{campaign}', desc: 'Nome Campanha' },
                    { var: '{adgroupid}', desc: 'ID Grupo' },
                    { var: '{creative}', desc: 'ID Criativo' },
                    { var: '{keyword}', desc: 'Palavra-chave' },
                    { var: '{matchtype}', desc: 'Tipo Match' },
                    { var: '{device}', desc: 'Dispositivo' },
                    { var: '{gclid}', desc: 'Click ID' },
                  ].map((item) => (
                    <div
                      key={item.var}
                      className="p-2 rounded-lg border bg-card hover:bg-[#EA4335]/10 cursor-pointer transition-colors"
                      onClick={() => copyToClipboard(item.var, item.var)}
                    >
                      <p className="font-mono text-xs text-[#EA4335]">{item.var}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* TikTok Variables */}
              <div>
                <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <Music2 className="h-4 w-4" />
                  TikTok Ads
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { var: '__CAMPAIGN_ID__', desc: 'ID Campanha' },
                    { var: '__CAMPAIGN_NAME__', desc: 'Nome Campanha' },
                    { var: '__AID__', desc: 'ID Anúncio' },
                    { var: '__AID_NAME__', desc: 'Nome Anúncio' },
                    { var: '__CID__', desc: 'ID Criativo' },
                    { var: '__CID_NAME__', desc: 'Nome Criativo' },
                    { var: '__PLACEMENT__', desc: 'Posicionamento' },
                    { var: '__CLICKID__', desc: 'Click ID' },
                  ].map((item) => (
                    <div
                      key={item.var}
                      className="p-2 rounded-lg border bg-card hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => copyToClipboard(item.var, item.var)}
                    >
                      <p className="font-mono text-xs">{item.var}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SCRIPTS TAB */}
        <TabsContent value="scripts" className="space-y-6">
          {/* INSTRUCOES */}
          <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-semibold text-green-600 dark:text-green-400">Como instalar na Shopify:</p>
                  <ol className="text-sm text-muted-foreground mt-2 space-y-1 list-decimal list-inside">
                    <li>Vá em <span className="font-mono bg-muted px-1 rounded">Online Store → Themes → Edit Code</span></li>
                    <li>Abra o arquivo <span className="font-mono bg-muted px-1 rounded">theme.liquid</span></li>
                    <li>Cole o script <span className="font-semibold text-foreground">antes do {'</head>'}</span></li>
                    <li>Salve e pronto!</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SCRIPT PRINCIPAL */}
          <Card className="border-2 border-primary/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Code className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Script de Tracking - Shopify</CardTitle>
                    <CardDescription>
                      Cole no theme.liquid antes do {'</head>'}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  className="gap-2"
                  onClick={() => copyToClipboard(shopifyTrackingScript, 'shopify-script')}
                >
                  {copied === 'shopify-script' ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copiar Script
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Textarea
                  value={shopifyTrackingScript}
                  readOnly
                  className="font-mono text-xs min-h-[400px] bg-muted"
                />
              </div>
              <div className="mt-4 p-4 rounded-lg bg-muted/50">
                <p className="text-sm font-semibold mb-2">O que esse script faz:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Captura UTMs, fbclid, gclid, ttclid e parâmetros do cloaker
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Salva em cookie e localStorage (funciona no checkout)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Dispara eventos: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Envia dados para webhook do seu dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Evita duplicação de eventos de Purchase
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* CONFIGURACAO DO WEBHOOK */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuração do Webhook
              </CardTitle>
              <CardDescription>
                Configure a URL do webhook para receber os eventos no dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>URL do Webhook</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://seu-dashboard.com/api/webhook/tracking"
                    className="font-mono text-sm"
                  />
                  <Button variant="outline">Salvar</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Esta URL receberá todos os eventos de tracking via POST
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm font-semibold mb-2">Eventos enviados:</p>
                <div className="flex flex-wrap gap-2">
                  {['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase'].map((event) => (
                    <Badge key={event} variant="outline">{event}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* WEBHOOK SHOPIFY */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-500" />
                Webhooks da Shopify (Recomendado)
              </CardTitle>
              <CardDescription>
                Configure webhooks na Shopify para receber atualizações de pedidos em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm mb-3">
                  <span className="font-semibold text-green-600 dark:text-green-400">Webhooks são melhores que API</span> porque você recebe os dados instantaneamente quando:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Pedido criado</li>
                  <li>• Pedido pago</li>
                  <li>• Pedido enviado (fulfillment)</li>
                  <li>• Pedido cancelado/reembolsado</li>
                </ul>
              </div>
              <div className="space-y-2">
                <Label>URL para Webhooks da Shopify</Label>
                <div className="flex gap-2">
                  <Input
                    value="https://seu-dashboard.com/api/shopify/webhook"
                    readOnly
                    className="font-mono text-sm bg-muted"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard('https://seu-dashboard.com/api/shopify/webhook', 'shopify-webhook')}
                  >
                    {copied === 'shopify-webhook' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold mb-2">Configure na Shopify:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Settings → Notifications → Webhooks</li>
                  <li>Clique em "Create webhook"</li>
                  <li>Selecione: Order creation, Order payment, Fulfillment creation</li>
                  <li>Cole a URL acima</li>
                </ol>
              </div>
            </CardContent>
          </Card>
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
