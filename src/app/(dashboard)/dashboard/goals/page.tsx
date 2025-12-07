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

// Helper to calculate milestone progress for a given revenue
const calculateMilestoneProgress = (revenue: number) => {
  let prevValue = 0
  for (let i = 0; i < MILESTONES.length; i++) {
    const milestone = MILESTONES[i]
    if (revenue < milestone.value) {
      const progress = ((revenue - prevValue) / (milestone.value - prevValue)) * 100
      const remaining = milestone.value - revenue
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
}

export default function GoalsPage() {
  const { countries, getCountryData, selectedCountry, isAllSelected } = useCountry()

  const activeCountries = countries.filter(c => c.active)

  // Get country progress data for each active country (using TOTAL revenue for milestones)
  const countryProgressData = useMemo(() => {
    return activeCountries.map(country => {
      const data = getCountryData(country.code)
      const progress = calculateMilestoneProgress(data.totalRevenue) // Usa faturamento total histórico
      return {
        country,
        totalRevenue: data.totalRevenue,  // Faturamento total histórico
        monthlyRevenue: data.revenue,      // Faturamento do mês
        ...progress
      }
    }).sort((a, b) => b.totalRevenue - a.totalRevenue) // Sort by total revenue descending
  }, [activeCountries, getCountryData])

  // Get selected country progress or primary country
  const currentCountryProgress = useMemo(() => {
    if (!isAllSelected && selectedCountry) {
      const found = countryProgressData.find(c => c.country.code === selectedCountry.code)
      if (found) return found
    }
    // Default to highest revenue country
    return countryProgressData[0] || null
  }, [isAllSelected, selectedCountry, countryProgressData])

  const formatCurrency = (value: number, symbol: string) => {
    if (value >= 1000000) return `${symbol} ${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${symbol} ${(value / 1000).toFixed(0)}K`
    return `${symbol} ${value.toFixed(0)}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metas de Faturamento</h1>
          <p className="text-muted-foreground">
            Acompanhe o progresso de cada país
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          🌍 {activeCountries.length} países ativos
        </Badge>
      </div>

      {/* Progress Cards for Each Country */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {countryProgressData.map(({ country, totalRevenue, monthlyRevenue, nextMilestone, progress, remaining, completedMilestones }) => (
          <Card key={country.code} className="overflow-hidden">
            <div className={cn("h-2 bg-gradient-to-r", nextMilestone.color)} />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{country.flag}</span>
                  <div>
                    <CardTitle className="text-lg">{country.name}</CardTitle>
                    <CardDescription>{country.currency}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className={cn("text-sm", nextMilestone.textColor)}>
                  {completedMilestones}/{MILESTONES.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-bold">{formatCurrency(totalRevenue, country.currencySymbol)}</p>
                <p className="text-xs text-muted-foreground mb-1">
                  Este mês: {formatCurrency(monthlyRevenue, country.currencySymbol)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Falta {formatCurrency(remaining, country.currencySymbol)} → {nextMilestone.label}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{progress.toFixed(1)}%</span>
                  <span>{nextMilestone.label}</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", nextMilestone.color)}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              <div className={cn("p-3 rounded-lg", nextMilestone.bgColor)}>
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = nextMilestone.icon
                    return <Icon className={cn("h-5 w-5", nextMilestone.textColor)} />
                  })()}
                  <div>
                    <p className="text-sm font-medium">{nextMilestone.title}</p>
                    <p className="text-xs text-muted-foreground">{nextMilestone.reward}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Cards - Summary */}
      {currentCountryProgress && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeCountries.length}</p>
                  <p className="text-xs text-muted-foreground">Países Ativos</p>
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
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      countryProgressData.reduce((sum, c) => sum + c.totalRevenue, 0),
                      'R$'
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Histórico</p>
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
                  <p className="text-2xl font-bold">
                    {countryProgressData.reduce((sum, c) => sum + c.completedMilestones, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Metas Totais</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <span className="text-lg">{currentCountryProgress.country.flag}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">{currentCountryProgress.country.name}</p>
                  <p className="text-xs text-muted-foreground">Maior Faturamento</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
            {MILESTONES.map((milestone) => {
              // Find countries that have completed this milestone (using totalRevenue)
              const countriesCompleted = countryProgressData.filter(c => c.totalRevenue >= milestone.value)
              const countriesInProgress = countryProgressData.filter(
                c => c.totalRevenue < milestone.value && c.nextMilestone.value === milestone.value
              )
              const hasAnyCompleted = countriesCompleted.length > 0
              const hasAnyInProgress = countriesInProgress.length > 0
              const Icon = milestone.icon

              return (
                <div
                  key={milestone.value}
                  className={cn(
                    "p-4 rounded-xl border transition-all",
                    hasAnyCompleted && "bg-green-500/5 border-green-500/30",
                    hasAnyInProgress && !hasAnyCompleted && cn(milestone.bgColor, "border-2"),
                    !hasAnyCompleted && !hasAnyInProgress && "opacity-60"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                      hasAnyCompleted ? "bg-green-500/10" : milestone.bgColor
                    )}>
                      {hasAnyCompleted ? (
                        <Check className="h-6 w-6 text-green-500" />
                      ) : !hasAnyInProgress ? (
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      ) : (
                        <Icon className={cn("h-6 w-6", milestone.textColor)} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{milestone.title}</h3>
                        <Badge variant="outline" className={cn(
                          hasAnyCompleted && "bg-green-500/10 text-green-500 border-green-500/30"
                        )}>
                          {milestone.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{milestone.description}</p>

                      {/* Countries that completed this milestone */}
                      {hasAnyCompleted && (
                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground mb-1">Países que alcançaram:</p>
                          <div className="flex flex-wrap gap-1">
                            {countriesCompleted.map(c => (
                              <Badge key={c.country.code} variant="success" className="text-xs">
                                {c.country.flag} {c.country.code}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Countries in progress for this milestone */}
                      {hasAnyInProgress && (
                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground mb-1">Em progresso:</p>
                          <div className="flex flex-wrap gap-1">
                            {countriesInProgress.map(c => (
                              <Badge key={c.country.code} variant="outline" className="text-xs">
                                {c.country.flag} {c.country.code} ({c.progress.toFixed(0)}%)
                              </Badge>
                            ))}
                          </div>
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
                      <p className="font-bold">{formatCurrency(milestone.value, 'R$')}</p>
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
