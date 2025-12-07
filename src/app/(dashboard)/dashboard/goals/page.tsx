'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Trophy,
  Target,
  TrendingUp,
  Star,
  Award,
  Zap,
  Crown,
  Gem,
  Rocket,
  PartyPopper,
  Check,
  Lock,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCountry } from '@/contexts/country-context'

// Milestones com recompensas e detalhes
const MILESTONES = [
  {
    value: 100000,
    label: '100K',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-500',
    icon: Star,
    title: 'Primeira Estrela',
    description: 'Seu primeiro marco importante!',
    reward: 'Badge de Bronze',
    benefits: ['Acesso a relatorios basicos', 'Suporte por email'],
  },
  {
    value: 1000000,
    label: '1M',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-500',
    icon: Award,
    title: 'Primeiro Milhao',
    description: 'Voce atingiu o primeiro milhao!',
    reward: 'Badge de Prata',
    benefits: ['Relatorios avancados', 'Suporte prioritario', 'API basica'],
  },
  {
    value: 2000000,
    label: '2M',
    color: 'from-teal-500 to-green-500',
    bgColor: 'bg-teal-500/10',
    textColor: 'text-teal-500',
    icon: Zap,
    title: 'Crescimento Acelerado',
    description: 'Dobrando os resultados!',
    reward: 'Badge de Ouro',
    benefits: ['Dashboard personalizado', 'Webhooks', 'Integracao avancada'],
  },
  {
    value: 3000000,
    label: '3M',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-500',
    icon: Trophy,
    title: 'Top Performer',
    description: 'Voce esta no top 10% dos vendedores!',
    reward: 'Badge de Platina',
    benefits: ['Gerente de conta dedicado', 'API ilimitada', 'Relatorios em tempo real'],
  },
  {
    value: 4000000,
    label: '4M',
    color: 'from-orange-500 to-amber-500',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-500',
    icon: Target,
    title: 'Atirador de Elite',
    description: 'Precisao nas vendas!',
    reward: 'Badge de Diamante',
    benefits: ['Desconto em taxas', 'Ferramentas exclusivas', 'Prioridade em lancamentos'],
  },
  {
    value: 5000000,
    label: '5M',
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-500',
    icon: Crown,
    title: 'Rei das Vendas',
    description: 'Dominando o mercado!',
    reward: 'Badge de Rubi',
    benefits: ['Taxa preferencial', 'Suporte 24/7', 'Acesso beta exclusivo'],
  },
  {
    value: 10000000,
    label: '10M',
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500/10',
    textColor: 'text-yellow-500',
    icon: Gem,
    title: 'Dezena de Milhoes',
    description: 'Vendedor de elite!',
    reward: 'Badge de Esmeralda',
    benefits: ['Parceiro oficial', 'Co-marketing', 'Recursos enterprise'],
  },
  {
    value: 25000000,
    label: '25M',
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-500/10',
    textColor: 'text-indigo-500',
    icon: Rocket,
    title: 'Foguete',
    description: 'Crescimento exponencial!',
    reward: 'Badge Master',
    benefits: ['Equipe dedicada', 'SLA garantido', 'Infraestrutura dedicada'],
  },
  {
    value: 50000000,
    label: '50M',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10',
    textColor: 'text-pink-500',
    icon: PartyPopper,
    title: 'Mega Vendedor',
    description: 'Resultados extraordinarios!',
    reward: 'Badge Legend',
    benefits: ['Condicoes VIP', 'Evento exclusivo anual', 'Mentoria com experts'],
  },
  {
    value: 100000000,
    label: '100M',
    color: 'from-amber-400 to-yellow-500',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-500',
    icon: Crown,
    title: 'Lenda',
    description: 'Voce fez historia!',
    reward: 'Badge Immortal',
    benefits: ['Tudo incluido', 'Convite para board', 'Equity partnership'],
  },
]

