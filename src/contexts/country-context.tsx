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

// Paises disponiveis - Europa, Leste Europeu, CPLP e principais mercados
const initialCountries: Country[] = [
  // CPLP e principais mercados
  { code: 'BR', name: 'Brasil', flag: '🇧🇷', currency: 'BRL', currencySymbol: 'R$', timezone: 'America/Sao_Paulo', active: true },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Lisbon', active: true },
  { code: 'AO', name: 'Angola', flag: '🇦🇴', currency: 'AOA', currencySymbol: 'Kz', timezone: 'Africa/Luanda', active: true },
  { code: 'MZ', name: 'Moçambique', flag: '🇲🇿', currency: 'MZN', currencySymbol: 'MT', timezone: 'Africa/Maputo', active: false },
  { code: 'CV', name: 'Cabo Verde', flag: '🇨🇻', currency: 'CVE', currencySymbol: '$', timezone: 'Atlantic/Cape_Verde', active: false },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', currency: 'USD', currencySymbol: '$', timezone: 'America/New_York', active: false },

  // Europa Ocidental
  { code: 'ES', name: 'Espanha', flag: '🇪🇸', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Madrid', active: false },
  { code: 'FR', name: 'França', flag: '🇫🇷', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Paris', active: false },
  { code: 'DE', name: 'Alemanha', flag: '🇩🇪', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Berlin', active: false },
  { code: 'IT', name: 'Itália', flag: '🇮🇹', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Rome', active: false },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧', currency: 'GBP', currencySymbol: '£', timezone: 'Europe/London', active: false },
  { code: 'NL', name: 'Holanda', flag: '🇳🇱', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Amsterdam', active: false },
  { code: 'BE', name: 'Bélgica', flag: '🇧🇪', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Brussels', active: false },
  { code: 'AT', name: 'Áustria', flag: '🇦🇹', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Vienna', active: false },
  { code: 'CH', name: 'Suíça', flag: '🇨🇭', currency: 'CHF', currencySymbol: 'Fr', timezone: 'Europe/Zurich', active: false },
  { code: 'IE', name: 'Irlanda', flag: '🇮🇪', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Dublin', active: false },
  { code: 'LU', name: 'Luxemburgo', flag: '🇱🇺', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Luxembourg', active: false },

  // Europa do Norte
  { code: 'SE', name: 'Suécia', flag: '🇸🇪', currency: 'SEK', currencySymbol: 'kr', timezone: 'Europe/Stockholm', active: false },
  { code: 'NO', name: 'Noruega', flag: '🇳🇴', currency: 'NOK', currencySymbol: 'kr', timezone: 'Europe/Oslo', active: false },
  { code: 'DK', name: 'Dinamarca', flag: '🇩🇰', currency: 'DKK', currencySymbol: 'kr', timezone: 'Europe/Copenhagen', active: false },
  { code: 'FI', name: 'Finlândia', flag: '🇫🇮', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Helsinki', active: false },
  { code: 'IS', name: 'Islândia', flag: '🇮🇸', currency: 'ISK', currencySymbol: 'kr', timezone: 'Atlantic/Reykjavik', active: false },

  // Europa do Sul
  { code: 'GR', name: 'Grécia', flag: '🇬🇷', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Athens', active: false },
  { code: 'MT', name: 'Malta', flag: '🇲🇹', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Malta', active: false },
  { code: 'CY', name: 'Chipre', flag: '🇨🇾', currency: 'EUR', currencySymbol: '€', timezone: 'Asia/Nicosia', active: false },

  // Leste Europeu
  { code: 'PL', name: 'Polônia', flag: '🇵🇱', currency: 'PLN', currencySymbol: 'zł', timezone: 'Europe/Warsaw', active: false },
  { code: 'CZ', name: 'República Tcheca', flag: '🇨🇿', currency: 'CZK', currencySymbol: 'Kč', timezone: 'Europe/Prague', active: false },
  { code: 'SK', name: 'Eslováquia', flag: '🇸🇰', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Bratislava', active: false },
  { code: 'HU', name: 'Hungria', flag: '🇭🇺', currency: 'HUF', currencySymbol: 'Ft', timezone: 'Europe/Budapest', active: false },
  { code: 'RO', name: 'Romênia', flag: '🇷🇴', currency: 'RON', currencySymbol: 'lei', timezone: 'Europe/Bucharest', active: false },
  { code: 'BG', name: 'Bulgária', flag: '🇧🇬', currency: 'BGN', currencySymbol: 'лв', timezone: 'Europe/Sofia', active: false },
  { code: 'HR', name: 'Croácia', flag: '🇭🇷', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Zagreb', active: false },
  { code: 'SI', name: 'Eslovênia', flag: '🇸🇮', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Ljubljana', active: false },
  { code: 'RS', name: 'Sérvia', flag: '🇷🇸', currency: 'RSD', currencySymbol: 'дин', timezone: 'Europe/Belgrade', active: false },
  { code: 'BA', name: 'Bósnia', flag: '🇧🇦', currency: 'BAM', currencySymbol: 'KM', timezone: 'Europe/Sarajevo', active: false },
  { code: 'ME', name: 'Montenegro', flag: '🇲🇪', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Podgorica', active: false },
  { code: 'MK', name: 'Macedônia do Norte', flag: '🇲🇰', currency: 'MKD', currencySymbol: 'ден', timezone: 'Europe/Skopje', active: false },
  { code: 'AL', name: 'Albânia', flag: '🇦🇱', currency: 'ALL', currencySymbol: 'L', timezone: 'Europe/Tirane', active: false },
  { code: 'XK', name: 'Kosovo', flag: '🇽🇰', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Belgrade', active: false },

  // Bálticos
  { code: 'EE', name: 'Estônia', flag: '🇪🇪', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Tallinn', active: false },
  { code: 'LV', name: 'Letônia', flag: '🇱🇻', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Riga', active: false },
  { code: 'LT', name: 'Lituânia', flag: '🇱🇹', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Vilnius', active: false },

  // Europa Oriental
  { code: 'UA', name: 'Ucrânia', flag: '🇺🇦', currency: 'UAH', currencySymbol: '₴', timezone: 'Europe/Kiev', active: false },
  { code: 'MD', name: 'Moldávia', flag: '🇲🇩', currency: 'MDL', currencySymbol: 'L', timezone: 'Europe/Chisinau', active: false },
  { code: 'BY', name: 'Bielorrússia', flag: '🇧🇾', currency: 'BYN', currencySymbol: 'Br', timezone: 'Europe/Minsk', active: false },
  { code: 'RU', name: 'Rússia', flag: '🇷🇺', currency: 'RUB', currencySymbol: '₽', timezone: 'Europe/Moscow', active: false },

  // Outros mercados relevantes
  { code: 'TR', name: 'Turquia', flag: '🇹🇷', currency: 'TRY', currencySymbol: '₺', timezone: 'Europe/Istanbul', active: false },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', currency: 'ILS', currencySymbol: '₪', timezone: 'Asia/Jerusalem', active: false },
]

// Country data - starts with zeros, will be populated from API when real data exists
const emptyCountryData: CountryData = {
  revenue: 0,
  totalRevenue: 0,
  profit: 0,
  orders: 0,
  avgTicket: 0,
  deliveryRate: 0,
  returnRate: 0,
  roas: 0,
  visitors: 0,
}

// Generate empty data for all countries dynamically
const countryDataMap: Record<string, CountryData> = Object.fromEntries([
  ...initialCountries.map(c => [c.code, { ...emptyCountryData }]),
  ['ALL', { ...emptyCountryData }]
])

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
