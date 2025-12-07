'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'

export interface Country {
  code: string
  name: string
  flag: string
  currency: string
  currencySymbol: string
  timezone: string
  active: boolean
}

export interface CountryData {
  revenue: number
  profit: number
  orders: number
  avgTicket: number
  deliveryRate: number
  returnRate: number
  roas: number
  visitors: number
}

interface CountryContextType {
  countries: Country[]
  selectedCountry: Country | null
  selectCountry: (code: string) => void
  selectAll: () => void
  isAllSelected: boolean
  addCountry: (country: Country) => void
  removeCountry: (code: string) => void
  toggleCountryActive: (code: string) => void
  getCountryData: (code: string) => CountryData
}

const CountryContext = createContext<CountryContextType | undefined>(undefined)

// Paises disponiveis
const initialCountries: Country[] = [
  { code: 'BR', name: 'Brasil', flag: '🇧🇷', currency: 'BRL', currencySymbol: 'R$', timezone: 'America/Sao_Paulo', active: true },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Lisbon', active: true },
  { code: 'AO', name: 'Angola', flag: '🇦🇴', currency: 'AOA', currencySymbol: 'Kz', timezone: 'Africa/Luanda', active: true },
  { code: 'MZ', name: 'Mocambique', flag: '🇲🇿', currency: 'MZN', currencySymbol: 'MT', timezone: 'Africa/Maputo', active: false },
  { code: 'CV', name: 'Cabo Verde', flag: '🇨🇻', currency: 'CVE', currencySymbol: '$', timezone: 'Atlantic/Cape_Verde', active: false },
  { code: 'ES', name: 'Espanha', flag: '🇪🇸', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Madrid', active: false },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', currency: 'USD', currencySymbol: '$', timezone: 'America/New_York', active: false },
]

// Dados mock por pais
const countryDataMap: Record<string, CountryData> = {
  BR: {
    revenue: 850000,
    profit: 289000,
    orders: 2870,
    avgTicket: 296.17,
    deliveryRate: 78.5,
    returnRate: 12.3,
    roas: 3.72,
    visitors: 85000,
  },
  PT: {
    revenue: 420000,
    profit: 147000,
    orders: 1420,
    avgTicket: 295.77,
    deliveryRate: 85.2,
    returnRate: 8.5,
    roas: 4.15,
    visitors: 42000,
  },
  AO: {
    revenue: 380000,
    profit: 133000,
    orders: 1280,
    avgTicket: 296.88,
    deliveryRate: 72.3,
    returnRate: 15.8,
    roas: 3.45,
    visitors: 38000,
  },
  MZ: {
    revenue: 120000,
    profit: 42000,
    orders: 405,
    avgTicket: 296.30,
    deliveryRate: 70.5,
    returnRate: 18.2,
    roas: 3.10,
    visitors: 12000,
  },
  CV: {
    revenue: 45000,
    profit: 15750,
    orders: 152,
    avgTicket: 296.05,
    deliveryRate: 75.0,
    returnRate: 14.0,
    roas: 3.25,
    visitors: 4500,
  },
  ES: {
    revenue: 280000,
    profit: 98000,
    orders: 945,
    avgTicket: 296.30,
    deliveryRate: 88.5,
    returnRate: 6.2,
    roas: 4.50,
    visitors: 28000,
  },
  US: {
    revenue: 520000,
    profit: 182000,
    orders: 1755,
    avgTicket: 296.30,
    deliveryRate: 90.2,
    returnRate: 5.8,
    roas: 4.80,
    visitors: 52000,
  },
  ALL: {
    revenue: 1850000,
    profit: 628000,
    orders: 6250,
    avgTicket: 296.00,
    deliveryRate: 77.8,
    returnRate: 13.2,
    roas: 3.65,
    visitors: 185000,
  },
}

export function CountryProvider({ children }: { children: ReactNode }) {
  const [countries, setCountries] = useState<Country[]>(initialCountries)
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null)

  const selectedCountry = selectedCountryCode
    ? countries.find(c => c.code === selectedCountryCode) || null
    : null

  const isAllSelected = selectedCountryCode === null

  const selectCountry = useCallback((code: string) => {
    setSelectedCountryCode(code)
  }, [])

  const selectAll = useCallback(() => {
    setSelectedCountryCode(null)
  }, [])

  const addCountry = useCallback((country: Country) => {
    setCountries(prev => [...prev, country])
  }, [])

  const removeCountry = useCallback((code: string) => {
    setCountries(prev => prev.filter(c => c.code !== code))
  }, [])

  const toggleCountryActive = useCallback((code: string) => {
    setCountries(prev => prev.map(c =>
      c.code === code ? { ...c, active: !c.active } : c
    ))
  }, [])

  const getCountryData = useCallback((code: string): CountryData => {
    if (code === 'ALL' || !code) {
      return countryDataMap.ALL
    }
    return countryDataMap[code] || countryDataMap.ALL
  }, [])

  return (
    <CountryContext.Provider
      value={{
        countries,
        selectedCountry,
        selectCountry,
        selectAll,
        isAllSelected,
        addCountry,
        removeCountry,
        toggleCountryActive,
        getCountryData,
      }}
    >
      {children}
    </CountryContext.Provider>
  )
}

export function useCountry() {
  const context = useContext(CountryContext)
  if (context === undefined) {
    throw new Error('useCountry must be used within a CountryProvider')
  }
  return context
}
