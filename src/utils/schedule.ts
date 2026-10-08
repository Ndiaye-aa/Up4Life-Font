import type { StudentSchedule } from '../@types/schedule'
import type { SessionRecord } from '../@types/session'
import { addDays, weekdayOf } from './sessionFormat'

export interface UpcomingDay {
  data: string
  hora?: string
}

/**
 * Próximos dias da agenda (de hoje até +30 dias) ainda sem sessão registrada,
 * elegíveis para pré-justificativa. Hoje só vale antes do horário do treino.
 */
export const upcomingScheduleDays = (
  schedule: StudentSchedule | null,
  sessions: SessionRecord[],
  hoje: string,
  horaAgora: string,
  limit = 5,
): UpcomingDay[] => {
  if (!schedule) return []
  const taken = new Set(sessions.map((s) => s.data))
  const result: UpcomingDay[] = []

  for (let n = 0; n <= 30 && result.length < limit; n++) {
    const data = addDays(hoje, n)
    const dia = weekdayOf(data) as 0 | 1 | 2 | 3 | 4 | 5 | 6
    if (!schedule.dias.includes(dia) || taken.has(data)) continue
    const hora = schedule.horarios?.[dia]?.hora
    if (n === 0 && !(hora && horaAgora < hora)) continue
    result.push({ data, hora })
  }
  return result
}

/** Motivo pelo qual o aluno não pode mais editar a sessão (null = editável). */
export const studentEditLockReason = (session: SessionRecord, hoje: string): string | null => {
  if (session.validadaEm) {
    return 'Esta sessão já foi validada pelo seu personal e não pode mais ser editada.'
  }
  const limite = addDays(hoje, -7)
  const futuraJustificada = session.data > hoje && session.status === 'FALTA_JUSTIFICADA'
  if (session.data < limite && !futuraJustificada) {
    return 'O prazo de edição (7 dias após o treino) já passou. Fale com seu personal.'
  }
  return null
}
