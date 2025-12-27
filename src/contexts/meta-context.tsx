'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { toast } from '@/hooks/use-toast'

// Types
export interface MetaAdAccount {
  id: string
  account_id: string
  name: string
  account_status: number
  currency: string
  business_name?: string
  business_id?: string
  amount_spent: string
  balance: string
  spend_cap: string
}

export interface MetaBusinessManager {
  id: string
  name: string
  primary_page?: string
}

export interface MetaInsight {
  date_start: string
  date_stop: string
  spend: string
  impressions?: string
  clicks?: string
  reach?: string
  account_id: string
  account_name?: string
}

export interface DailySpend {
  date: string
  spent: number
  revenue: number
  impressions: number
  clicks: number
  reach: number
}

export interface AdAccountWithSpend {
  id: string
  accountId: string
  name: string
  status: 'active' | 'inactive' | 'paused' | 'disabled'
  currency: string
  businessId?: string
  businessName?: string
  dailySpend: DailySpend[]
  totalSpent: number
}

export interface BusinessManagerWithAccounts {
  id: string
  name: string
  adAccounts: AdAccountWithSpend[]
  totalSpent: number
}

interface MetaContextType {
  // Connection state
  isConnected: boolean
  isLoading: boolean
  accessToken: string | null
  tokenExpiry: Date | null

  // Data
  businessManagers: BusinessManagerWithAccounts[]
  adAccounts: AdAccountWithSpend[]
  lastSync: Date | null

  // Actions
  connect: (token: string, expiry?: Date) => void
  disconnect: () => void
  refreshData: () => Promise<void>
  fetchInsights: (accountId: string, startDate: string, endDate: string) => Promise<DailySpend[]>
  syncAllData: () => Promise<void>

  // Manual token input
  setManualToken: (token: string) => void
}

const MetaContext = createContext<MetaContextType | undefined>(undefined)

const META_GRAPH_API = 'https://graph.facebook.com/v18.0'

