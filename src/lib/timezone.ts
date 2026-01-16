/**
 * Utilitários de Timezone para Media Buyer
 *
 * Funções para conversão de timezone entre:
 * - PT (America/Los_Angeles) - Timezone padrão do Facebook Ads
 * - BRT (America/Sao_Paulo) - Timezone do Brasil
 *
 * Nota: PT está 5h atrás de BRT (horário padrão) ou 4h (horário de verão americano)
 * Exemplo: 23h PT dia 14 = 04h BRT dia 15
 */

// Timezones suportados
export const TIMEZONES = {
  PT: 'America/Los_Angeles',
  BRT: 'America/Sao_Paulo',
  UTC: 'UTC',
  // Outros timezones comuns do Facebook Ads
  EST: 'America/New_York',
  CET: 'Europe/Paris',
  GMT: 'Europe/London',
} as const

export type TimezoneKey = keyof typeof TIMEZONES

/**
 * Converte uma data de PT (Pacific Time / Los Angeles) para BRT (Brasília)
 *
 * @param date - Data em PT (pode ser Date, string ou timestamp)
 * @returns Date objeto em BRT
 *
 * @example
 * // 23h PT dia 14 = 04h BRT dia 15
 * const ptDate = new Date('2024-01-14T23:00:00-08:00')
 * const brtDate = convertPTtoBRT(ptDate)
 * // brtDate será 2024-01-15T04:00:00-03:00
 */
export function convertPTtoBRT(date: Date | string | number): Date {
  const inputDate = new Date(date)

  // Formatar a data no timezone PT
  const ptFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONES.PT,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  // Formatar a data no timezone BRT
  const brtFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONES.BRT,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  // Obter componentes da data em BRT
  const parts = brtFormatter.formatToParts(inputDate)
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '0'

  // Criar nova data com os componentes BRT
  const brtDate = new Date(
    parseInt(getPart('year')),
    parseInt(getPart('month')) - 1,
    parseInt(getPart('day')),
    parseInt(getPart('hour')),
    parseInt(getPart('minute')),
    parseInt(getPart('second'))
  )

  return brtDate
}

/**
 * Converte uma data de BRT (Brasília) para PT (Pacific Time / Los Angeles)
 *
 * @param date - Data em BRT
 * @returns Date objeto em PT
 */
export function convertBRTtoPT(date: Date | string | number): Date {
  const inputDate = new Date(date)

  const ptFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONES.PT,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const parts = ptFormatter.formatToParts(inputDate)
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '0'

  const ptDate = new Date(
    parseInt(getPart('year')),
    parseInt(getPart('month')) - 1,
    parseInt(getPart('day')),
    parseInt(getPart('hour')),
    parseInt(getPart('minute')),
    parseInt(getPart('second'))
  )

  return ptDate
}

/**
 * Obtém a data atual em um timezone específico
 *
 * @param timezone - Timezone desejado (default: BRT)
 * @returns Date objeto no timezone especificado
 */
export function getNowInTimezone(timezone: TimezoneKey = 'BRT'): Date {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONES[timezone],
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(now)
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '0'

  return new Date(
    parseInt(getPart('year')),
    parseInt(getPart('month')) - 1,
    parseInt(getPart('day')),
    parseInt(getPart('hour')),
    parseInt(getPart('minute')),
    parseInt(getPart('second'))
  )
}

/**
 * Obtém apenas a data (sem hora) em um timezone específico
 * Útil para agrupar dados por dia
 *
 * @param date - Data de entrada
 * @param timezone - Timezone para extrair a data (default: BRT)
 * @returns Date objeto com hora zerada no timezone especificado
 */
export function getDateOnlyInTimezone(date: Date | string | number, timezone: TimezoneKey = 'BRT'): Date {
  const inputDate = new Date(date)
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONES[timezone],
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const parts = formatter.formatToParts(inputDate)
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '0'

  return new Date(
    parseInt(getPart('year')),
    parseInt(getPart('month')) - 1,
    parseInt(getPart('day')),
    0, 0, 0, 0
  )
}

