'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  CreditCard,
  Zap,
  Rocket,
  Crown,
  Check,
  Calendar,
  TrendingUp,
  ShoppingCart,
  ArrowRight,
  AlertCircle,
  History,
  Download,
  Settings,
} from 'lucide-react'

interface SubscriptionData {
  plan: string
  status: 'active' | 'trial' | 'expired' | 'cancelled'
  currentPeriodEnd: string
  ordersUsed: number
  ordersLimit: number
  storesUsed: number
  storesLimit: number
}

// Initial state - will be populated from API
const initialSubscription: SubscriptionData = {
  plan: 'free',
  status: 'trial',
  currentPeriodEnd: '',
  ordersUsed: 0,
  ordersLimit: 100,
  storesUsed: 0,
  storesLimit: 1,
}

const planDetails: Record<string, { name: string; icon: React.ElementType; color: string; price: number }> = {
  free: { name: 'Trial', icon: Zap, color: 'text-slate-500', price: 0 },
  starter: { name: 'Starter', icon: Zap, color: 'text-blue-500', price: 97 },
  pro: { name: 'Pro', icon: Rocket, color: 'text-primary', price: 197 },
  enterprise: { name: 'Enterprise', icon: Crown, color: 'text-purple-500', price: 497 },
}

// Payment history - starts empty, will be populated from API
const paymentHistory: Array<{
  id: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
  invoice: string
}> = []

export default function AssinaturasPage() {
  const { data: session } = useSession()
  const [subscription, setSubscription] = useState<SubscriptionData>(initialSubscription)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call - replace with actual API
    const fetchSubscription = async () => {
      setIsLoading(true)
      try {
        // TODO: Fetch actual subscription data from API
        // const response = await fetch('/api/subscription')
        // const data = await response.json()
        // setSubscription(data)
        setSubscription(initialSubscription)
      } catch (error) {
        console.error('Erro ao buscar assinatura:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSubscription()
  }, [])

  const currentPlan = planDetails[subscription.plan] || planDetails.free
  const PlanIcon = currentPlan.icon
  const ordersPercentage = subscription.ordersLimit > 0
    ? (subscription.ordersUsed / subscription.ordersLimit) * 100
    : 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getStatusBadge = (status: SubscriptionData['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Ativo</Badge>
      case 'trial':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Periodo de Teste</Badge>
      case 'expired':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Expirado</Badge>
      case 'cancelled':
        return <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20">Cancelado</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Minha Assinatura</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie seu plano e pagamentos
              </p>
            </div>
          </div>
        </div>
        <Link href="/dashboard/pricing">
          <Button className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Fazer Upgrade
          </Button>
        </Link>
      </div>

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`h-14 w-14 rounded-2xl bg-muted flex items-center justify-center ${currentPlan.color}`}>
                <PlanIcon className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <CardTitle className="text-xl">Plano {currentPlan.name}</CardTitle>
                  {getStatusBadge(subscription.status)}
                </div>
                <CardDescription>
                  {currentPlan.price > 0
                    ? `${formatCurrency(currentPlan.price)}/mes`
                    : 'Gratuito por tempo limitado'
                  }
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Gerenciar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {subscription.status === 'trial' && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Periodo de teste ativo</p>
                <p className="text-xs text-muted-foreground">
                  Aproveite para explorar todos os recursos. Faca upgrade quando estiver pronto.
                </p>
              </div>
              <Link href="/dashboard/pricing">
                <Button size="sm" variant="outline" className="gap-1">
                  Ver planos
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Orders Usage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  Pedidos utilizados
                </span>
                <span className="font-medium">
                  {subscription.ordersUsed} / {subscription.ordersLimit}
                </span>
              </div>
              <Progress value={ordersPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {subscription.ordersLimit - subscription.ordersUsed} pedidos restantes este mes
              </p>
            </div>

            {/* Stores Usage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  Lojas integradas
                </span>
                <span className="font-medium">
                  {subscription.storesUsed} / {subscription.storesLimit}
                </span>
              </div>
              <Progress
                value={subscription.storesLimit > 0 ? (subscription.storesUsed / subscription.storesLimit) * 100 : 0}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {subscription.storesLimit - subscription.storesUsed} lojas disponiveis para conectar
              </p>
            </div>
          </div>

          {subscription.currentPeriodEnd && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Proxima renovacao: {subscription.currentPeriodEnd}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Included */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            Recursos inclusos no seu plano
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              <span>Dashboard em tempo real</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              <span>Rastreamento de entregas</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              <span>Gestao de pedidos</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              <span>Relatorios basicos</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              <span>Suporte por email</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              <span>Multi-moeda</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Historico de Pagamentos
          </CardTitle>
          <CardDescription>
            Seus ultimos pagamentos e faturas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paymentHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <History className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum pagamento registrado</p>
              <p className="text-xs text-muted-foreground">Os pagamentos aparecerao aqui apos o upgrade</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Assinatura Mensal</p>
                      <p className="text-xs text-muted-foreground">{payment.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Download className="h-4 w-4" />
                      Fatura
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Need Help */}
      <Card className="bg-gradient-to-r from-muted/50 to-muted/30">
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-6">
          <div>
            <p className="font-semibold">Precisa de ajuda com sua assinatura?</p>
            <p className="text-sm text-muted-foreground">
              Nossa equipe esta pronta para ajudar com duvidas sobre cobranca ou cancelamento
            </p>
          </div>
          <Button variant="outline">
            Falar com suporte
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
