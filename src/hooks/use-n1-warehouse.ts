'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { N1Order, N1_STATUS_MAP } from '@/lib/n1-warehouse'

interface UseN1WarehouseOptions {
  autoSync?: boolean
  syncInterval?: number // in milliseconds
  enableSSE?: boolean
}

interface N1SyncStatus {
  connected: boolean
  mode: 'production' | 'demo'
  lastSyncAt: string | null
  message: string
}

interface UseN1WarehouseReturn {
  orders: N1Order[]
  isLoading: boolean
  isSyncing: boolean
  error: string | null
  syncStatus: N1SyncStatus
  totalOrders: number
  page: number
  totalPages: number
  // Actions
  fetchOrders: (params?: FetchOrdersParams) => Promise<void>
  syncOrders: () => Promise<void>
  setPage: (page: number) => void
  refreshStatus: () => Promise<void>
}

interface FetchOrdersParams {
  page?: number
  limit?: number
  status?: string
  country?: string
}

export function useN1Warehouse(options: UseN1WarehouseOptions = {}): UseN1WarehouseReturn {
  const { autoSync = false, syncInterval = 30000, enableSSE = false } = options

  const [orders, setOrders] = useState<N1Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [syncStatus, setSyncStatus] = useState<N1SyncStatus>({
    connected: false,
    mode: 'demo',
    lastSyncAt: null,
    message: 'Verificando conexão...',
  })

  const eventSourceRef = useRef<EventSource | null>(null)
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch orders from API
  const fetchOrders = useCallback(async (params: FetchOrdersParams = {}) => {
    try {
      setIsLoading(true)
      setError(null)

      const searchParams = new URLSearchParams()
      searchParams.set('page', (params.page || page).toString())
      searchParams.set('limit', (params.limit || 50).toString())
      if (params.status) searchParams.set('status', params.status)
      if (params.country) searchParams.set('country', params.country)

      const response = await fetch(`/api/n1/orders?${searchParams.toString()}`)
      const data = await response.json()

      if (data.success) {
        setOrders(data.orders)
        setTotalOrders(data.total)
        setTotalPages(data.pages)
        setSyncStatus(prev => ({
          ...prev,
          lastSyncAt: data.lastSyncAt,
        }))
      } else {
        throw new Error(data.error || 'Failed to fetch orders')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar pedidos')
    } finally {
      setIsLoading(false)
    }
  }, [page])

  // Trigger full sync
  const syncOrders = useCallback(async () => {
    try {
      setIsSyncing(true)
      setError(null)

      const response = await fetch('/api/n1/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await response.json()

      if (data.success) {
        setSyncStatus(prev => ({
          ...prev,
          lastSyncAt: data.lastSyncAt,
        }))
        // Refresh orders after sync
        await fetchOrders()
      } else {
        throw new Error(data.error || 'Sync failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na sincronização')
    } finally {
      setIsSyncing(false)
    }
  }, [fetchOrders])

  // Check connection status
  const refreshStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/n1/sync')
      const data = await response.json()

      setSyncStatus({
        connected: data.connected,
        mode: data.mode || 'demo',
        lastSyncAt: data.lastSyncAt,
        message: data.message || (data.connected ? 'Conectado' : 'Desconectado'),
      })
    } catch {
      setSyncStatus(prev => ({
        ...prev,
        connected: false,
        message: 'Erro ao verificar conexão',
      }))
    }
  }, [])

  // Setup SSE for real-time updates
  useEffect(() => {
    if (!enableSSE) return

    const setupSSE = () => {
      eventSourceRef.current = new EventSource('/api/n1/events')

      eventSourceRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === 'order_update' && data.order) {
            setOrders(prev => {
              const index = prev.findIndex(o => o.id === data.order.id)
              if (index >= 0) {
                const updated = [...prev]
                updated[index] = data.order
                return updated
              }
              return prev
            })
          }

          if (data.type === 'connected') {
            setSyncStatus(prev => ({
              ...prev,
              connected: true,
              message: 'Conectado (tempo real)',
            }))
          }
        } catch (err) {
          console.error('SSE parse error:', err)
        }
      }

      eventSourceRef.current.onerror = () => {
        setSyncStatus(prev => ({
          ...prev,
          connected: false,
          message: 'Conexão perdida, reconectando...',
        }))

        // Reconnect after 5 seconds
        setTimeout(() => {
          if (eventSourceRef.current) {
            eventSourceRef.current.close()
          }
          setupSSE()
        }, 5000)
      }
    }

    setupSSE()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [enableSSE])

  // Setup auto-sync interval
  useEffect(() => {
    if (!autoSync) return

    syncIntervalRef.current = setInterval(() => {
      fetchOrders()
    }, syncInterval)

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [autoSync, syncInterval, fetchOrders])

  // Initial fetch
  useEffect(() => {
    refreshStatus()
    fetchOrders()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    orders,
    isLoading,
    isSyncing,
    error,
    syncStatus,
    totalOrders,
    page,
    totalPages,
    fetchOrders,
    syncOrders,
    setPage,
    refreshStatus,
  }
}

// Helper hook to compare DOD orders with N1 orders
export function useN1Comparison(dodOrders: Array<{ id: string; [key: string]: any }>) {
  const { orders: n1Orders, ...rest } = useN1Warehouse({ autoSync: true, syncInterval: 30000 })

  const comparisonData = dodOrders.map(dod => {
    const n1Order = n1Orders.find(n1 => n1.externalRef === dod.id)
    return {
      ...dod,
      n1Order: n1Order || null,
      syncStatus: n1Order ? 'synced' : 'not_found',
      n1Status: n1Order?.status,
      n1StatusLabel: n1Order?.statusLabel || (n1Order?.status ? N1_STATUS_MAP[n1Order.status]?.label : null),
    }
  })

  const stats = {
    total: dodOrders.length,
    synced: comparisonData.filter(o => o.syncStatus === 'synced').length,
    notFound: comparisonData.filter(o => o.syncStatus === 'not_found').length,
    syncRate: dodOrders.length > 0
      ? ((comparisonData.filter(o => o.syncStatus === 'synced').length / dodOrders.length) * 100).toFixed(1)
      : '0',
  }

  return {
    comparisonData,
    n1Orders,
    stats,
    ...rest,
  }
}

export { N1_STATUS_MAP }