export function MetaProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [tokenExpiry, setTokenExpiry] = useState<Date | null>(null)
  const [businessManagers, setBusinessManagers] = useState<BusinessManagerWithAccounts[]>([])
  const [adAccounts, setAdAccounts] = useState<AdAccountWithSpend[]>([])
  const [lastSync, setLastSync] = useState<Date | null>(null)

  // Load saved state from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('meta-access-token')
    const savedExpiry = localStorage.getItem('meta-token-expiry')
    const savedData = localStorage.getItem('meta-cached-data')
    const savedLastSync = localStorage.getItem('meta-last-sync')

    if (savedToken) {
      const expiry = savedExpiry ? new Date(savedExpiry) : null

      // Check if token is expired
      if (expiry && expiry < new Date()) {
        // Token expired, clear everything
        localStorage.removeItem('meta-access-token')
        localStorage.removeItem('meta-token-expiry')
        localStorage.removeItem('meta-cached-data')
        localStorage.removeItem('meta-last-sync')
      } else {
        setAccessToken(savedToken)
        setTokenExpiry(expiry)
        setIsConnected(true)

        // Load cached data
        if (savedData) {
          try {
            const data = JSON.parse(savedData)
            setBusinessManagers(data.businessManagers || [])
            setAdAccounts(data.adAccounts || [])
          } catch {
            // Invalid JSON
          }
        }

        if (savedLastSync) {
          setLastSync(new Date(savedLastSync))
        }
      }
    }
  }, [])

  // Save data to localStorage when it changes
  useEffect(() => {
    if (isConnected && (businessManagers.length > 0 || adAccounts.length > 0)) {
      localStorage.setItem('meta-cached-data', JSON.stringify({
        businessManagers,
        adAccounts,
      }))
    }
  }, [isConnected, businessManagers, adAccounts])

  // Fetch ad accounts from Meta API
  const fetchAdAccounts = useCallback(async (token: string): Promise<MetaAdAccount[]> => {
    try {
      const response = await fetch(
        `${META_GRAPH_API}/me/adaccounts?fields=id,account_id,name,account_status,currency,business_name,business,amount_spent,balance,spend_cap&access_token=${token}`
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to fetch ad accounts')
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Error fetching ad accounts:', error)
      throw error
    }
  }, [])

  // Fetch business managers
  const fetchBusinessManagers = useCallback(async (token: string): Promise<MetaBusinessManager[]> => {
    try {
      const response = await fetch(
        `${META_GRAPH_API}/me/businesses?fields=id,name,primary_page&access_token=${token}`
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to fetch business managers')
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Error fetching business managers:', error)
      return []
    }
  }, [])

  // Fetch insights for an ad account
  const fetchInsights = useCallback(async (
    accountId: string,
    startDate: string,
    endDate: string
  ): Promise<DailySpend[]> => {
    if (!accessToken) return []

    try {
      // Format account ID
      const formattedId = accountId.startsWith('act_') ? accountId : `act_${accountId}`

      const response = await fetch(
        `${META_GRAPH_API}/${formattedId}/insights?` +
        `fields=spend,impressions,clicks,reach&` +
        `time_range={"since":"${startDate}","until":"${endDate}"}&` +
        `time_increment=1&` +
        `access_token=${accessToken}`
      )

      if (!response.ok) {
        const error = await response.json()
        console.error('Insights error:', error)
        return []
      }

      const data = await response.json()
      const insights: DailySpend[] = (data.data || []).map((item: {
        date_start: string
        spend?: string
        impressions?: string
        clicks?: string
        reach?: string
      }) => ({
        date: item.date_start,
        spent: parseFloat(item.spend || '0'),
        revenue: 0, // Revenue needs to be tracked separately or from conversions
        impressions: parseInt(item.impressions || '0'),
        clicks: parseInt(item.clicks || '0'),
        reach: parseInt(item.reach || '0'),
      }))

      return insights
    } catch (error) {
      console.error('Error fetching insights:', error)
      return []
    }
  }, [accessToken])

  // Sync all data from Meta
  const syncAllData = useCallback(async () => {
    if (!accessToken) return

    setIsLoading(true)

    try {
      // Fetch ad accounts
      const accounts = await fetchAdAccounts(accessToken)

      // Fetch business managers
      const bms = await fetchBusinessManagers(accessToken)

      // Get date range for last 30 days
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)

      const startStr = startDate.toISOString().split('T')[0]
      const endStr = endDate.toISOString().split('T')[0]

      // Process ad accounts with spend data
      const processedAccounts: AdAccountWithSpend[] = await Promise.all(
        accounts.map(async (account) => {
          const insights = await fetchInsights(account.id, startStr, endStr)
          const totalSpent = insights.reduce((sum, day) => sum + day.spent, 0)

          // Determine status
          let status: 'active' | 'inactive' | 'paused' | 'disabled' = 'active'
          if (account.account_status === 2) status = 'disabled'
          else if (account.account_status === 3) status = 'paused'
          else if (account.account_status !== 1) status = 'inactive'

          // Extract business info
          let businessId: string | undefined
          let businessName: string | undefined

          if (account.business_name) {
            businessName = account.business_name
          }

          return {
            id: account.id,
            accountId: account.account_id,
            name: account.name,
            status,
            currency: account.currency,
            businessId,
            businessName,
            dailySpend: insights,
            totalSpent,
          }
        })
      )

      // Group accounts by business
      const bmMap = new Map<string, BusinessManagerWithAccounts>()

      // First, add known BMs
      bms.forEach(bm => {
        bmMap.set(bm.id, {
          id: bm.id,
          name: bm.name,
          adAccounts: [],
          totalSpent: 0,
        })
      })

      // Add a "Personal" BM for accounts without a business
      const personalBm: BusinessManagerWithAccounts = {
        id: 'personal',
        name: 'Conta Pessoal',
        adAccounts: [],
        totalSpent: 0,
      }

      // Assign accounts to BMs
      processedAccounts.forEach(account => {
        if (account.businessId && bmMap.has(account.businessId)) {
          const bm = bmMap.get(account.businessId)!
          bm.adAccounts.push(account)
          bm.totalSpent += account.totalSpent
        } else if (account.businessName) {
          // Try to find BM by name
          let found = false
          bmMap.forEach(bm => {
            if (bm.name === account.businessName) {
              bm.adAccounts.push(account)
              bm.totalSpent += account.totalSpent
              found = true
            }
          })
          if (!found) {
            // Create new BM
            const newBm: BusinessManagerWithAccounts = {
              id: `bm_${account.businessName.replace(/\s+/g, '_').toLowerCase()}`,
              name: account.businessName,
              adAccounts: [account],
              totalSpent: account.totalSpent,
            }
            bmMap.set(newBm.id, newBm)
          }
        } else {
          personalBm.adAccounts.push(account)
          personalBm.totalSpent += account.totalSpent
        }
      })

      // Add personal BM if it has accounts
      if (personalBm.adAccounts.length > 0) {
        bmMap.set('personal', personalBm)
      }

      const finalBms = Array.from(bmMap.values())

      setBusinessManagers(finalBms)
      setAdAccounts(processedAccounts)
      setLastSync(new Date())
      localStorage.setItem('meta-last-sync', new Date().toISOString())

      toast({
        title: 'Dados sincronizados!',
        description: `${processedAccounts.length} contas de anuncio atualizadas.`,
        className: 'bg-green-500 text-white border-green-600',
      })
    } catch (error) {
      console.error('Sync error:', error)
      toast({
        title: 'Erro na sincronizacao',
        description: error instanceof Error ? error.message : 'Falha ao buscar dados do Meta',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, fetchAdAccounts, fetchBusinessManagers, fetchInsights])

  // Refresh data
  const refreshData = useCallback(async () => {
    await syncAllData()
  }, [syncAllData])

  // Connect with token
  const connect = useCallback((token: string, expiry?: Date) => {
    setAccessToken(token)
    setTokenExpiry(expiry || null)
    setIsConnected(true)

    localStorage.setItem('meta-access-token', token)
    if (expiry) {
      localStorage.setItem('meta-token-expiry', expiry.toISOString())
    }

    // Sync data after connecting
    setTimeout(() => {
      syncAllData()
    }, 100)
  }, [syncAllData])

  // Disconnect
  const disconnect = useCallback(() => {
    setAccessToken(null)
    setTokenExpiry(null)
    setIsConnected(false)
    setBusinessManagers([])
    setAdAccounts([])
    setLastSync(null)

    localStorage.removeItem('meta-access-token')
    localStorage.removeItem('meta-token-expiry')
    localStorage.removeItem('meta-cached-data')
    localStorage.removeItem('meta-last-sync')

    toast({
      title: 'Desconectado',
      description: 'Sua conta Meta foi desconectada.',
      className: 'bg-green-500 text-white border-green-600',
    })
  }, [])

  // Set manual token
  const setManualToken = useCallback((token: string) => {
    // Calculate expiry (60 days from now for long-lived tokens)
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + 60)

    connect(token, expiry)
  }, [connect])

  return (
    <MetaContext.Provider
      value={{
        isConnected,
        isLoading,
        accessToken,
        tokenExpiry,
        businessManagers,
        adAccounts,
        lastSync,
        connect,
        disconnect,
        refreshData,
        fetchInsights,
        syncAllData,
        setManualToken,
      }}
    >
      {children}
    </MetaContext.Provider>
  )
}

export function useMeta() {
  const context = useContext(MetaContext)
  if (context === undefined) {
    throw new Error('useMeta must be used within a MetaProvider')
  }
  return context
}
