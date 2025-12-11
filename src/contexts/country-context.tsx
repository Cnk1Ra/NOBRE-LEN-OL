'use client'

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react'

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
  revenue: number        // Faturamento do período atual (mês)
  totalRevenue: number   // Faturamento total histórico (desde o início)
  profit: number
  orders: number
  avgTicket: number
  deliveryRate: number
  returnRate: number
  roas: number
  visitors: number
}

export interface CurrencyConfig {
  code: string
  name: string
  symbol: string
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
  // Currency settings
  defaultCurrency: CurrencyConfig
  setDefaultCurrency: (currency: CurrencyConfig) => void
  formatCurrency: (value: number, fromCurrency?: string) => string
  convertValue: (value: number, fromCurrency?: string) => number
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

// Dados mock por pais - totalRevenue = revenue * 12 (corresponde ao dashboard MAX)
const countryDataMap: Record<string, CountryData> = {
  BR: {
    revenue: 850000,         // Faturamento do mês atual
    totalRevenue: 10200000,  // R$ 10.20M (850K * 12)
    profit: 3470000,
    orders: 34440,
    avgTicket: 296.17,
    deliveryRate: 78.5,
    returnRate: 12.3,
    roas: 3.72,
    visitors: 1020000,
  },
  PT: {
    revenue: 420000,
    totalRevenue: 5040000,   // € 5.04M (420K * 12)
    profit: 1760000,
    orders: 17040,
    avgTicket: 295.77,
    deliveryRate: 85.2,
    returnRate: 8.5,
    roas: 4.15,
    visitors: 504000,
  },
  AO: {
    revenue: 380000,
    totalRevenue: 4560000,   // Kz 4.56M (380K * 12)
    profit: 1596000,
    orders: 15360,
    avgTicket: 296.88,
    deliveryRate: 72.3,
    returnRate: 15.8,
    roas: 3.45,
    visitors: 456000,
  },
  MZ: {
    revenue: 120000,
    totalRevenue: 1440000,   // MT 1.44M (120K * 12)
    profit: 504000,
    orders: 4860,
    avgTicket: 296.30,
    deliveryRate: 70.5,
    returnRate: 18.2,
    roas: 3.10,
    visitors: 144000,
  },
  CV: {
    revenue: 45000,
    totalRevenue: 540000,    // $ 540K (45K * 12)
    profit: 189000,
    orders: 1824,
    avgTicket: 296.05,
    deliveryRate: 75.0,
    returnRate: 14.0,
    roas: 3.25,
    visitors: 54000,
  },
  ES: {
    revenue: 280000,
    totalRevenue: 3360000,   // € 3.36M (280K * 12)
    profit: 1176000,
    orders: 11340,
    avgTicket: 296.30,
    deliveryRate: 88.5,
    returnRate: 6.2,
    roas: 4.50,
    visitors: 336000,
  },
  US: {
    revenue: 520000,
    totalRevenue: 6240000,   // $ 6.24M (520K * 12)
    profit: 2184000,
    orders: 21060,
    avgTicket: 296.30,
    deliveryRate: 90.2,
    returnRate: 5.8,
    roas: 4.80,
    visitors: 624000,
  },
  ALL: {
    revenue: 1850000,
    totalRevenue: 22200000,  // Total todos países (1.85M * 12)
    profit: 7770000,
    orders: 75000,
    avgTicket: 296.00,
    deliveryRate: 77.8,
    returnRate: 13.2,
    roas: 3.65,
    visitors: 2220000,
  },
}

// Available currencies with exchange rates (base: BRL)
const availableCurrencies: CurrencyConfig[] = [
  { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'Dolar Americano', symbol: '$' },
  { code: 'AOA', name: 'Kwanza Angolano', symbol: 'Kz' },
]

// Exchange rates from BRL to other currencies
const exchangeRates: Record<string, number> = {
  BRL: 1,
  EUR: 0.18,      // 1 BRL = 0.18 EUR
  USD: 0.20,      // 1 BRL = 0.20 USD
  AOA: 166.50,    // 1 BRL = 166.50 AOA
}

export function CountryProvider({ children }: { children: ReactNode }) {
  const [countries, setCountries] = useState<Country[]>(initialCountries)
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null)
  const [defaultCurrency, setDefaultCurrencyState] = useState<CurrencyConfig>(availableCurrencies[0])

  // Load currency from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('dod-default-currency')
    if (savedCurrency) {
      try {
        const parsed = JSON.parse(savedCurrency)
        setDefaultCurrencyState(parsed)
      } catch {
        // Invalid JSON, use default
      }
    }
  }, [])

  const selectedCountry = selectedCountryCode
    ? countries.find(c => c.code === selectedCountryCode) || null
    : null

  const isAllSelected = selectedCountryCode === null

  const setDefaultCurrency = useCallback((currency: CurrencyConfig) => {
    setDefaultCurrencyState(currency)
    // Save to localStorage
    localStorage.setItem('dod-default-currency', JSON.stringify(currency))
  }, [])

  const formatCurrency = useCallback((value: number, fromCurrency: string = 'BRL'): string => {
    // Convert from source currency to BRL first, then to target currency
    const valueInBRL = fromCurrency === 'BRL' ? value : value / exchangeRates[fromCurrency]
    const convertedValue = valueInBRL * exchangeRates[defaultCurrency.code]

    // Format based on currency
    if (defaultCurrency.code === 'AOA') {
      return `${defaultCurrency.symbol} ${convertedValue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    }
    return `${defaultCurrency.symbol} ${convertedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }, [defaultCurrency])

  const convertValue = useCallback((value: number, fromCurrency: string = 'BRL'): number => {
    const valueInBRL = fromCurrency === 'BRL' ? value : value / exchangeRates[fromCurrency]
    return valueInBRL * exchangeRates[defaultCurrency.code]
  }, [defaultCurrency])

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
        defaultCurrency,
        setDefaultCurrency,
        formatCurrency,
        convertValue,
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