/**
 * Calcula a diferença de horas entre dois timezones
 *
 * @param fromTz - Timezone de origem
 * @param toTz - Timezone de destino
 * @returns Diferença em horas (positivo = destino está à frente)
 */
export function getTimezoneOffset(fromTz: TimezoneKey, toTz: TimezoneKey): number {
  const now = new Date()

  const fromFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONES[fromTz],
    hour: 'numeric',
    hour12: false,
  })

  const toFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONES[toTz],
    hour: 'numeric',
    hour12: false,
  })

  const fromHour = parseInt(fromFormatter.format(now))
  const toHour = parseInt(toFormatter.format(now))

  let diff = toHour - fromHour
  // Ajustar para mudança de dia
  if (diff > 12) diff -= 24
  if (diff < -12) diff += 24

  return diff
}

/**
 * Formata uma data para exibição em um timezone específico
 *
 * @param date - Data de entrada
 * @param timezone - Timezone para formatação
 * @param options - Opções de formatação Intl
 * @returns String formatada
 */
export function formatInTimezone(
  date: Date | string | number,
  timezone: TimezoneKey = 'BRT',
  options?: Intl.DateTimeFormatOptions
): string {
  const inputDate = new Date(date)
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: TIMEZONES[timezone],
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    ...options,
  }

  return new Intl.DateTimeFormat('pt-BR', defaultOptions).format(inputDate)
}

/**
 * Verifica se está em horário de verão americano (PDT)
 * Horário de verão nos EUA: segundo domingo de março até primeiro domingo de novembro
 *
 * @param date - Data para verificar
 * @returns true se está em horário de verão
 */
export function isUSADaylightSaving(date: Date = new Date()): boolean {
  const jan = new Date(date.getFullYear(), 0, 1)
  const jul = new Date(date.getFullYear(), 6, 1)

  const janOffset = jan.getTimezoneOffset()
  const julOffset = jul.getTimezoneOffset()

  const stdOffset = Math.max(janOffset, julOffset)
  return date.getTimezoneOffset() < stdOffset
}

/**
 * Obtém informações sobre o offset atual entre PT e BRT
 *
 * @returns Objeto com informações do offset
 */
export function getPTtoBRTInfo(): {
  offset: number
  isDST: boolean
  description: string
} {
  const offset = getTimezoneOffset('PT', 'BRT')
  const isDST = isUSADaylightSaving()

  return {
    offset,
    isDST,
    description: isDST
      ? 'Horário de verão americano (PDT) - BRT está 4h à frente de PT'
      : 'Horário padrão americano (PST) - BRT está 5h à frente de PT',
  }
}

/**
 * Converte data do Facebook (geralmente em PT ou UTC) para a data correta em BRT
 * Útil para processar dados da API do Facebook Ads
 *
 * @param facebookDate - Data retornada pela API do Facebook
 * @param facebookTimezone - Timezone da conta do Facebook (default: PT)
 * @returns Data convertida para BRT
 */
export function convertFacebookDateToBRT(
  facebookDate: string | Date,
  facebookTimezone: TimezoneKey = 'PT'
): Date {
  const date = new Date(facebookDate)

  if (facebookTimezone === 'PT') {
    return convertPTtoBRT(date)
  }

  // Para outros timezones, usar conversão genérica
  return getDateOnlyInTimezone(date, 'BRT')
}

// ==================== FUNÇÕES PARA CONVERSÃO HORÁRIA ====================

/**
 * Interface para dados horários do Facebook
 */
export interface HourlySpendData {
  dateTimePt: Date
  dateTimeBrt?: Date
  dateBrt?: string
  hourPt: number
  hourBrt?: number
  spendUsd: number
  spendBrl: number
  impressions: number
  clicks: number
  reach: number
  results: number
  adAccountId: string
  adAccountName?: string
  campaignId?: string
  campaignName?: string
  adsetId?: string
  adsetName?: string
}

