'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  Check,
  Zap,
  Crown,
  Rocket,
  ShoppingCart,
  Users,
  BarChart3,
  Globe,
  MessageSquare,
  Shield,
  Sparkles,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

interface PricingPlan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  icon: React.ElementType
  color: string
  features: string[]
  highlighted?: boolean
  badge?: string
}

const plans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Para quem esta comecando no COD',
    monthlyPrice: 97,
    yearlyPrice: 970,
    icon: Zap,
    color: 'text-blue-500',
    features: [
      'Ate 500 pedidos/mes',
      '1 loja integrada',
      'Dashboard basico',
      'Rastreamento de entregas',
      'Suporte por email',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Para lojas em crescimento',
    monthlyPrice: 197,
    yearlyPrice: 1970,
    icon: Rocket,
    color: 'text-primary',
    highlighted: true,
    badge: 'Mais Popular',
    features: [
      'Ate 2.000 pedidos/mes',
      '3 lojas integradas',
      'Dashboard avancado',
      'Integracao Facebook CAPI',
      'Relatorios de ROI',
      'Gestao de socios',
      'Suporte prioritario',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Para operacoes de alto volume',
    monthlyPrice: 497,
    yearlyPrice: 4970,
    icon: Crown,
    color: 'text-purple-500',
    features: [
      'Pedidos ilimitados',
      'Lojas ilimitadas',
      'Todos os recursos Pro',
      'Multi-pais',
      'API personalizada',
      'Integracao N1 Warehouse',
      'Gerente de conta dedicado',
      'SLA garantido',
    ],
  },
]

export default function PricingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isYearly, setIsYearly] = useState(false)

  const handleSelectPlan = (planId: string) => {
    toast({
      title: 'Plano selecionado',
      description: `Voce selecionou o plano ${planId}. Em breve implementaremos o checkout.`,
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planos e Precos</h1>
          <p className="text-muted-foreground">
            Escolha o plano ideal para sua operacao COD
          </p>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <Label htmlFor="billing-toggle" className={!isYearly ? 'font-semibold' : 'text-muted-foreground'}>
          Mensal
        </Label>
        <Switch
          id="billing-toggle"
          checked={isYearly}
          onCheckedChange={setIsYearly}
        />
        <Label htmlFor="billing-toggle" className={isYearly ? 'font-semibold' : 'text-muted-foreground'}>
          Anual
          <Badge variant="secondary" className="ml-2 bg-green-500/10 text-green-600">
            Economize 17%
          </Badge>
        </Label>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice
          const period = isYearly ? '/ano' : '/mes'

          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${
                plan.highlighted
                  ? 'border-primary shadow-lg shadow-primary/10 scale-105'
                  : 'border-border/60'
              }`}
            >
              {plan.badge && (
                <Badge
                  className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground"
                >
                  {plan.badge}
                </Badge>
              )}

              <CardHeader className="text-center pb-2">
                <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted ${plan.color}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{formatCurrency(price)}</span>
                    <span className="text-muted-foreground">{period}</span>
                  </div>
                  {isYearly && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Equivale a {formatCurrency(price / 12)}/mes
                    </p>
                  )}
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className={`w-full ${plan.highlighted ? 'btn-glow' : ''}`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.highlighted ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Comecar agora
                    </>
                  ) : (
                    'Selecionar plano'
                  )}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Features Comparison */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Todos os planos incluem</CardTitle>
          <CardDescription>Recursos essenciais para gerenciar sua operacao COD</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                <ShoppingCart className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">Gestao de Pedidos</p>
                <p className="text-sm text-muted-foreground">Acompanhe todos os seus pedidos em um so lugar</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                <BarChart3 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium">Dashboard em Tempo Real</p>
                <p className="text-sm text-muted-foreground">Metricas e KPIs atualizados constantemente</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
                <Globe className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="font-medium">Multi-moeda</p>
                <p className="text-sm text-muted-foreground">Opere em diferentes paises e moedas</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
                <Shield className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="font-medium">Seguranca Avancada</p>
                <p className="text-sm text-muted-foreground">Seus dados protegidos com criptografia</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact CTA */}
      <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Precisa de um plano personalizado?</p>
              <p className="text-sm text-muted-foreground">
                Entre em contato para discutir suas necessidades especificas
              </p>
            </div>
          </div>
          <Button variant="outline">
            Falar com vendas
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
