'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { startOfDay, endOfDay, startOfWeek, startOfMonth, endOfMonth, subDays, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type DateFilterPeriod = 'today' | 'yesterday' | 'week' | 'month' | 'last_month' | 'custom' | 'max'

export interface DateRange {
  from: Date
  to: Date
}

interface DateFilterContextType {
  period: DateFilterPeriod
  dateRange: DateRange
  setPeriod: (period: DateFilterPeriod) => void
  setCustomRange: (range: DateRange) => void
  startDate: Date
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined)

// Data de inicio da coleta de dados
const DATA_START_DATE = new Date('2024-01-15')

function getDateRangeForPeriod(period: DateFilterPeriod, customRange?: DateRange): DateRange {
  const now = new Date()
  switch (period) {
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
      return { from: startOfDay(DATA_START_DATE), to: endOfDay(now) }
    case 'custom':
      return customRange || { from: subDays(now, 7), to: now }
    default:
      return { from: startOfMonth(now), to: endOfDay(now) }
  }
}

export function DateFilterProvider({ children }: { children: ReactNode }) {
  const [period, setPeriodState] = useState<DateFilterPeriod>('month')
  const [customRange, setCustomRangeState] = useState<DateRange | undefined>(undefined)

  const dateRange = getDateRangeForPeriod(period, customRange)

  const setPeriod = (newPeriod: DateFilterPeriod) => {
    setPeriodState(newPeriod)
  }

  const setCustomRange = (range: DateRange) => {
    setCustomRangeState(range)
    setPeriodState('custom')
  }

  return (
    <DateFilterContext.Provider
      value={{
        period,
        dateRange,
        setPeriod,
        setCustomRange,
        startDate: DATA_START_DATE,
      }}
    >
      {children}
    </DateFilterContext.Provider>
  )
}

export function useDateFilter() {
  const context = useContext(DateFilterContext)
  if (context === undefined) {
    throw new Error('useDateFilter must be used within a DateFilterProvider')
  }
  return context
}
