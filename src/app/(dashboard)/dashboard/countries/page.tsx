'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Plus,
  Globe,
  DollarSign,
  Package,
  Truck,
  Settings,
  TrendingUp,
  Flag,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Country {
  code: string
  name: string
  currency: string
  currencySymbol: string
  flag: string
  active: boolean
  orders: number
  revenue: number
  deliveryRate: number
  avgShipping: number
  carriers: string[]
}

const mockCountries: Country[] = [
  {
    code: 'BR',
    name: 'Brasil',
    currency: 'BRL',
    currencySymbol: 'R$',
    flag: '🇧🇷',
    active: true,
    orders: 1250,
    revenue: 425000,
    deliveryRate: 78.5,
    avgShipping: 15,
    carriers: ['Correios', 'Jadlog', 'Total Express'],
  },
  {
    code: 'PT',
    name: 'Portugal',
    currency: 'EUR',
    currencySymbol: '€',
    flag: '🇵🇹',
    active: true,
    orders: 340,
    revenue: 85000,
    deliveryRate: 92.3,
    avgShipping: 8,
    carriers: ['CTT', 'DHL'],
  },
  {
    code: 'AO',
    name: 'Angola',
    currency: 'AOA',
    currencySymbol: 'Kz',
    flag: '🇦🇴',
    active: true,
    orders: 180,
    revenue: 3500000,
    deliveryRate: 65.8,
    avgShipping: 2500,
    carriers: ['ENSA', 'DHL'],
  },
  {
    code: 'US',
    name: 'Estados Unidos',
    currency: 'USD',
    currencySymbol: '$',
    flag: '🇺🇸',
    active: false,
    orders: 0,
    revenue: 0,
    deliveryRate: 0,
    avgShipping: 12,
    carriers: ['USPS', 'FedEx', 'UPS'],
  },
  {
    code: 'ES',
    name: 'Espanha',
    currency: 'EUR',
    currencySymbol: '€',
    flag: '🇪🇸',
    active: false,
    orders: 0,
    revenue: 0,
    deliveryRate: 0,
    avgShipping: 7,
    carriers: ['Correos', 'SEUR'],
  },
]

export default function CountriesPage() {
  const [countries, setCountries] = useState(mockCountries)

  const toggleCountry = (code: string) => {
    setCountries(countries.map(c =>
      c.code === code ? { ...c, active: !c.active } : c
    ))
  }

  const activeCountries = countries.filter(c => c.active)
  const totalOrders = activeCountries.reduce((sum, c) => sum + c.orders, 0)

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
                <Globe className="h-5 w-5 text-primary" />
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
                <p className="text-2xl font-bold">78.9%</p>
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
                <p className="text-2xl font-bold">4</p>
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
                  onCheckedChange={() => toggleCountry(country.code)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {country.active ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Pedidos</p>
                      <p className="text-lg font-bold">{country.orders.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Receita</p>
                      <p className="text-lg font-bold">
                        {formatCurrency(country.revenue, country.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Taxa Entrega</p>
                      <p className={`text-lg font-bold ${country.deliveryRate >= 75 ? 'text-green-500' : country.deliveryRate >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {country.deliveryRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Frete Medio</p>
                      <p className="text-lg font-bold">
                        {formatCurrency(country.avgShipping, country.currency)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Transportadoras</p>
                    <div className="flex flex-wrap gap-1">
                      {country.carriers.map((carrier) => (
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
              ) : (
                <div className="py-4 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Pais desativado. Ative para comecar a vender.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleCountry(country.code)}
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
