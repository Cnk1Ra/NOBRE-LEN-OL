'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCircle,
  Package,
  Truck,
  CreditCard,
  MessageSquare,
  Phone,
  RefreshCcw,
  ExternalLink,
  ChevronRight,
  Inbox,
  Loader2,
} from 'lucide-react'
import { formatCurrency, getRelativeTime } from '@/lib/utils'

interface PendingItem {
  id: string
  type: 'delivery' | 'payment' | 'stock' | 'support' | 'return'
  title: string
  description: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  createdAt: string
  relatedOrderId?: string
  customerName?: string
  amount?: number
  daysOverdue?: number
}

// Pending items - starts empty, will be populated from API
const mockPendingItems: PendingItem[] = []

const typeIcons = {
  delivery: Truck,
  payment: CreditCard,
  stock: Package,
  support: MessageSquare,
  return: RefreshCcw,
}

const typeLabels = {
  delivery: 'Entrega',
  payment: 'Pagamento',
  stock: 'Estoque',
  support: 'Suporte',
  return: 'Devolução',
}

const priorityColors = {
  urgent: 'destructive',
  high: 'warning',
  medium: 'secondary',
  low: 'outline',
} as const

const priorityLabels = {
  urgent: 'Urgente',
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
}

export default function PendingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filteredItems = activeTab === 'all'
    ? mockPendingItems
    : mockPendingItems.filter(item => item.type === activeTab)

  const urgentCount = mockPendingItems.filter(i => i.priority === 'urgent').length
  const highCount = mockPendingItems.filter(i => i.priority === 'high').length
  const deliveryCount = mockPendingItems.filter(i => i.type === 'delivery').length
  const paymentCount = mockPendingItems.filter(i => i.type === 'payment').length

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
    toast({
      title: 'Atualizado',
      description: 'Lista de pendencias atualizada com sucesso',
    })
  }, [toast])

  const handleResolve = useCallback((itemId: string, itemTitle: string) => {
    toast({
      title: 'Pendencia resolvida',
      description: `"${itemTitle}" foi marcada como resolvida`,
    })
  }, [toast])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pendências</h1>
          <p className="text-muted-foreground">
            Itens que requerem sua atenção imediata
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="mr-2 h-4 w-4" />
          )}
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-red-200 dark:border-red-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">{urgentCount}</p>
                <p className="text-xs text-muted-foreground">Urgentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-500">{highCount}</p>
                <p className="text-xs text-muted-foreground">Alta Prioridade</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Truck className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{deliveryCount}</p>
                <p className="text-xs text-muted-foreground">Entregas Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{paymentCount}</p>
                <p className="text-xs text-muted-foreground">Pagamentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            Todas ({mockPendingItems.length})
          </TabsTrigger>
          <TabsTrigger value="delivery">
            Entregas ({mockPendingItems.filter(i => i.type === 'delivery').length})
          </TabsTrigger>
          <TabsTrigger value="payment">
            Pagamentos ({mockPendingItems.filter(i => i.type === 'payment').length})
          </TabsTrigger>
          <TabsTrigger value="stock">
            Estoque ({mockPendingItems.filter(i => i.type === 'stock').length})
          </TabsTrigger>
          <TabsTrigger value="support">
            Suporte ({mockPendingItems.filter(i => i.type === 'support').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Inbox className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Nenhuma pendencia</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  Parabens! Voce nao tem pendencias no momento. Continue acompanhando seus pedidos e entregas.
                </p>
                <Link href="/dashboard/orders">
                  <Button className="mt-4">
                    Ver Pedidos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const Icon = typeIcons[item.type]
                return (
                  <Card key={item.id} className={item.priority === 'urgent' ? 'border-red-200 dark:border-red-900' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                          item.priority === 'urgent' ? 'bg-red-500/10' :
                          item.priority === 'high' ? 'bg-orange-500/10' :
                          'bg-muted'
                        }`}>
                          <Icon className={`h-5 w-5 ${
                            item.priority === 'urgent' ? 'text-red-500' :
                            item.priority === 'high' ? 'text-orange-500' :
                            'text-muted-foreground'
                          }`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-semibold text-sm">{item.title}</h4>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                            <Badge variant={priorityColors[item.priority]}>
                              {priorityLabels[item.priority]}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            {item.customerName && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {item.customerName}
                              </span>
                            )}
                            {item.amount && (
                              <span className="font-medium text-foreground">
                                {formatCurrency(item.amount, 'BRL')}
                              </span>
                            )}
                            {item.daysOverdue && item.daysOverdue > 0 && (
                              <span className="text-red-500">
                                {item.daysOverdue} dias atrasado
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getRelativeTime(item.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button size="sm" variant="outline" onClick={() => handleResolve(item.id, item.title)}>
                            Resolver
                          </Button>
                          {item.relatedOrderId && (
                            <Link href={`/dashboard/orders/${item.relatedOrderId}`}>
                              <Button size="sm" variant="ghost">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acoes Rapidas</CardTitle>
          <CardDescription>Resolva multiplas pendencias de uma vez</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Link href="/dashboard/deliveries">
              <Button variant="outline" className="w-full justify-start h-auto py-3">
                <Truck className="mr-3 h-5 w-5 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium">Reagendar Entregas</p>
                  <p className="text-xs text-muted-foreground">{deliveryCount} entregas pendentes</p>
                </div>
                <ChevronRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/financial">
              <Button variant="outline" className="w-full justify-start h-auto py-3">
                <CreditCard className="mr-3 h-5 w-5 text-green-500" />
                <div className="text-left">
                  <p className="font-medium">Cobrar Pagamentos</p>
                  <p className="text-xs text-muted-foreground">{paymentCount} pagamentos pendentes</p>
                </div>
                <ChevronRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/tasks">
              <Button variant="outline" className="w-full justify-start h-auto py-3">
                <MessageSquare className="mr-3 h-5 w-5 text-purple-500" />
                <div className="text-left">
                  <p className="font-medium">Responder Tickets</p>
                  <p className="text-xs text-muted-foreground">Ver tarefas abertas</p>
                </div>
                <ChevronRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
