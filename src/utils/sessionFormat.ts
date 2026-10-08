import type { AlertCode } from '../@types/progress'
import type { SessionStatus } from '../@types/session'

/** "2026-10-07" → "07/10" (ou "07/10/2026" com `withYear`). Sem Date: evita deslocamento de fuso. */
export const formatYmd = (ymd: string, withYear = false): string => {
  const [year, month, day] = ymd.split('-')
  return withYear ? `${day}/${month}/${year}` : `${day}/${month}`
}

export const addDays = (ymd: string, n: number): string => {
  const d = new Date(`${ymd}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

export const weekdayOf = (ymd: string): number => new Date(`${ymd}T12:00:00Z`).getUTCDay()

const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
export const weekdayName = (ymd: string): string => WEEKDAYS[weekdayOf(ymd)]

/** Data de hoje (YYYY-MM-DD) num fuso IANA — o mesmo critério que o backend usa para a sessão. */
export const todayIn = (timeZone: string): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

export const STATUS_LABEL: Record<SessionStatus, string> = {
  REALIZADA: 'Realizado',
  PARCIAL: 'Parcial',
  FALTA: 'Falta',
  FALTA_JUSTIFICADA: 'Justificada',
}

export const ALERT_LABEL: Record<AlertCode, string> = {
  FALTAS_SEGUIDAS: 'Faltas seguidas',
  DOR_REPORTADA: 'Dor reportada',
  ESFORCO_ALTO: 'Esforço alto',
  AVALIACAO_ATRASADA: 'Avaliação atrasada',
  TREINO_VENCIDO: 'Treino vencido',
}

export const DISPOSITION_EMOJI = ['😫', '😕', '😐', '🙂', '😄']

export const formatPercent = (value: number | null): string =>
  value === null ? '—' : `${Math.round(value * 100)}%`