export default function GoalsPage() {
  const { selectedCountry, isAllSelected, countries, getCountryData } = useCountry()

  const activeCountries = countries.filter(c => c.active)

  // Get current revenue based on selected country
  const currentRevenue = useMemo(() => {
    if (isAllSelected) {
      return activeCountries.reduce((sum, c) => sum + getCountryData(c.code).revenue, 0)
    }
    return selectedCountry ? getCountryData(selectedCountry.code).revenue : 0
  }, [isAllSelected, selectedCountry, activeCountries, getCountryData])

  // Get currency symbol based on selected country
  const currencySymbol = useMemo(() => {
    if (isAllSelected) return 'R$'
    return selectedCountry?.currencySymbol || 'R$'
  }, [isAllSelected, selectedCountry])

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${currencySymbol} ${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${currencySymbol} ${(value / 1000).toFixed(0)}K`
    return `${currencySymbol} ${value.toFixed(0)}`
  }

  // Calcula o milestone atual e progresso
  const currentProgress = useMemo(() => {
    let prevValue = 0
    for (let i = 0; i < MILESTONES.length; i++) {
      const milestone = MILESTONES[i]
      if (currentRevenue < milestone.value) {
        const progress = ((currentRevenue - prevValue) / (milestone.value - prevValue)) * 100
        const remaining = milestone.value - currentRevenue
        return {
          currentMilestoneIndex: i,
          nextMilestone: milestone,
          progress,
          prevValue,
          remaining,
          completedMilestones: i,
        }
      }
      prevValue = milestone.value
    }
    return {
      currentMilestoneIndex: MILESTONES.length - 1,
      nextMilestone: MILESTONES[MILESTONES.length - 1],
      progress: 100,
      prevValue: 0,
      remaining: 0,
      completedMilestones: MILESTONES.length,
    }
  }, [currentRevenue])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metas de Faturamento</h1>
          <p className="text-muted-foreground">
            Acompanhe seu progresso e desbloqueie recompensas
          </p>
        </div>
        {!isAllSelected && selectedCountry && (
          <Badge variant="outline" className="text-lg px-4 py-2">
            {selectedCountry.flag} {selectedCountry.name} ({currencySymbol})
          </Badge>
        )}
      </div>

      {/* Current Progress Card */}
      <Card className="overflow-hidden">
        <div className={cn(
          "h-2 bg-gradient-to-r",
          currentProgress.nextMilestone.color
        )} />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Progresso Atual</CardTitle>
              <CardDescription>
                Faturamento total acumulado
              </CardDescription>
            </div>
            <Badge variant="outline" className={cn("text-lg px-4 py-2", currentProgress.nextMilestone.textColor)}>
              {currentProgress.completedMilestones} / {MILESTONES.length} metas
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-bold">{formatCurrency(currentRevenue)}</p>
              <p className="text-muted-foreground">
                Falta {formatCurrency(currentProgress.remaining)} para {currentProgress.nextMilestone.label}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{currentProgress.progress.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">do proximo marco</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{formatCurrency(currentProgress.prevValue)}</span>
              <span className="font-medium">{currentProgress.nextMilestone.label}</span>
            </div>
            <div className="h-4 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                  currentProgress.nextMilestone.color
                )}
                style={{ width: `${Math.min(currentProgress.progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Next milestone preview */}
          <div className={cn(
            "p-4 rounded-xl border",
            currentProgress.nextMilestone.bgColor
          )}>
            <div className="flex items-center gap-4">
              <div className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center",
                currentProgress.nextMilestone.bgColor
              )}>
                {(() => {
                  const Icon = currentProgress.nextMilestone.icon
                  return <Icon className={cn("h-6 w-6", currentProgress.nextMilestone.textColor)} />
                })()}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{currentProgress.nextMilestone.title}</h3>
                <p className="text-sm text-muted-foreground">{currentProgress.nextMilestone.description}</p>
              </div>
              <div className="text-right">
                <Badge className={cn("bg-gradient-to-r text-white", currentProgress.nextMilestone.color)}>
                  {currentProgress.nextMilestone.reward}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{currentProgress.completedMilestones}</p>
                <p className="text-xs text-muted-foreground">Metas Alcancadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(currentRevenue)}</p>
                <p className="text-xs text-muted-foreground">Faturamento Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{currentProgress.nextMilestone.label}</p>
                <p className="text-xs text-muted-foreground">Proxima Meta</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(currentProgress.remaining)}</p>
                <p className="text-xs text-muted-foreground">Faltam</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Metas</CardTitle>
          <CardDescription>
            Desbloqueie beneficios exclusivos ao atingir cada marco
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {MILESTONES.map((milestone, index) => {
              const isCompleted = currentRevenue >= milestone.value
              const isCurrent = index === currentProgress.currentMilestoneIndex
              const isLocked = index > currentProgress.currentMilestoneIndex
              const Icon = milestone.icon

              return (
                <div
                  key={milestone.value}
                  className={cn(
                    "p-4 rounded-xl border transition-all",
                    isCompleted && "bg-green-500/5 border-green-500/30",
                    isCurrent && cn(milestone.bgColor, "border-2"),
                    isLocked && "opacity-60"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                      isCompleted ? "bg-green-500/10" : milestone.bgColor
                    )}>
                      {isCompleted ? (
                        <Check className="h-6 w-6 text-green-500" />
                      ) : isLocked ? (
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      ) : (
                        <Icon className={cn("h-6 w-6", milestone.textColor)} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{milestone.title}</h3>
                        <Badge variant="outline" className={cn(
                          isCompleted && "bg-green-500/10 text-green-500 border-green-500/30"
                        )}>
                          {milestone.label}
                        </Badge>
                        {isCompleted && (
                          <Badge variant="success">Concluido</Badge>
                        )}
                        {isCurrent && (
                          <Badge className={cn("bg-gradient-to-r text-white", milestone.color)}>
                            Em Progresso
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{milestone.description}</p>

                      {/* Progress bar for current milestone */}
                      {isCurrent && (
                        <div className="mb-3">
                          <Progress value={currentProgress.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {currentProgress.progress.toFixed(1)}% concluido
                          </p>
                        </div>
                      )}

                      {/* Benefits */}
                      <div className="flex flex-wrap gap-2">
                        {milestone.benefits.map((benefit, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold">{formatCurrency(milestone.value)}</p>
                      <p className="text-xs text-muted-foreground">{milestone.reward}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
