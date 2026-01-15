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
