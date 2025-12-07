'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Plus,
  DollarSign,
  Package,
  Settings,
  TrendingUp,
  Globe2,
  ArrowLeft,
} from 'lucide-react'
import { useCountry } from '@/contexts/country-context'
import Link from 'next/link'

// Carriers data per country
const carriersMap: Record<string, string[]> = {
  BR: ['Correios', 'Jadlog', 'Total Express', 'Loggi'],
  PT: ['CTT', 'DPD', 'GLS', 'UPS'],
  AO: ['Correios Angola', 'DHL', 'Fedex'],
  MZ: ['Correios Mocambique', 'DHL'],
  CV: ['Correios Cabo Verde', 'DHL'],
  ES: ['Correos', 'SEUR', 'MRW', 'GLS'],
  US: ['USPS', 'FedEx', 'UPS', 'DHL'],
}

// Average shipping cost per country (mock)
const avgShippingMap: Record<string, number> = {
  BR: 25.90,
  PT: 8.50,
  AO: 45.00,
  MZ: 38.00,
  CV: 42.00,
  ES: 7.90,
  US: 12.50,
}

export default function CountriesPage() {
  const { countries, toggleCountryActive, getCountryData } = useCountry()

  const activeCountries = countries.filter(c => c.active)
  const inactiveCountries = countries.filter(c => !c.active)

  const totalRevenue = activeCountries.reduce((sum, c) => sum + getCountryData(c.code).revenue, 0)
  const totalOrders = activeCountries.reduce((sum, c) => sum + getCountryData(c.code).orders, 0)
  const avgDeliveryRate = activeCountries.length > 0
    ? activeCountries.reduce((sum, c) => sum + getCountryData(c.code).deliveryRate, 0) / activeCountries.length
    : 0

  const formatCurrencyValue = (value: number, symbol: string) => {
    if (value >= 1000000) return symbol + ' ' + (value / 1000000).toFixed(1) + 'M'
    if (value >= 1000) return symbol + ' ' + (value / 1000).toFixed(0) + 'K'
    return symbol + ' ' + value.toFixed(0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paises</h1>
          <p className="text-muted-foreground">
            Configure os paises onde voce opera
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Pais
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCountries.length}</p>
                <p className="text-xs text-muted-foreground">Paises Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalOrders.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Pedidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgDeliveryRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Taxa Media Entrega</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{new Set(activeCountries.map(c => c.currency)).size}</p>
                <p className="text-xs text-muted-foreground">Moedas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Countries Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {countries.map((country) => (
          <Card key={country.code} className={!country.active ? 'opacity-60' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{country.flag}</span>
                  <div>
                    <CardTitle className="text-lg">{country.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {country.currency} ({country.currencySymbol})
                    </p>
                  </div>
                </div>
                <Switch
                  checked={country.active}
                  onCheckedChange={() => toggleCountryActive(country.code)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {country.active ? (
                (() => {
                  const countryData = getCountryData(country.code)
                  const carriers = carriersMap[country.code] || []
                  const avgShipping = avgShippingMap[country.code] || 0
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Pedidos</p>
                          <p className="text-lg font-bold">{countryData.orders.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Receita</p>
                          <p className="text-lg font-bold">
                            {formatCurrencyValue(countryData.revenue, country.currencySymbol)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Taxa Entrega</p>
                          <p className={`text-lg font-bold ${countryData.deliveryRate >= 75 ? 'text-green-500' : countryData.deliveryRate >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {countryData.deliveryRate}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Frete Medio</p>
                          <p className="text-lg font-bold">
                            {country.currencySymbol} {avgShipping.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Transportadoras</p>
                        <div className="flex flex-wrap gap-1">
                          {carriers.map((carrier) => (
                            <Badge key={carrier} variant="secondary" className="text-xs">
                              {carrier}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button variant="outline" size="sm" className="w-full">
                        <Settings className="mr-2 h-4 w-4" />
                        Configurar
                      </Button>
                    </>
                  )
                })()
              ) : (
                <div className="py-4 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Pais desativado. Ative para comecar a vender.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleCountryActive(country.code)}
                  >
                    Ativar Pais
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
