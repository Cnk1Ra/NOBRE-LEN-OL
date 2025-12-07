'use client'

import { useNotifications } from '@/contexts/notifications-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Bell,
  Package,
  Truck,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Trash2,
  CheckCheck,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

const notificationIcons = {
  order: Package,
  delivery: Truck,
  stock: AlertTriangle,
  success: CheckCircle,
  warning: AlertTriangle,
  system: Info,
}

const notificationColors = {
  order: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  delivery: 'text-green-500 bg-green-500/10 border-green-500/20',
  stock: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  success: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  warning: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  system: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
}

const typeLabels = {
  order: 'Pedido',
  delivery: 'Entrega',
  stock: 'Estoque',
  success: 'Sucesso',
  warning: 'Alerta',
  system: 'Sistema',
}

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications()

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Notificacoes</h1>
              {unreadCount > 0 && (
                <Badge className="bg-primary text-primary-foreground">
                  {unreadCount} novas
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Gerencie todas as suas notificacoes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todas como lidas
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive"
              onClick={clearAll}
            >
              <Trash2 className="h-4 w-4" />
              Limpar todas
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Bell className="h-8 w-8 opacity-50" />
            </div>
            <p className="text-lg font-medium">Nenhuma notificacao</p>
            <p className="text-sm">Voce esta em dia com tudo!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notif) => {
              const IconComponent = notificationIcons[notif.type] || Info
              const colorClass = notificationColors[notif.type] || notificationColors.system

              return (
                <div
                  key={notif.id}
                  className={cn(
                    'group flex gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer',
                    notif.unread && 'bg-primary/5'
                  )}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border',
                    colorClass
                  )}>
                    <IconComponent className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={cn(
                            "text-sm",
                            notif.unread ? "font-semibold" : "font-medium"
                          )}>
                            {notif.title}
                          </p>
                          <Badge variant="outline" className="text-[10px] h-5">
                            {typeLabels[notif.type]}
                          </Badge>
                          {notif.unread && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notif.description}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-2">
                          {notif.time}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeNotification(notif.id)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Settings Link */}
      <div className="flex justify-center">
        <Link href="/dashboard/settings?tab=notifications">
          <Button variant="link" className="text-muted-foreground">
            Configurar preferencias de notificacoes
          </Button>
        </Link>
      </div>
    </div>
  )
}
