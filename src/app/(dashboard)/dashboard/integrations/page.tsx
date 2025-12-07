'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
} from 'lucide-react'
import { useCountry } from '@/contexts/country-context'
import Link from 'next/link'

// Integration types per country
interface Integration {
  id: string
  name: string
  description: string
  icon: string
  connected: boolean
  countries: string[]
  category: 'payment' | 'shipping' | 'platform'
}

// Mock integrations data
const integrations: Integration[] = [
  // Payment Gateways
  { id: 'pagseguro', name: 'PagSeguro', description: 'Gateway de pagamento brasileiro', icon: '💳', connected: true, countries: ['BR'], category: 'payment' },
  { id: 'mercadopago', name: 'Mercado Pago', description: 'Pagamentos América Latina', icon: '💰', connected: true, countries: ['BR', 'PT'], category: 'payment' },
  { id: 'stripe', name: 'Stripe', description: 'Pagamentos globais', icon: '💵', connected: true, countries: ['PT', 'ES', 'US'], category: 'payment' },
  { id: 'paypal', name: 'PayPal', description: 'Pagamentos internacionais', icon: '🅿️', connected: false, countries: ['US', 'PT', 'ES'], category: 'payment' },
  { id: 'multicaixa', name: 'Multicaixa Express', description: 'Pagamentos Angola', icon: '🏦', connected: true, countries: ['AO'], category: 'payment' },
  { id: 'mpesa', name: 'M-Pesa', description: 'Pagamentos móveis África', icon: '📱', connected: true, countries: ['MZ', 'AO'], category: 'payment' },
  { id: 'sibs', name: 'SIBS/MB Way', description: 'Multibanco Portugal', icon: '🏧', connected: true, countries: ['PT'], category: 'payment' },

  // Shipping Carriers
  { id: 'correios', name: 'Correios', description: 'Entregas Brasil', icon: '📦', connected: true, countries: ['BR'], category: 'shipping' },
  { id: 'jadlog', name: 'Jadlog', description: 'Entregas expressas Brasil', icon: '🚚', connected: true, countries: ['BR'], category: 'shipping' },
  { id: 'loggi', name: 'Loggi', description: 'Entregas urbanas Brasil', icon: '🛵', connected: false, countries: ['BR'], category: 'shipping' },
  { id: 'ctt', name: 'CTT', description: 'Correios de Portugal', icon: '📮', connected: true, countries: ['PT'], category: 'shipping' },
  { id: 'dpd', name: 'DPD', description: 'Entregas Europa', icon: '📫', connected: true, countries: ['PT', 'ES'], category: 'shipping' },
  { id: 'dhl', name: 'DHL', description: 'Entregas internacionais', icon: '✈️', connected: true, countries: ['AO', 'MZ', 'CV', 'US'], category: 'shipping' },
  { id: 'fedex', name: 'FedEx', description: 'Entregas expressas globais', icon: '🌍', connected: false, countries: ['US', 'BR'], category: 'shipping' },
  { id: 'ups', name: 'UPS', description: 'United Parcel Service', icon: '📤', connected: true, countries: ['US', 'PT', 'ES'], category: 'shipping' },
  { id: 'correos', name: 'Correos', description: 'Correios Espanha', icon: '🇪🇸', connected: true, countries: ['ES'], category: 'shipping' },
  { id: 'usps', name: 'USPS', description: 'Postal Service EUA', icon: '🇺🇸', connected: true, countries: ['US'], category: 'shipping' },

  // E-commerce Platforms
  { id: 'shopify', name: 'Shopify', description: 'Plataforma e-commerce', icon: '🛒', connected: true, countries: ['BR', 'PT', 'US', 'ES'], category: 'platform' },
  { id: 'woocommerce', name: 'WooCommerce', description: 'WordPress e-commerce', icon: '🔌', connected: true, countries: ['BR', 'PT'], category: 'platform' },
  { id: 'nuvemshop', name: 'Nuvemshop', description: 'Plataforma Brasil', icon: '☁️', connected: false, countries: ['BR'], category: 'platform' },
  { id: 'magento', name: 'Magento', description: 'Adobe Commerce', icon: '🧲', connected: false, countries: ['US', 'PT', 'ES'], category: 'platform' },
  { id: 'prestashop', name: 'PrestaShop', description: 'E-commerce open source', icon: '🛍️', connected: false, countries: ['PT', 'ES'], category: 'platform' },
]

