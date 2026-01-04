'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Store,
  CreditCard,
  Truck,
  Check,
  X,
  Plus,
  Settings,
  Globe2,
  ChevronRight,
  Zap,
  Code,
  Link2,
  MousePointer,
  Eye,
  ShoppingCart,
  DollarSign,
  Target,
  Copy,
  RefreshCw,
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  FileCode,
  Webhook,
  Database,
  Layers,
  Send,
  Play,
  Pause,
  Trash2,
  Edit,
  ExternalLink,
  Info,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Filter,
} from 'lucide-react'
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
  DialogTrigger,
} from '@/components/ui/dialog'

// ============ INTERFACES ============

interface TrackingDomain {
  id: string
  domain: string
  status: 'active' | 'pending' | 'error'
  ssl: boolean
  createdAt: Date
}

interface UTMConfig {
  source: string
  medium: string
  campaign: string
  content: string
  term: string
}

interface SubIDConfig {
  sub1: string
  sub2: string
  sub3: string
  sub4: string
  sub5: string
  sub6: string
  sub7: string
  sub8: string
}

interface CloakerConfig {
  id: string
  name: string
  type: 'the-white-rabbit' | 'cloakerly' | 'trafficarmor' | 'linktrackr' | 'custom'
  apiKey: string
  apiSecret: string
  enabled: boolean
  safePage: string
  moneyPage: string
  settings: {
    blockBots: boolean
    blockVPN: boolean
    blockDatacenters: boolean
    geoTargeting: boolean
    allowedCountries: string[]
    blockRepeatedVisits: boolean
  }
}

interface PostbackConfig {
  id: string
  name: string
  event: 'pageview' | 'click' | 'lead' | 'initiate_checkout' | 'purchase' | 'upsell' | 'downsell' | 'delivered' | 'returned'
  url: string
  method: 'GET' | 'POST'
  enabled: boolean
  parameters: { key: string; value: string }[]
  lastTriggered?: Date
  successCount: number
  failCount: number
}

interface TrackingEvent {
  id: string
  type: string
  timestamp: Date
  data: {
    clickId?: string
    fbclid?: string
    gclid?: string
    ttclid?: string
    ip?: string
    userAgent?: string
    country?: string
    value?: number
    orderId?: string
    utm?: UTMConfig
    subIds?: SubIDConfig
  }
}

interface PixelConfig {
  id: string
  platform: 'meta' | 'google' | 'tiktok' | 'taboola' | 'kwai'
  pixelId: string
  accessToken?: string
  enabled: boolean
  events: string[]
}

// ============ INTEGRATION DATA - STARTS EMPTY ============

const mockDomains: TrackingDomain[] = []

const mockCloakers: CloakerConfig[] = []

const mockPostbacks: PostbackConfig[] = []

const mockEvents: TrackingEvent[] = []

const mockPixels: PixelConfig[] = []

