'use client'

import { useState, useEffect, useCallback } from 'react'

interface DashboardStats {
  revenue: number
  profit: number
  orders: number
  avgTicket: number
  deliveryRate: number
  returnRate: number
  roas: number
  visitors: number
  delivered: number
  inTransit: number
  returned: number
  pending: number
  failed: number
  total: number
  changes: {
    revenue: number
    orders: number
  }
}

interface RecentOrder {
  id: string
  customerName: string
  total: number
  status: string
  paymentStatus: string
  createdAt: string
  country?: {
    code: string
  }
}

interface UseDashboardDataResult {
  stats: DashboardStats | null
  recentOrders: RecentOrder[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

const defaultStats: DashboardStats = {
  revenue: 0,
  profit: 0,
  orders: 0,
  avgTicket: 0,
  deliveryRate: 0,
  returnRate: 0,
  roas: 0,
  visitors: 0,
  delivered: 0,
  inTransit: 0,
  returned: 0,
  pending: 0,
  failed: 0,
  total: 0,
  changes: {
    revenue: 0,
    orders: 0,
  },
}

export function useDashboardData(period: string, countryId?: string): UseDashboardDataResult {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Buscar estatísticas e pedidos recentes em paralelo
      const [statsRes, ordersRes] = await Promise.all([
        fetch(`/api/orders/stats?period=${period}${countryId ? `&countryId=${countryId}` : ''}`),
        fetch(`/api/orders?limit=5`),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      } else {
        // Se a API falhar, usar dados vazios
        setStats(defaultStats)
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setRecentOrders(ordersData.data || [])
      } else {
        setRecentOrders([])
      }
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err)
      setError('Erro ao carregar dados')
      setStats(defaultStats)
      setRecentOrders([])
    } finally {
      setIsLoading(false)
    }
  }, [period, countryId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    stats,
    recentOrders,
    isLoading,
    error,
    refetch: fetchData,
  }
}
