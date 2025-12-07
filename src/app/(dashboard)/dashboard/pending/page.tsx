'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

const mockPendingItems: PendingItem[] = [
  {
    id: '1',
    type: 'delivery',
    title: '3ª tentativa de entrega',
    description: 'Pedido #a1b2c3 - Cliente não encontrado no endereço',
    priority: 'urgent',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    relatedOrderId: 'ord_a1b2c3',
    customerName: 'João Silva',
    daysOverdue: 5,
  },
  {
    id: '2',
    type: 'payment',
    title: 'Pagamento COD não recebido',
    description: 'Pedido #d4e5f6 - Entregue há 3 dias sem confirmação',
    priority: 'urgent',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    relatedOrderId: 'ord_d4e5f6',
    customerName: 'Maria Santos',
    amount: 459.90,
    daysOverdue: 3,
  },
  {
    id: '3',
    type: 'stock',
    title: 'Estoque baixo - Produto X',
    description: 'Apenas 5 unidades restantes, previsão de esgotamento em 2 dias',
    priority: 'high',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: '4',
    type: 'support',
    title: 'Reclamação pendente',
    description: 'Cliente aguardando resposta sobre produto danificado',
    priority: 'high',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    relatedOrderId: 'ord_g7h8i9',
    customerName: 'Pedro Oliveira',
  },
  {
    id: '5',
    type: 'return',
    title: 'Devolução em análise',
    description: 'Pedido #j0k1l2 - Aguardando aprovação do parceiro',
    priority: 'medium',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    relatedOrderId: 'ord_j0k1l2',
    customerName: 'Ana Costa',
    amount: 289.90,
  },
  {
    id: '6',
    type: 'delivery',
    title: 'Endereço incompleto',
    description: 'Pedido #m3n4o5 - Falta número do apartamento',
    priority: 'medium',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    relatedOrderId: 'ord_m3n4o5',
    customerName: 'Carlos Ferreira',
  },
  {
    id: '7',
    type: 'payment',
    title: 'Parcela atrasada - Sócio',
    description: 'Pagamento do parceiro João venceu há 7 dias',
    priority: 'low',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    amount: 1250.00,
    daysOverdue: 7,
  },
  {
    id: '8',
    type: 'stock',
    title: 'Reposição pendente',
    description: 'Produto Y - Fornecedor confirmou envio para semana que vem',
    priority: 'low',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
]

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
  const [activeTab, setActiveTab] = useState('all')

  const filteredItems = activeTab === 'all'
    ? mockPendingItems
    : mockPendingItems.filter(item => item.type === activeTab)

  const urgentCount = mockPendingItems.filter(i => i.priority === 'urgent').length
  const highCount = mockPendingItems.filter(i => i.priority === 'high').length
  const deliveryCount = mockPendingItems.filter(i => i.type === 'delivery').length
  const paymentCount = mockPendingItems.filter(i => i.type === 'payment').length

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
        <Button variant="outline">
          <RefreshCcw className="mr-2 h-4 w-4" />
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
                        <Button size="sm" variant="outline">
                          Resolver
                        </Button>
                        {item.relatedOrderId && (
                          <Button size="sm" variant="ghost">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          <CardDescription>Resolva múltiplas pendências de uma vez</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button variant="outline" className="justify-start h-auto py-3">
              <Truck className="mr-3 h-5 w-5 text-blue-500" />
              <div className="text-left">
                <p className="font-medium">Reagendar Entregas</p>
                <p className="text-xs text-muted-foreground">3 entregas pendentes</p>
              </div>
              <ChevronRight className="ml-auto h-4 w-4" />
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3">
              <CreditCard className="mr-3 h-5 w-5 text-green-500" />
              <div className="text-left">
                <p className="font-medium">Cobrar Pagamentos</p>
                <p className="text-xs text-muted-foreground">2 pagamentos atrasados</p>
              </div>
              <ChevronRight className="ml-auto h-4 w-4" />
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3">
              <MessageSquare className="mr-3 h-5 w-5 text-purple-500" />
              <div className="text-left">
                <p className="font-medium">Responder Tickets</p>
                <p className="text-xs text-muted-foreground">1 ticket aberto</p>
              </div>
              <ChevronRight className="ml-auto h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
