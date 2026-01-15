'use client'

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react'

export type NotificationType = 'order' | 'delivery' | 'stock' | 'system' | 'success' | 'warning'

export interface Notification {
  id: string
  title: string
  description: string
  time: string
  timestamp: Date
  unread: boolean
  type: NotificationType
}

export interface NotificationPreferences {
  order: boolean
  delivery: boolean
  stock: boolean
  system: boolean
  success: boolean
  warning: boolean
  sound: boolean
  email: boolean
  push: boolean
}

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'unread'>) => void
  preferences: NotificationPreferences
  updatePreference: (key: keyof NotificationPreferences, value: boolean) => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

// Notificações - começam vazias, serão populadas pelo sistema
const initialNotifications: Notification[] = []

const defaultPreferences: NotificationPreferences = {
  order: true,
  delivery: true,
  stock: true,
  system: true,
  success: true,
  warning: true,
  sound: true,
  email: false,
  push: true,
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences)

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('dod-notification-preferences')
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences)
        setPreferences(parsed)
      } catch {
        // Invalid JSON, use default
      }
    }
  }, [])

  const unreadCount = notifications.filter(n => n.unread).length

  const updatePreference = useCallback((key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: value }
      // Save to localStorage
      localStorage.setItem('dod-notification-preferences', JSON.stringify(updated))
      return updated
    })
  }, [])

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
        preferences,
        updatePreference,
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
