'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  Calendar as CalendarIcon,
  Clock,
  CalendarDays,
  CalendarRange,
  History,
  Infinity,
  Check,
} from 'lucide-react'
import { format, subDays, startOfDay, endOfDay, startOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type DateFilterPeriod = 'today' | 'yesterday' | 'week' | 'month' | 'last_month' | 'custom' | 'max'

export interface DateRange {
  from: Date
  to: Date
}

interface DateFilterProps {
  period: DateFilterPeriod
  onPeriodChange: (period: DateFilterPeriod, range: DateRange) => void
  startDate?: Date
  className?: string
}

const periodOptions = [
  { value: 'today', label: 'Hoje', icon: Clock, shortLabel: 'Hoje' },
  { value: 'yesterday', label: 'Ontem', icon: History, shortLabel: 'Ontem' },
  { value: 'week', label: 'Esta Semana', icon: CalendarDays, shortLabel: '7 dias' },
  { value: 'month', label: 'Este Mes', icon: CalendarRange, shortLabel: 'Mes' },
  { value: 'last_month', label: 'Mes Passado', icon: CalendarRange, shortLabel: 'Mes Ant.' },
  { value: 'custom', label: 'Personalizado', icon: CalendarIcon, shortLabel: 'Custom' },
  { value: 'max', label: 'MAXIMO', icon: Infinity, shortLabel: 'MAX' },
] as const

export function getDateRangeForPeriod(selectedPeriod: DateFilterPeriod, startDate: Date = new Date('2024-01-01'), customRange?: DateRange): DateRange {
  const now = new Date()
  switch (selectedPeriod) {
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) }
    case 'yesterday':
      const yesterday = subDays(now, 1)
      return { from: startOfDay(yesterday), to: endOfDay(yesterday) }
    case 'week':
      return { from: startOfWeek(now, { locale: ptBR }), to: endOfDay(now) }
    case 'month':
      return { from: startOfMonth(now), to: endOfDay(now) }
    case 'last_month':
      const lastMonth = subMonths(now, 1)
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) }
    case 'max':
      return { from: startOfDay(startDate), to: endOfDay(now) }
    case 'custom':
      return customRange || { from: subDays(now, 7), to: now }
    default:
      return { from: startOfMonth(now), to: endOfDay(now) }
  }
}

export function DateFilter({
  period,
  onPeriodChange,
  startDate = new Date('2024-01-01'),
  className,
}: DateFilterProps) {
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [isCustomOpen, setIsCustomOpen] = useState(false)

  const handlePeriodChange = (newPeriod: DateFilterPeriod) => {
    if (newPeriod === 'custom') {
      setIsCustomOpen(true)
      return
    }
    const range = getDateRangeForPeriod(newPeriod, startDate)
    onPeriodChange(newPeriod, range)
  }

  const handleCustomApply = () => {
    if (customFrom && customTo) {
      const range: DateRange = {
        from: new Date(customFrom),
        to: new Date(customTo),
      }
      onPeriodChange('custom', range)
      setIsCustomOpen(false)
    }
  }

  const currentRange = getDateRangeForPeriod(period, startDate)
  const currentOption = periodOptions.find(opt => opt.value === period)
  const Icon = currentOption?.icon || CalendarIcon

  const formatDateRange = () => {
    if (period === 'max') {
      return `Desde ${format(currentRange.from, "dd/MM/yy", { locale: ptBR })}`
    }
    if (period === 'today') return 'Hoje'
    if (period === 'yesterday') return 'Ontem'
    return `${format(currentRange.from, "dd/MM", { locale: ptBR })} - ${format(currentRange.to, "dd/MM/yy", { locale: ptBR })}`
  }

  const getDaysCount = () => {
    const diffTime = Math.abs(currentRange.to.getTime() - currentRange.from.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {/* Desktop Quick filters */}
      <div className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-muted/50 border">
        {periodOptions.slice(0, 5).map((option) => {
          const OptionIcon = option.icon
          const isActive = period === option.value
          return (
            <Button
              key={option.value}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'h-8 px-3 text-xs font-medium transition-all',
                isActive && 'shadow-sm'
              )}
              onClick={() => handlePeriodChange(option.value as DateFilterPeriod)}
            >
              <OptionIcon className="h-3.5 w-3.5 mr-1.5" />
              {option.shortLabel}
            </Button>
          )
        })}
      </div>

      {/* Tablet filters */}
      <div className="hidden md:flex lg:hidden items-center gap-1">
        {periodOptions.slice(0, 4).map((option) => {
          const isActive = period === option.value
          return (
            <Button
              key={option.value}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => handlePeriodChange(option.value as DateFilterPeriod)}
            >
              {option.shortLabel}
            </Button>
          )
        })}
      </div>

      {/* Mobile select */}
      <div className="md:hidden flex-1">
        <Select value={period} onValueChange={(val) => handlePeriodChange(val as DateFilterPeriod)}>
          <SelectTrigger className="w-full h-9">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span className="text-sm">{currentOption?.label}</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map((option) => {
              const OptionIcon = option.icon
              return (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <OptionIcon className="h-4 w-4" />
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Custom date picker */}
      <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={period === 'custom' ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'h-8 px-3 text-xs font-medium hidden md:flex',
              period === 'custom' && 'shadow-sm'
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
            Personalizado
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Selecione o periodo</h4>
            <div className="grid gap-3">
              <div className="space-y-2">
                <Label htmlFor="from" className="text-xs">Data inicial</Label>
                <Input
                  id="from"
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to" className="text-xs">Data final</Label>
                <Input
                  id="to"
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  min={customFrom}
                  className="h-9"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCustomOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleCustomApply}
                disabled={!customFrom || !customTo}
              >
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Aplicar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* MAX button */}
      <Button
        variant={period === 'max' ? 'default' : 'outline'}
        size="sm"
        className={cn(
          'h-8 px-3 text-xs font-bold hidden md:flex transition-all',
          period === 'max' && 'bg-gradient-to-r from-purple-600 to-pink-600 border-0 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'
        )}
        onClick={() => handlePeriodChange('max')}
      >
        <Infinity className="h-3.5 w-3.5 mr-1.5" />
        MAXIMO
      </Button>

      {/* Current range display */}
      <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/20 text-xs">
        <CalendarIcon className="h-3.5 w-3.5 text-primary" />
        <span className="font-medium">{formatDateRange()}</span>
        <span className="text-muted-foreground">
          ({getDaysCount()} {getDaysCount() === 1 ? 'dia' : 'dias'})
        </span>
      </div>
    </div>
  )
}