export default function IntegrationsPage() {
  const { countries, selectedCountry, isAllSelected } = useCountry()
  const [selectedTab, setSelectedTab] = useState('all')

  const activeCountries = countries.filter(c => c.active)

  // Filter integrations based on selected country
  const getFilteredIntegrations = (category?: string) => {
    let filtered = integrations

    // Filter by country if a specific country is selected
    if (!isAllSelected && selectedCountry) {
      filtered = filtered.filter(i => i.countries.includes(selectedCountry.code))
    } else {
      // Show integrations for all active countries
      filtered = filtered.filter(i =>
        i.countries.some(code => activeCountries.map(c => c.code).includes(code))
      )
    }

    // Filter by category if specified
    if (category && category !== 'all') {
      filtered = filtered.filter(i => i.category === category)
    }

    return filtered
  }

  const connectedCount = getFilteredIntegrations().filter(i => i.connected).length
  const totalCount = getFilteredIntegrations().length

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'payment': return <CreditCard className="h-4 w-4" />
      case 'shipping': return <Truck className="h-4 w-4" />
      case 'platform': return <Store className="h-4 w-4" />
      default: return <Zap className="h-4 w-4" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'payment': return 'Pagamento'
      case 'shipping': return 'Envio'
      case 'platform': return 'Plataforma'
      default: return category
    }
  }

  const IntegrationCard = ({ integration }: { integration: Integration }) => (
    <Card className={!integration.connected ? 'opacity-70' : ''}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{integration.icon}</div>
            <div>
              <h3 className="font-semibold">{integration.name}</h3>
              <p className="text-sm text-muted-foreground">{integration.description}</p>
            </div>
          </div>
          <Switch checked={integration.connected} />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {integration.countries.map(code => {
              const country = countries.find(c => c.code === code)
              return country ? (
                <Badge key={code} variant="outline" className="text-xs">
                  {country.flag} {code}
                </Badge>
              ) : null
            })}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={integration.connected ? 'success' : 'secondary'}>
              {integration.connected ? (
                <><Check className="mr-1 h-3 w-3" /> Ativo</>
              ) : (
                <><X className="mr-1 h-3 w-3" /> Inativo</>
              )}
            </Badge>
          </div>
        </div>

        {integration.connected && (
          <Button variant="outline" size="sm" className="w-full mt-4">
            <Settings className="mr-2 h-4 w-4" />
            Configurar
          </Button>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrações</h1>
          <p className="text-muted-foreground">
            Gerencie suas integrações de pagamento, envio e plataformas
            {!isAllSelected && selectedCountry && (
              <span className="ml-2">
                <Badge variant="outline">
                  {selectedCountry.flag} {selectedCountry.name}
                </Badge>
              </span>
            )}
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Integração
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{connectedCount}/{totalCount}</p>
                <p className="text-xs text-muted-foreground">Integrações Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {getFilteredIntegrations('payment').filter(i => i.connected).length}
                </p>
                <p className="text-xs text-muted-foreground">Pagamentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Truck className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {getFilteredIntegrations('shipping').filter(i => i.connected).length}
                </p>
                <p className="text-xs text-muted-foreground">Transportadoras</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Store className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {getFilteredIntegrations('platform').filter(i => i.connected).length}
                </p>
                <p className="text-xs text-muted-foreground">Plataformas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Country Quick Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe2 className="h-4 w-4" />
            Filtrar por País
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {activeCountries.map(country => (
              <Link key={country.code} href="/dashboard/countries">
                <Badge
                  variant={!isAllSelected && selectedCountry?.code === country.code ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/10"
                >
                  {country.flag} {country.name}
                  <span className="ml-2 text-muted-foreground">
                    ({integrations.filter(i => i.countries.includes(country.code) && i.connected).length})
                  </span>
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integrations Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="mr-2 h-4 w-4" />
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="shipping">
            <Truck className="mr-2 h-4 w-4" />
            Transportadoras
          </TabsTrigger>
          <TabsTrigger value="platform">
            <Store className="mr-2 h-4 w-4" />
            Plataformas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-6">
            {/* Payment Gateways Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-500" />
                Gateways de Pagamento
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getFilteredIntegrations('payment').map(integration => (
                  <IntegrationCard key={integration.id} integration={integration} />
                ))}
              </div>
            </div>

            {/* Shipping Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-500" />
                Transportadoras
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getFilteredIntegrations('shipping').map(integration => (
                  <IntegrationCard key={integration.id} integration={integration} />
                ))}
              </div>
            </div>

            {/* Platforms Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Store className="h-5 w-5 text-purple-500" />
                Plataformas E-commerce
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getFilteredIntegrations('platform').map(integration => (
                  <IntegrationCard key={integration.id} integration={integration} />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payment" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {getFilteredIntegrations('payment').map(integration => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="shipping" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {getFilteredIntegrations('shipping').map(integration => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="platform" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {getFilteredIntegrations('platform').map(integration => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