/**
 * Verifica se uma data está no horário de verão americano (DST)
 * DST nos EUA: segundo domingo de março às 02:00 até primeiro domingo de novembro às 02:00
 *
 * @param date - Data para verificar (em qualquer timezone)
 * @returns true se está no horário de verão (PDT), false se horário padrão (PST)
 */
export function isUsDaylightSavingTime(date: Date): boolean {
  const year = date.getFullYear()

  // Segundo domingo de março
  const marchFirst = new Date(year, 2, 1)
  const daysUntilSunday = (7 - marchFirst.getDay()) % 7
  const secondSunday = 8 + daysUntilSunday + (marchFirst.getDay() === 0 ? 7 : 0)
  const dstStart = new Date(year, 2, secondSunday, 2, 0, 0) // Março, segundo domingo, 02:00

  // Primeiro domingo de novembro
  const novFirst = new Date(year, 10, 1)
  const daysUntilNovSunday = (7 - novFirst.getDay()) % 7
  const firstSunday = novFirst.getDay() === 0 ? 1 : 1 + daysUntilNovSunday
  const dstEnd = new Date(year, 10, firstSunday, 2, 0, 0) // Novembro, primeiro domingo, 02:00

  return date >= dstStart && date < dstEnd
}

/**
 * Obtém o offset de horas entre PT (Los Angeles) e BRT (São Paulo) para uma data específica
 *
 * @param date - Data para calcular o offset
 * @returns Objeto com offset em horas e status de DST
 */
export function getPtBrtOffset(date: Date): { offset: number; isDst: boolean } {
  const isDst = isUsDaylightSavingTime(date)
  // Quando EUA está em DST (PDT = UTC-7), BRT (UTC-3) está 4h à frente
  // Quando EUA está em horário padrão (PST = UTC-8), BRT (UTC-3) está 5h à frente
  return {
    offset: isDst ? 4 : 5,
    isDst,
  }
}

/**
 * Converte um datetime de PT (Los Angeles) para BRT (São Paulo) com metadados
 *
 * @param ptDateTime - DateTime em Pacific Time
 * @returns Objeto com datetime convertido e metadados
 */
export function convertPtDateTimeToBrt(ptDateTime: Date): {
  brtDateTime: Date
  brtDateStr: string // YYYY-MM-DD
  hourPt: number
  hourBrt: number
  offset: number
  isDst: boolean
} {
  const { offset, isDst } = getPtBrtOffset(ptDateTime)

  // Adicionar offset para obter BRT
  const brtDateTime = new Date(ptDateTime.getTime() + offset * 60 * 60 * 1000)

  // Extrair componentes
  const hourPt = ptDateTime.getHours()
  const hourBrt = brtDateTime.getHours()

  // Formatar data BRT como YYYY-MM-DD
  const year = brtDateTime.getFullYear()
  const month = String(brtDateTime.getMonth() + 1).padStart(2, '0')
  const day = String(brtDateTime.getDate()).padStart(2, '0')
  const brtDateStr = `${year}-${month}-${day}`

  return {
    brtDateTime,
    brtDateStr,
    hourPt,
    hourBrt,
    offset,
    isDst,
  }
}

/**
 * Interface para dados agrupados por dia BRT
 */
export interface DailyAggregatedData {
  dateBrt: string
  totalSpendUsd: number
  totalSpendBrl: number
  totalImpressions: number
  totalClicks: number
  totalReach: number
  totalResults: number
  hoursIncluded: number[]
  ptDatesSpanned: string[]
  offset: number
  isDst: boolean
}

/**
 * Agrupa dados horários por dia no fuso de São Paulo (BRT)
 * Esta é a função principal para correção de timezone
 *
 * @param hourlyData - Array de dados horários com timestamps em PT
 * @returns Map de datas BRT para dados agregados
 */
