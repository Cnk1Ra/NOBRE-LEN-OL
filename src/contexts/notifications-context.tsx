'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'

export interface Notification {
  id: string
  title: string
  description: string
  time: string
  timestamp: Date
  unread: boolean
  type: 'order' | 'delivery' | 'stock' | 'system' | 'success' | 'warning'
}

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'unread'>) => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

// Notificacoes iniciais mock
const initialNotifications: Notification[] = [
  {
    id: '1',
    title: 'Novo pedido recebido',
    description: 'Pedido #4521 - R$ 289,90',
    time: '2 min',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    unread: true,
    type: 'order',
  },
  {
    id: '2',
    title: 'Entrega confirmada',
    description: 'Pedido #4518 foi entregue com sucesso',
    time: '15 min',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    unread: true,
    type: 'delivery',
  },
  {
    id: '3',
    title: 'Estoque baixo',
    description: 'Serum Vitamina C - Apenas 8 unidades',
    time: '1h',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    unread: true,
    type: 'stock',
  },
  {
    id: '4',
    title: 'Meta atingida!',
    description: 'Voce bateu a meta de vendas do dia!',
    time: '2h',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    unread: false,
    type: 'success',
  },
  {
    id: '5',
    title: 'Pagamento confirmado',
    description: 'Pedido #4515 - Pagamento via PIX',
    time: '3h',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    unread: false,
    type: 'order',
  },
]

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

  const unreadCount = notifications.filter(n => n.unread).length

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, unread: false } : n))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'unread'>) => {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date(),
        unread: true,
      }
      setNotifications(prev => [newNotification, ...prev])
    },
    []
  )

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        addNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
}