// ============ COMPONENT ============

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState('tracking')
  const [domains, setDomains] = useState<TrackingDomain[]>(mockDomains)
  const [cloakers, setCloakers] = useState<CloakerConfig[]>(mockCloakers)
  const [postbacks, setPostbacks] = useState<PostbackConfig[]>(mockPostbacks)
  const [events, setEvents] = useState<TrackingEvent[]>(mockEvents)
  const [pixels, setPixels] = useState<PixelConfig[]>(mockPixels)
  const [showScript, setShowScript] = useState(false)
  const [scriptType, setScriptType] = useState<'landing' | 'checkout' | 'thankyou'>('landing')
  const [copied, setCopied] = useState(false)
  const [showAddPostback, setShowAddPostback] = useState(false)
  const [showAddCloaker, setShowAddCloaker] = useState(false)
  const [newPostback, setNewPostback] = useState<Partial<PostbackConfig>>({
    event: 'initiate_checkout',
    method: 'POST',
    enabled: true,
    parameters: [],
  })

  // UTM & SubID Config State
  const [utmConfig, setUtmConfig] = useState<UTMConfig>({
    source: 'utm_source',
    medium: 'utm_medium',
    campaign: 'utm_campaign',
    content: 'utm_content',
    term: 'utm_term',
  })

  const [subIdConfig, setSubIdConfig] = useState<SubIDConfig>({
    sub1: 'sub1',
    sub2: 'sub2',
    sub3: 'sub3',
    sub4: 'sub4',
    sub5: 'sub5',
    sub6: 'sub6',
    sub7: 'sub7',
    sub8: 'sub8',
  })

  // Additional tracking params for cloakers
  const [trackingParams, setTrackingParams] = useState({
    fbclid: true,
    gclid: true,
    ttclid: true,
    externalId: true,
    clickId: true,
    zoneId: false,
    campaignId: true,
    adId: true,
    adsetId: true,
    placement: true,
  })

  // Attribution settings
  const [attribution, setAttribution] = useState({
    model: 'last-click' as 'first-click' | 'last-click' | 'linear',
    window: 7, // days
    crossDevice: true,
    firstPartyCookies: true,
    serverSideTracking: true,
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Generate tracking script based on type
  const generateScript = (type: 'landing' | 'checkout' | 'thankyou') => {
    const baseScript = `<!-- DOD Tracking Script v2.0 - ${type.toUpperCase()} -->
<script>
(function(d,o,d_id) {
  // DOD Tracking Configuration
  window.DOD = window.DOD || {};
  window.DOD.config = {
    trackingId: '${domains[0]?.domain || 'YOUR_TRACKING_DOMAIN'}',
    debug: false,
    attribution: '${attribution.model}',
    attributionWindow: ${attribution.window},
    crossDevice: ${attribution.crossDevice},
    serverSide: ${attribution.serverSideTracking}
  };

  // UTM Parameters Capture
  window.DOD.utm = {
    source: new URLSearchParams(window.location.search).get('${utmConfig.source}') || '',
    medium: new URLSearchParams(window.location.search).get('${utmConfig.medium}') || '',
    campaign: new URLSearchParams(window.location.search).get('${utmConfig.campaign}') || '',
    content: new URLSearchParams(window.location.search).get('${utmConfig.content}') || '',
    term: new URLSearchParams(window.location.search).get('${utmConfig.term}') || ''
  };

  // SubID Parameters (Cloaker Compatible)
  window.DOD.subIds = {
    sub1: new URLSearchParams(window.location.search).get('${subIdConfig.sub1}') || '',
    sub2: new URLSearchParams(window.location.search).get('${subIdConfig.sub2}') || '',
    sub3: new URLSearchParams(window.location.search).get('${subIdConfig.sub3}') || '',
    sub4: new URLSearchParams(window.location.search).get('${subIdConfig.sub4}') || '',
    sub5: new URLSearchParams(window.location.search).get('${subIdConfig.sub5}') || '',
    sub6: new URLSearchParams(window.location.search).get('${subIdConfig.sub6}') || '',
    sub7: new URLSearchParams(window.location.search).get('${subIdConfig.sub7}') || '',
    sub8: new URLSearchParams(window.location.search).get('${subIdConfig.sub8}') || ''
  };

  // Click IDs (Ad Platforms)
  window.DOD.clickIds = {
    ${trackingParams.fbclid ? "fbclid: new URLSearchParams(window.location.search).get('fbclid') || ''," : ''}
    ${trackingParams.gclid ? "gclid: new URLSearchParams(window.location.search).get('gclid') || ''," : ''}
    ${trackingParams.ttclid ? "ttclid: new URLSearchParams(window.location.search).get('ttclid') || ''," : ''}
    ${trackingParams.externalId ? "external_id: new URLSearchParams(window.location.search).get('external_id') || ''," : ''}
    ${trackingParams.clickId ? "click_id: new URLSearchParams(window.location.search).get('click_id') || ''," : ''}
  };

  // Cloaker Parameters (The White Rabbit Compatible)
  window.DOD.cloaker = {
    ${trackingParams.zoneId ? "zone_id: new URLSearchParams(window.location.search).get('zone_id') || ''," : ''}
    ${trackingParams.campaignId ? "campaign_id: new URLSearchParams(window.location.search).get('campaign_id') || ''," : ''}
    ${trackingParams.adId ? "ad_id: new URLSearchParams(window.location.search).get('ad_id') || ''," : ''}
    ${trackingParams.adsetId ? "adset_id: new URLSearchParams(window.location.search).get('adset_id') || ''," : ''}
    ${trackingParams.placement ? "placement: new URLSearchParams(window.location.search).get('placement') || ''," : ''}
  };

  // Browser Fingerprint (COD Tracking)
  window.DOD.fingerprint = function() {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('DOD', 2, 2);
    return canvas.toDataURL().slice(-50);
  };

  // Session Management
  window.DOD.session = {
    id: localStorage.getItem('dod_session_id') || (function() {
      var id = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem('dod_session_id', id);
      return id;
    })(),
    started: localStorage.getItem('dod_session_start') || Date.now(),
    pageviews: parseInt(localStorage.getItem('dod_pageviews') || '0') + 1
  };
  localStorage.setItem('dod_pageviews', window.DOD.session.pageviews);

  // First Party Cookie for Attribution
  ${attribution.firstPartyCookies ? `
  (function() {
    var params = Object.assign({}, window.DOD.utm, window.DOD.clickIds, window.DOD.subIds);
    var existing = document.cookie.match(/dod_attribution=([^;]+)/);
    if (!existing && Object.values(params).some(v => v)) {
      var expires = new Date(Date.now() + ${attribution.window} * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = 'dod_attribution=' + encodeURIComponent(JSON.stringify(params)) + ';expires=' + expires + ';path=/;SameSite=Lax';
    }
  })();` : ''}

  // Track Function
  window.DOD.track = function(event, data) {
    var payload = {
      event: event,
      timestamp: Date.now(),
      url: window.location.href,
      referrer: document.referrer,
      session: window.DOD.session,
      utm: window.DOD.utm,
      subIds: window.DOD.subIds,
      clickIds: window.DOD.clickIds,
      cloaker: window.DOD.cloaker,
      fingerprint: window.DOD.fingerprint(),
      data: data || {}
    };

    ${attribution.serverSideTracking ? `
    // Server-Side Tracking (S2S)
    fetch('https://' + window.DOD.config.trackingId + '/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(function() {});` : `
    // Client-Side Tracking
    var img = new Image();
    img.src = 'https://' + window.DOD.config.trackingId + '/pixel.gif?' +
      'e=' + encodeURIComponent(event) +
      '&d=' + encodeURIComponent(JSON.stringify(payload));`}

    // Debug Mode
    if (window.DOD.config.debug) {
      console.log('[DOD Track]', event, payload);
    }
  };

  // Auto-track PageView
  window.DOD.track('pageview');
  `

    if (type === 'landing') {
      return baseScript + `
  // Landing Page Specific - Click Tracking
  document.addEventListener('click', function(e) {
    var target = e.target.closest('a, button, [data-dod-click]');
    if (target) {
      window.DOD.track('click', {
        element: target.tagName,
        text: target.innerText?.substring(0, 50),
        href: target.href || '',
        class: target.className
      });
    }
  });

  // Scroll Depth Tracking (COD Important)
  var scrollDepths = [25, 50, 75, 100];
  var trackedDepths = [];
  window.addEventListener('scroll', function() {
    var depth = Math.round((window.scrollY + window.innerHeight) / document.body.scrollHeight * 100);
    scrollDepths.forEach(function(d) {
      if (depth >= d && trackedDepths.indexOf(d) === -1) {
        trackedDepths.push(d);
        window.DOD.track('scroll_depth', { depth: d });
      }
    });
  });

  // Time on Page Tracking
  var timeOnPage = 0;
  setInterval(function() {
    timeOnPage += 10;
    if ([30, 60, 120, 300].indexOf(timeOnPage) > -1) {
      window.DOD.track('time_on_page', { seconds: timeOnPage });
    }
  }, 10000);

})(document, window, 'DOD');
</script>
<!-- End DOD Tracking Script -->`
    }

    if (type === 'checkout') {
      return baseScript + `
  // Checkout Page Specific - Form Tracking

  // Track form field interactions
  document.querySelectorAll('input, select, textarea').forEach(function(field) {
    field.addEventListener('focus', function() {
      window.DOD.track('field_focus', {
        field: this.name || this.id,
        type: this.type
      });
    });

    field.addEventListener('blur', function() {
      window.DOD.track('field_complete', {
        field: this.name || this.id,
        type: this.type,
        filled: this.value.length > 0
      });
    });
  });

  // Track InitiateCheckout (IC) - Critical for COD
  window.DOD.trackIC = function(value, currency, items) {
    window.DOD.track('initiate_checkout', {
      value: value,
      currency: currency || 'BRL',
      items: items || [],
      form_fields_filled: document.querySelectorAll('input:valid').length
    });

    // Fire pixel events
    if (typeof fbq !== 'undefined') {
      fbq('track', 'InitiateCheckout', { value: value, currency: currency || 'BRL' });
    }
    if (typeof gtag !== 'undefined') {
      gtag('event', 'begin_checkout', { value: value, currency: currency || 'BRL' });
    }
    if (typeof ttq !== 'undefined') {
      ttq.track('InitiateCheckout', { value: value, currency: currency || 'BRL' });
    }
  };

  // Track Lead (Form Submit) - Important for COD
  window.DOD.trackLead = function(data) {
    window.DOD.track('lead', {
      phone: data.phone ? 'filled' : 'empty',
      email: data.email ? 'filled' : 'empty',
      name: data.name ? 'filled' : 'empty',
      address: data.address ? 'filled' : 'empty',
      city: data.city || '',
      state: data.state || ''
    });

    if (typeof fbq !== 'undefined') {
      fbq('track', 'Lead');
    }
  };

  // Auto-detect checkout form submission
  document.addEventListener('submit', function(e) {
    var form = e.target;
    if (form.querySelector('[name*="phone"], [name*="telefone"], [name*="cel"]')) {
      var phoneField = form.querySelector('[name*="phone"], [name*="telefone"], [name*="cel"]');
      window.DOD.trackLead({
        phone: phoneField ? phoneField.value : '',
        email: form.querySelector('[name*="email"]')?.value || '',
        name: form.querySelector('[name*="name"], [name*="nome"]')?.value || ''
      });
    }
  });

  // Track Add Payment Info
  window.DOD.trackPaymentInfo = function(method) {
    window.DOD.track('add_payment_info', {
      payment_method: method
    });

    if (typeof fbq !== 'undefined') {
      fbq('track', 'AddPaymentInfo');
    }
  };

})(document, window, 'DOD');
</script>
<!-- End DOD Checkout Tracking Script -->`
    }

    if (type === 'thankyou') {
      return baseScript + `
  // Thank You Page - Purchase/Conversion Tracking

  // Track Purchase - Get data from URL or page
  window.DOD.trackPurchase = function(orderId, value, currency, items) {
    // Retrieve attribution from cookie
    var attribution = {};
    var attrCookie = document.cookie.match(/dod_attribution=([^;]+)/);
    if (attrCookie) {
      try { attribution = JSON.parse(decodeURIComponent(attrCookie[1])); } catch(e) {}
    }

    window.DOD.track('purchase', {
      order_id: orderId,
      value: value,
      currency: currency || 'BRL',
      items: items || [],
      attribution: attribution,
      // COD specific
      payment_method: 'cod',
      delivery_estimate: null
    });

    // Fire all pixel events
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Purchase', {
        value: value,
        currency: currency || 'BRL',
        content_ids: items?.map(i => i.id) || [],
        content_type: 'product'
      });
    }
    if (typeof gtag !== 'undefined') {
      gtag('event', 'purchase', {
        transaction_id: orderId,
        value: value,
        currency: currency || 'BRL'
      });
    }
    if (typeof ttq !== 'undefined') {
      ttq.track('CompletePayment', {
        value: value,
        currency: currency || 'BRL'
      });
    }

    // Clear session for new attribution
    localStorage.removeItem('dod_attribution');
  };

  // Track Upsell Accept
  window.DOD.trackUpsell = function(orderId, value, productId) {
    window.DOD.track('upsell', {
      order_id: orderId,
      value: value,
      product_id: productId
    });
  };

  // Track Downsell Accept
  window.DOD.trackDownsell = function(orderId, value, productId) {
    window.DOD.track('downsell', {
      order_id: orderId,
      value: value,
      product_id: productId
    });
  };

  // Auto-detect purchase from URL params or data layer
  (function() {
    var params = new URLSearchParams(window.location.search);
    var orderId = params.get('order_id') || params.get('pedido') || params.get('order');
    var value = params.get('value') || params.get('valor') || params.get('total');

    if (orderId && value) {
      window.DOD.trackPurchase(orderId, parseFloat(value), 'BRL');
    }
  })();

})(document, window, 'DOD');
</script>
<!-- End DOD Thank You Page Script -->`
    }

    return baseScript
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'pageview': return <Eye className="h-4 w-4 text-blue-500" />
      case 'click': return <MousePointer className="h-4 w-4 text-green-500" />
      case 'initiate_checkout': return <ShoppingCart className="h-4 w-4 text-orange-500" />
      case 'purchase': return <DollarSign className="h-4 w-4 text-emerald-500" />
      case 'lead': return <Users className="h-4 w-4 text-purple-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'pageview': return 'PageView'
      case 'click': return 'Click'
      case 'initiate_checkout': return 'InitiateCheckout (IC)'
      case 'purchase': return 'Purchase'
      case 'lead': return 'Lead'
      case 'upsell': return 'Upsell'
      case 'downsell': return 'Downsell'
      case 'delivered': return 'Entregue'
      case 'returned': return 'Devolvido'
      default: return type
    }
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds}s atrás`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m atrás`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`
    return `${Math.floor(seconds / 86400)}d atrás`
  }

  // Stats calculation
  const todayEvents = events.filter(e => {
    const today = new Date()
    return e.timestamp.toDateString() === today.toDateString()
  })
  const pageviews = todayEvents.filter(e => e.type === 'pageview').length
  const clicks = todayEvents.filter(e => e.type === 'click').length
  const ics = todayEvents.filter(e => e.type === 'initiate_checkout').length
  const purchases = todayEvents.filter(e => e.type === 'purchase').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrações & Tracking</h1>
          <p className="text-muted-foreground">
            Configure tracking avançado, pixels, cloakers e postbacks para COD
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowScript(true)}>
            <Code className="mr-2 h-4 w-4" />
            Gerar Script
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Integração
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pageviews}</p>
                <p className="text-xs text-muted-foreground">PageViews Hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <MousePointer className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{clicks}</p>
                <p className="text-xs text-muted-foreground">Cliques Hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ics}</p>
                <p className="text-xs text-muted-foreground">IC Hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{purchases}</p>
                <p className="text-xs text-muted-foreground">Vendas Hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ics > 0 ? ((purchases / ics) * 100).toFixed(1) : 0}%</p>
                <p className="text-xs text-muted-foreground">Conv. IC → Venda</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="tracking">
            <Target className="mr-2 h-4 w-4" />
            Tracking
          </TabsTrigger>
          <TabsTrigger value="pixels">
            <Code className="mr-2 h-4 w-4" />
            Pixels
          </TabsTrigger>
          <TabsTrigger value="cloakers">
            <Shield className="mr-2 h-4 w-4" />
            Cloakers
          </TabsTrigger>
          <TabsTrigger value="postbacks">
            <Webhook className="mr-2 h-4 w-4" />
            Postbacks
          </TabsTrigger>
          <TabsTrigger value="events">
            <Activity className="mr-2 h-4 w-4" />
            Eventos
          </TabsTrigger>
          <TabsTrigger value="platforms">
            <Layers className="mr-2 h-4 w-4" />
            Plataformas
          </TabsTrigger>
        </TabsList>

        {/* TRACKING TAB */}
        <TabsContent value="tracking" className="space-y-6 mt-6">
          {/* Domains */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe2 className="h-5 w-5" />
                Domínios de Tracking
              </CardTitle>
              <CardDescription>
                Configure seus domínios personalizados para tracking first-party
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {domains.map(domain => (
                  <div key={domain.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {domain.status === 'active' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : domain.status === 'pending' ? (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">{domain.domain}</p>
                        <p className="text-sm text-muted-foreground">
                          {domain.ssl && '🔒 SSL Ativo'} • Adicionado em {domain.createdAt.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={domain.status === 'active' ? 'success' : 'secondary'}>
                        {domain.status === 'active' ? 'Ativo' : domain.status === 'pending' ? 'Pendente' : 'Erro'}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Domínio
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* UTM Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Parâmetros UTM
              </CardTitle>
              <CardDescription>
                Configure os nomes dos parâmetros UTM para captura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Input
                    value={utmConfig.source}
                    onChange={(e) => setUtmConfig({...utmConfig, source: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Medium</Label>
                  <Input
                    value={utmConfig.medium}
                    onChange={(e) => setUtmConfig({...utmConfig, medium: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Campaign</Label>
                  <Input
                    value={utmConfig.campaign}
                    onChange={(e) => setUtmConfig({...utmConfig, campaign: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Input
                    value={utmConfig.content}
                    onChange={(e) => setUtmConfig({...utmConfig, content: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Term</Label>
                  <Input
                    value={utmConfig.term}
                    onChange={(e) => setUtmConfig({...utmConfig, term: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SubIDs (Cloaker Compatible) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                SubIDs (Compatível com Cloakers)
              </CardTitle>
              <CardDescription>
                Configure SubIDs para tracking granular - compatível com The White Rabbit e outros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(subIdConfig).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label>{key.toUpperCase()}</Label>
                    <Input
                      value={value}
                      onChange={(e) => setSubIdConfig({...subIdConfig, [key]: e.target.value})}
                      placeholder={`Parâmetro ${key}`}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <Info className="inline h-4 w-4 mr-1" />
                  Use SubIDs para passar dados do cloaker. Exemplo: <code className="bg-background px-1 rounded">?sub1=creative_id&sub2=adset_id&sub3=campaign_id</code>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Click IDs & Ad Platform Params */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="h-5 w-5" />
                Click IDs & Parâmetros de Plataformas
              </CardTitle>
              <CardDescription>
                Ative/desative a captura de parâmetros de cada plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(trackingParams).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <Label className="text-sm font-medium">{key}</Label>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) => setTrackingParams({...trackingParams, [key]: checked})}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Attribution Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Configurações de Atribuição
              </CardTitle>
              <CardDescription>
                Configure o modelo de atribuição para conversões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label>Modelo de Atribuição</Label>
                  <Select
                    value={attribution.model}
                    onValueChange={(value: 'first-click' | 'last-click' | 'linear') =>
                      setAttribution({...attribution, model: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first-click">Primeiro Clique</SelectItem>
                      <SelectItem value="last-click">Último Clique</SelectItem>
                      <SelectItem value="linear">Linear</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Janela de Atribuição (dias)</Label>
                  <Select
                    value={attribution.window.toString()}
                    onValueChange={(value) => setAttribution({...attribution, window: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 dia</SelectItem>
                      <SelectItem value="7">7 dias</SelectItem>
                      <SelectItem value="14">14 dias</SelectItem>
                      <SelectItem value="28">28 dias</SelectItem>
                      <SelectItem value="30">30 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>First-Party Cookies</Label>
                    <Switch
                      checked={attribution.firstPartyCookies}
                      onCheckedChange={(checked) => setAttribution({...attribution, firstPartyCookies: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Cross-Device</Label>
                    <Switch
                      checked={attribution.crossDevice}
                      onCheckedChange={(checked) => setAttribution({...attribution, crossDevice: checked})}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Server-Side Tracking</Label>
                    <Switch
                      checked={attribution.serverSideTracking}
                      onCheckedChange={(checked) => setAttribution({...attribution, serverSideTracking: checked})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PIXELS TAB */}
        <TabsContent value="pixels" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pixels Configurados</CardTitle>
              <CardDescription>
                Gerencie seus pixels de conversão das plataformas de anúncio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pixels.map(pixel => (
                  <div key={pixel.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        pixel.platform === 'meta' ? 'bg-[#1877F2]/10' :
                        pixel.platform === 'google' ? 'bg-[#EA4335]/10' :
                        pixel.platform === 'tiktok' ? 'bg-black/10' :
                        'bg-gray-500/10'
                      }`}>
                        {pixel.platform === 'meta' && <span className="text-[#1877F2] font-bold">f</span>}
                        {pixel.platform === 'google' && <span className="text-[#EA4335] font-bold">G</span>}
                        {pixel.platform === 'tiktok' && <span className="font-bold">T</span>}
                        {pixel.platform === 'taboola' && <span className="text-[#005BE2] font-bold">T</span>}
                        {pixel.platform === 'kwai' && <span className="text-[#FF7E00] font-bold">K</span>}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{pixel.platform} Pixel</p>
                        <p className="text-sm text-muted-foreground">ID: {pixel.pixelId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-wrap gap-1">
                        {pixel.events.slice(0, 3).map(event => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                        {pixel.events.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{pixel.events.length - 3}
                          </Badge>
                        )}
                      </div>
                      <Switch checked={pixel.enabled} />
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Pixel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Events Configuration per Pixel */}
          <Card>
            <CardHeader>
              <CardTitle>Eventos por Pixel</CardTitle>
              <CardDescription>
                Configure quais eventos são disparados para cada pixel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead className="text-center">Meta</TableHead>
                    <TableHead className="text-center">Google</TableHead>
                    <TableHead className="text-center">TikTok</TableHead>
                    <TableHead>Descrição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">PageView</TableCell>
                    <TableCell className="text-center"><Switch defaultChecked /></TableCell>
                    <TableCell className="text-center"><Switch defaultChecked /></TableCell>
                    <TableCell className="text-center"><Switch defaultChecked /></TableCell>
                    <TableCell className="text-muted-foreground">Visualização de página</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">ViewContent</TableCell>
                    <TableCell className="text-center"><Switch defaultChecked /></TableCell>
                    <TableCell className="text-center"><Switch defaultChecked /></TableCell>
                    <TableCell className="text-center"><Switch defaultChecked /></TableCell>
                    <TableCell className="text-muted-foreground">Visualização de produto</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">AddToCart</TableCell>
                    <TableCell className="text-center"><Switch defaultChecked /></TableCell>
                    <TableCell className="text-center"><Switch defaultChecked /></TableCell>
                    <TableCell className="text-center"><Switch /></TableCell>
                    <TableCell className="text-muted-foreground">Adicionar ao carrinho</TableCell>
                  </TableRow>
                  <TableRow className="bg-orange-500/5">
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-orange-500" />
                        InitiateCheckout (IC)
                      </span>
                    </TableCell>
                    <TableCell className="text-center"><Switch defaultChecked /></TableCell>
                    <TableCell className="text-center"><Switch defaultChecked /></TableCell>
                    <TableCell className="text-center"><Switch defaultChecked /></TableCell>
                    <TableCell className="text-muted-foreground font-medium text-orange-600">
                      Crítico para COD - Início do checkout
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Lead</TableCell>
                    <TableCell className="text-center"><Switch defaultChecked /></TableCell>
                    <TableCell className="text-center"><Switch /></TableCell>
                    <TableCell className="text-center"><Switch defaultChecked /></TableCell>
                    <TableCell className="text-muted-foreground">Formulário enviado</TableCell>
                  </TableRow>
                  <TableRow className="bg-emerald-500/5">
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                        Purchase
                      </span>
                    </TableCell>
                    <TableCell className="text-center"><Switch defaultChecked /></TableCell>
                    <TableCell className="text-center"><Switch defaultChecked /></TableCell>
                    <TableCell className="text-center"><Switch defaultChecked /></TableCell>
                    <TableCell className="text-muted-foreground font-medium text-emerald-600">
                      Conversão final - Pedido criado
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CLOAKERS TAB */}
        <TabsContent value="cloakers" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Integrações com Cloakers
              </CardTitle>
              <CardDescription>
                Configure cloakers para proteção de campanhas e tracking avançado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cloakers.map(cloaker => (
                  <div key={cloaker.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{cloaker.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {cloaker.type.replace(/-/g, ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={cloaker.enabled ? 'success' : 'secondary'}>
                          {cloaker.enabled ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Switch checked={cloaker.enabled} />
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-muted-foreground mb-1">Safe Page</p>
                        <p className="font-mono text-xs truncate">{cloaker.safePage}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-muted-foreground mb-1">Money Page</p>
                        <p className="font-mono text-xs truncate">{cloaker.moneyPage}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {cloaker.settings.blockBots && <Badge variant="outline">🤖 Block Bots</Badge>}
                      {cloaker.settings.blockVPN && <Badge variant="outline">🔒 Block VPN</Badge>}
                      {cloaker.settings.blockDatacenters && <Badge variant="outline">🖥️ Block Datacenters</Badge>}
                      {cloaker.settings.geoTargeting && <Badge variant="outline">🌍 Geo Targeting</Badge>}
                      {cloaker.settings.blockRepeatedVisits && <Badge variant="outline">🔄 Block Repeated</Badge>}
                    </div>

                    {cloaker.settings.geoTargeting && cloaker.settings.allowedCountries.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Países:</span>
                        {cloaker.settings.allowedCountries.map(code => (
                          <Badge key={code} variant="secondary">{code}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <Button variant="outline" className="w-full" onClick={() => setShowAddCloaker(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Cloaker
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cloaker Integration Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Guia de Integração - The White Rabbit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <h4 className="font-medium">Parâmetros Suportados</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm font-mono">
                  <div className="p-2 bg-background rounded">{'{{click_id}}'}</div>
                  <div className="p-2 bg-background rounded">{'{{zone_id}}'}</div>
                  <div className="p-2 bg-background rounded">{'{{campaign_id}}'}</div>
                  <div className="p-2 bg-background rounded">{'{{creative_id}}'}</div>
                  <div className="p-2 bg-background rounded">{'{{ad_id}}'}</div>
                  <div className="p-2 bg-background rounded">{'{{adset_id}}'}</div>
                  <div className="p-2 bg-background rounded">{'{{placement}}'}</div>
                  <div className="p-2 bg-background rounded">{'{{external_id}}'}</div>
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-medium">URL de Exemplo</h4>
                <code className="block p-3 bg-muted rounded text-xs break-all">
                  https://seudominio.com/oferta?sub1={'{{creative_id}}'}&sub2={'{{adset_id}}'}&sub3={'{{campaign_id}}'}&click_id={'{{click_id}}'}&fbclid={'{{fbclid}}'}
                </code>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(
                  'https://seudominio.com/oferta?sub1={{creative_id}}&sub2={{adset_id}}&sub3={{campaign_id}}&click_id={{click_id}}&fbclid={{fbclid}}'
                )}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar URL
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* POSTBACKS TAB */}
        <TabsContent value="postbacks" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Webhook className="h-5 w-5" />
                    Postbacks Configurados
                  </CardTitle>
                  <CardDescription>
                    Configure webhooks para enviar eventos para suas plataformas
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddPostback(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Postback
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead className="text-center">Sucesso</TableHead>
                    <TableHead className="text-center">Falhas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {postbacks.map(postback => (
                    <TableRow key={postback.id}>
                      <TableCell className="font-medium">{postback.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getEventLabel(postback.event)}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="truncate text-xs font-mono">{postback.url}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={postback.method === 'POST' ? 'default' : 'secondary'}>
                          {postback.method}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-green-600 font-medium">
                        {postback.successCount}
                      </TableCell>
                      <TableCell className="text-center text-red-600 font-medium">
                        {postback.failCount}
                      </TableCell>
                      <TableCell>
                        <Switch checked={postback.enabled} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Available Variables */}
          <Card>
            <CardHeader>
              <CardTitle>Variáveis Disponíveis</CardTitle>
              <CardDescription>
                Use estas variáveis nos seus postbacks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { var: '{click_id}', desc: 'ID do clique' },
                  { var: '{fbclid}', desc: 'Facebook Click ID' },
                  { var: '{gclid}', desc: 'Google Click ID' },
                  { var: '{ttclid}', desc: 'TikTok Click ID' },
                  { var: '{external_id}', desc: 'ID externo' },
                  { var: '{ip}', desc: 'IP do visitante' },
                  { var: '{user_agent}', desc: 'User Agent' },
                  { var: '{country}', desc: 'País' },
                  { var: '{value}', desc: 'Valor da conversão' },
                  { var: '{order_id}', desc: 'ID do pedido' },
                  { var: '{timestamp}', desc: 'Unix timestamp' },
                  { var: '{sub1}', desc: 'SubID 1' },
                  { var: '{sub2}', desc: 'SubID 2' },
                  { var: '{sub3}', desc: 'SubID 3' },
                  { var: '{utm_source}', desc: 'UTM Source' },
                  { var: '{utm_campaign}', desc: 'UTM Campaign' },
                ].map(item => (
                  <div key={item.var} className="p-3 border rounded-lg">
                    <code className="text-sm text-primary">{item.var}</code>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EVENTS TAB */}
        <TabsContent value="events" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Eventos em Tempo Real
                  </CardTitle>
                  <CardDescription>
                    Monitore os eventos de tracking em tempo real
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtrar
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Atualizar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {events.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      {getEventIcon(event.type)}
                      <div>
                        <p className="font-medium">{getEventLabel(event.type)}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{event.data.country}</span>
                          {event.data.value && <span>• R$ {event.data.value.toFixed(2)}</span>}
                          {event.data.orderId && <span>• {event.data.orderId}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-xs">
                        {event.data.fbclid && <Badge variant="outline" className="mr-1">fbclid</Badge>}
                        {event.data.gclid && <Badge variant="outline" className="mr-1">gclid</Badge>}
                        {event.data.ttclid && <Badge variant="outline">ttclid</Badge>}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(event.timestamp)}
                      </span>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Funil de Conversão (Hoje)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1 text-center p-4">
                  <div className="h-16 w-16 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                    <Eye className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold">{pageviews}</p>
                  <p className="text-sm text-muted-foreground">PageViews</p>
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                <div className="flex-1 text-center p-4">
                  <div className="h-16 w-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                    <MousePointer className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold">{clicks}</p>
                  <p className="text-sm text-muted-foreground">Cliques</p>
                  <p className="text-xs text-muted-foreground">{pageviews > 0 ? ((clicks / pageviews) * 100).toFixed(1) : 0}%</p>
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                <div className="flex-1 text-center p-4">
                  <div className="h-16 w-16 mx-auto rounded-full bg-orange-500/10 flex items-center justify-center mb-2">
                    <ShoppingCart className="h-8 w-8 text-orange-500" />
                  </div>
                  <p className="text-2xl font-bold">{ics}</p>
                  <p className="text-sm text-muted-foreground">IC</p>
                  <p className="text-xs text-muted-foreground">{clicks > 0 ? ((ics / clicks) * 100).toFixed(1) : 0}%</p>
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                <div className="flex-1 text-center p-4">
                  <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
                    <DollarSign className="h-8 w-8 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold">{purchases}</p>
                  <p className="text-sm text-muted-foreground">Vendas</p>
                  <p className="text-xs text-muted-foreground">{ics > 0 ? ((purchases / ics) * 100).toFixed(1) : 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PLATFORMS TAB */}
        <TabsContent value="platforms" className="space-y-6 mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Shopify', icon: '🛒', connected: true, description: 'E-commerce platform' },
              { name: 'WooCommerce', icon: '🔌', connected: true, description: 'WordPress plugin' },
              { name: 'Yampi', icon: '💳', connected: false, description: 'Checkout brasileiro' },
              { name: 'Cartpanda', icon: '🐼', connected: false, description: 'Checkout COD' },
              { name: 'Appmax', icon: '📱', connected: false, description: 'Checkout mobile' },
              { name: 'Nuvemshop', icon: '☁️', connected: false, description: 'Plataforma LATAM' },
            ].map(platform => (
              <Card key={platform.name} className={!platform.connected ? 'opacity-70' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{platform.icon}</div>
                      <div>
                        <h3 className="font-semibold">{platform.name}</h3>
                        <p className="text-sm text-muted-foreground">{platform.description}</p>
                      </div>
                    </div>
                    <Switch checked={platform.connected} />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <Badge variant={platform.connected ? 'success' : 'secondary'}>
                      {platform.connected ? <><Check className="mr-1 h-3 w-3" /> Conectado</> : <><X className="mr-1 h-3 w-3" /> Desconectado</>}
                    </Badge>
                    <Button variant="outline" size="sm">
                      {platform.connected ? 'Configurar' : 'Conectar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Script Generator Dialog */}
      <Dialog open={showScript} onOpenChange={setShowScript}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerar Script de Tracking</DialogTitle>
            <DialogDescription>
              Escolha o tipo de página e copie o script gerado
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={scriptType === 'landing' ? 'default' : 'outline'}
                onClick={() => setScriptType('landing')}
              >
                Landing Page
              </Button>
              <Button
                variant={scriptType === 'checkout' ? 'default' : 'outline'}
                onClick={() => setScriptType('checkout')}
              >
                Checkout
              </Button>
              <Button
                variant={scriptType === 'thankyou' ? 'default' : 'outline'}
                onClick={() => setScriptType('thankyou')}
              >
                Thank You Page
              </Button>
            </div>

            <div className="relative">
              <Textarea
                className="font-mono text-xs h-96"
                value={generateScript(scriptType)}
                readOnly
              />
              <Button
                className="absolute top-2 right-2"
                size="sm"
                onClick={() => copyToClipboard(generateScript(scriptType))}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-medium">Instruções de Instalação</h4>
              <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                <li>Copie o script acima</li>
                <li>Cole antes do {'</head>'} ou {'</body>'} da sua página</li>
                <li>
                  {scriptType === 'landing' && 'Use na sua landing page principal'}
                  {scriptType === 'checkout' && 'Use na página de checkout/formulário'}
                  {scriptType === 'thankyou' && 'Use na página de obrigado/confirmação'}
                </li>
                <li>Teste usando o modo debug (console do navegador)</li>
              </ol>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Postback Dialog */}
      <Dialog open={showAddPostback} onOpenChange={setShowAddPostback}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Postback</DialogTitle>
            <DialogDescription>
              Configure um novo webhook para receber eventos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                placeholder="Ex: Meta - Conversão"
                value={newPostback.name || ''}
                onChange={(e) => setNewPostback({...newPostback, name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Evento</Label>
              <Select
                value={newPostback.event}
                onValueChange={(value: PostbackConfig['event']) => setNewPostback({...newPostback, event: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pageview">PageView</SelectItem>
                  <SelectItem value="click">Click</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="initiate_checkout">InitiateCheckout (IC)</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="upsell">Upsell</SelectItem>
                  <SelectItem value="downsell">Downsell</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="returned">Devolvido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>URL do Postback</Label>
              <Input
                placeholder="https://..."
                value={newPostback.url || ''}
                onChange={(e) => setNewPostback({...newPostback, url: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Método</Label>
              <Select
                value={newPostback.method}
                onValueChange={(value: 'GET' | 'POST') => setNewPostback({...newPostback, method: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPostback(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              // Add postback logic
              setShowAddPostback(false)
            }}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