export function regroupHourlyDataByBrtDay(
  hourlyData: HourlySpendData[]
): Map<string, DailyAggregatedData> {
  const grouped = new Map<string, DailyAggregatedData>()

  for (const hourData of hourlyData) {
    const { brtDateTime, brtDateStr, hourBrt, offset, isDst } = convertPtDateTimeToBrt(
      hourData.dateTimePt
    )

    // Extrair data PT para tracking
    const ptDateStr = hourData.dateTimePt.toISOString().split('T')[0]

    if (!grouped.has(brtDateStr)) {
      grouped.set(brtDateStr, {
        dateBrt: brtDateStr,
        totalSpendUsd: 0,
        totalSpendBrl: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalReach: 0,
        totalResults: 0,
        hoursIncluded: [],
        ptDatesSpanned: [],
        offset,
        isDst,
      })
    }

    const dayData = grouped.get(brtDateStr)!
    dayData.totalSpendUsd += hourData.spendUsd
    dayData.totalSpendBrl += hourData.spendBrl
    dayData.totalImpressions += hourData.impressions
    dayData.totalClicks += hourData.clicks
    dayData.totalReach += hourData.reach
    dayData.totalResults += hourData.results
    dayData.hoursIncluded.push(hourBrt)

    // Adicionar data PT se ainda não estiver na lista
    if (!dayData.ptDatesSpanned.includes(ptDateStr)) {
      dayData.ptDatesSpanned.push(ptDateStr)
    }
  }

  // Ordenar horas incluídas para cada dia
  for (const [, dayData] of Array.from(grouped.entries())) {
    dayData.hoursIncluded.sort((a, b) => a - b)
    dayData.ptDatesSpanned.sort()
  }

  return grouped
}

/**
 * Calcula quais datas em PT são necessárias para cobrir um dia completo em BRT
 *
 * Exemplo: Para 15/01 BRT com offset 5h:
 * - 15/01 BRT 00:00 = 14/01 PT 19:00
 * - 15/01 BRT 23:59 = 15/01 PT 18:59
 * - Precisa de: 14/01 PT e 15/01 PT
 *
 * @param brtDateStr - Data em BRT no formato YYYY-MM-DD
 * @returns Array de datas PT necessárias no formato YYYY-MM-DD
 */
export function getPtDatesForBrtDay(brtDateStr: string): string[] {
  const brtDate = new Date(brtDateStr + 'T00:00:00')
  const { offset } = getPtBrtOffset(brtDate)

  const ptDates: Set<string> = new Set()

  // Início do dia BRT (00:00) em PT
  // Se BRT é 00:00 e offset é 5h, PT é 19:00 do dia anterior
  const brtStartTime = new Date(brtDate)
  const ptStartTime = new Date(brtStartTime.getTime() - offset * 60 * 60 * 1000)
  const ptStartDateStr = ptStartTime.toISOString().split('T')[0]
  ptDates.add(ptStartDateStr)

  // Fim do dia BRT (23:59:59) em PT
  const brtEndTime = new Date(brtDate)
  brtEndTime.setHours(23, 59, 59, 999)
  const ptEndTime = new Date(brtEndTime.getTime() - offset * 60 * 60 * 1000)
  const ptEndDateStr = ptEndTime.toISOString().split('T')[0]
  ptDates.add(ptEndDateStr)

  return Array.from(ptDates).sort()
}

/**
 * Calcula o range de datas PT necessário para cobrir um range de datas BRT
 *
 * @param startBrt - Data inicial em BRT (YYYY-MM-DD)
 * @param endBrt - Data final em BRT (YYYY-MM-DD)
 * @returns Objeto com datas PT de início e fim
 */
export function getPtDateRangeForBrtRange(
  startBrt: string,
  endBrt: string
): { ptStart: string; ptEnd: string } {
  const ptDatesForStart = getPtDatesForBrtDay(startBrt)
  const ptDatesForEnd = getPtDatesForBrtDay(endBrt)

  return {
    ptStart: ptDatesForStart[0], // Primeira data necessária
    ptEnd: ptDatesForEnd[ptDatesForEnd.length - 1], // Última data necessária
  }
}
