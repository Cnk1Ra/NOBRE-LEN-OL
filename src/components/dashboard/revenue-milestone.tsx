'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import { Trophy, Rocket, Crown, Star, Gem, Target, Zap, Flame } from 'lucide-react'

interface RevenueMilestoneProps {
  currentRevenue: number
  currency?: string
  className?: string
}

// Milestones em ordem crescente
const MILESTONES = [
  { value: 100000, label: '100K', color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-500', icon: Target, emoji: '🎯' },
  { value: 1000000, label: '1M', color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-500', icon: Rocket, emoji: '🚀' },
  { value: 2000000, label: '2M', color: 'from-teal-500 to-green-500', bgColor: 'bg-teal-500', icon: Star, emoji: '⭐' },
  { value: 3000000, label: '3M', color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-500', icon: Zap, emoji: '⚡' },
  { value: 4000000, label: '4M', color: 'from-orange-500 to-amber-500', bgColor: 'bg-orange-500', icon: Flame, emoji: '🔥' },
  { value: 5000000, label: '5M', color: 'from-red-500 to-pink-500', bgColor: 'bg-red-500', icon: Trophy, emoji: '🏆' },
  { value: 10000000, label: '10M', color: 'from-yellow-500 to-orange-500', bgColor: 'bg-yellow-500', icon: Crown, emoji: '👑' },
  { value: 25000000, label: '25M', color: 'from-indigo-500 to-purple-500', bgColor: 'bg-indigo-500', icon: Gem, emoji: '💎' },
  { value: 50000000, label: '50M', color: 'from-pink-500 to-rose-500', bgColor: 'bg-pink-500', icon: Gem, emoji: '💎💎' },
  { value: 100000000, label: '100M', color: 'from-amber-400 via-yellow-500 to-amber-600', bgColor: 'bg-gradient-to-r from-amber-400 to-yellow-500', icon: Crown, emoji: '🏅👑🏅' },
]

export function RevenueMilestone({ currentRevenue, currency = 'BRL', className }: RevenueMilestoneProps) {
  const { currentMilestone, nextMilestone, progress, previousValue } = useMemo(() => {
    // Encontra o milestone atual e o próximo
    let prevValue = 0
    for (let i = 0; i < MILESTONES.length; i++) {
      const milestone = MILESTONES[i]
      if (currentRevenue < milestone.value) {
        return {
          currentMilestone: i > 0 ? MILESTONES[i - 1] : null,
          nextMilestone: milestone,
          previousValue: prevValue,
          progress: ((currentRevenue - prevValue) / (milestone.value - prevValue)) * 100,
        }
      }
      prevValue = milestone.value
    }
    // Passou todos os milestones
    const lastMilestone = MILESTONES[MILESTONES.length - 1]
    return {
      currentMilestone: lastMilestone,
      nextMilestone: null,
      previousValue: lastMilestone.value,
      progress: 100,
    }
  }, [currentRevenue])

  const Icon = nextMilestone?.icon || Crown
  const isCompleted = !nextMilestone
  const milestoneIndex = MILESTONES.findIndex(m => m === nextMilestone)

  // Mensagem motivacional baseada no progresso
  const getMessage = () => {
    if (isCompleted) return 'LENDARIO! Voce conquistou todos os milestones!'
    if (progress >= 90) return 'Quase la! Falta muito pouco!'
    if (progress >= 75) return 'Excelente progresso! Continue assim!'
    if (progress >= 50) return 'Metade do caminho! Voce consegue!'
    if (progress >= 25) return 'Bom comeco! Mantenha o ritmo!'
    return 'Vamos comecar essa jornada!'
  }

  const remaining = nextMilestone ? nextMilestone.value - currentRevenue : 0

  return (
    <div className={cn('relative overflow-hidden rounded-2xl border bg-card p-4', className)}>
      {/* Background gradient animation */}
      <div className={cn(
        'absolute inset-0 opacity-10 bg-gradient-to-r',
        nextMilestone?.color || 'from-amber-400 to-yellow-500'
      )} />

      {/* Confetti effect when completed */}
      {isCompleted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            >
              {['✨', '🌟', '💫', '⭐'][Math.floor(Math.random() * 4)]}
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl',
              isCompleted
                ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-500/30'
                : cn('bg-gradient-to-br text-white', nextMilestone?.color)
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Meta de Faturamento</h3>
              <p className="text-xs text-muted-foreground">{getMessage()}</p>
            </div>
          </div>

          {/* Milestone badges */}
          <div className="flex items-center gap-1">
            {MILESTONES.slice(0, Math.min(milestoneIndex + 1, 5)).map((m, i) => (
              <div
                key={m.value}
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs transition-all',
                  currentRevenue >= m.value
                    ? cn('text-white shadow-sm', m.bgColor)
                    : 'bg-muted text-muted-foreground'
                )}
                title={m.label}
              >
                {currentRevenue >= m.value ? '✓' : i + 1}
              </div>
            ))}
            {milestoneIndex > 4 && (
              <span className="text-xs text-muted-foreground">+{milestoneIndex - 4}</span>
            )}
          </div>
        </div>

        {/* Progress section */}
        <div className="space-y-2">
          {/* Values */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold">{formatCurrency(currentRevenue, currency)}</p>
              {!isCompleted && (
                <p className="text-xs text-muted-foreground">
                  Faltam {formatCurrency(remaining, currency)} para {nextMilestone?.label}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className={cn(
                'text-lg font-bold',
                isCompleted ? 'text-amber-500' : ''
              )}>
                {nextMilestone ? nextMilestone.label : '100M+'} {nextMilestone?.emoji || '👑'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isCompleted ? 'Conquistado!' : 'Proximo milestone'}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative h-4 rounded-full bg-muted overflow-hidden">
            {/* Animated background stripes */}
            <div
              className={cn(
                'absolute inset-0 opacity-20',
                'bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_25%,rgba(255,255,255,0.2)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.2)_75%)]',
                'bg-[length:20px_20px]',
                progress > 0 && 'animate-[progress-stripes_1s_linear_infinite]'
              )}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />

            {/* Main progress */}
            <div
              className={cn(
                'absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all duration-1000 ease-out',
                nextMilestone?.color || 'from-amber-400 to-yellow-500',
                progress >= 100 && 'animate-pulse'
              )}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />

            {/* Glow effect */}
            <div
              className={cn(
                'absolute inset-y-0 rounded-full blur-sm bg-gradient-to-r opacity-50 transition-all duration-1000',
                nextMilestone?.color || 'from-amber-400 to-yellow-500'
              )}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />

            {/* Progress percentage */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn(
                'text-xs font-bold',
                progress > 50 ? 'text-white' : 'text-foreground'
              )}>
                {progress.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Mini milestones indicator */}
          <div className="flex justify-between px-1">
            <span className="text-[10px] text-muted-foreground">
              {previousValue > 0 ? formatCurrency(previousValue, currency) : '0'}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {nextMilestone ? formatCurrency(nextMilestone.value, currency) : 'MAX'}
            </span>
          </div>
        </div>

        {/* Achievement unlocked animation */}
        {progress >= 100 && !isCompleted && (
          <div className="mt-3 p-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30">
            <p className="text-xs font-medium text-center text-amber-600 dark:text-amber-400">
              🎉 Milestone {currentMilestone?.label} conquistado! Proximo: {nextMilestone?.label}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
