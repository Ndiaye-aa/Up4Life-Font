import type { StudentSchedule } from '../@types/schedule'
import { api } from './api'

const STORAGE_PREFIX = 'up4life:agenda:'

const normalize = (rows: unknown): StudentSchedule[] => {
  if (!Array.isArray(rows)) return []
  return rows.filter(
    (item): item is StudentSchedule =>
      typeof item?.alunoId === 'number' && Array.isArray(item?.dias),
  )
}

function readLegacy(personalId: number): StudentSchedule[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${personalId}`)
    if (!raw) return []
    return normalize(JSON.parse(raw))
  } catch {
    return []
  }
}

export const getWeeklyScheduleService = async (
  personalId: number,
): Promise<StudentSchedule[]> => {
  let schedules: StudentSchedule[]
  try {
    schedules = normalize(await api('/agenda'))
  } catch {
    return readLegacy(personalId)
  }

  // Migração única: agendas antigas ficavam só no localStorage deste navegador.
  const legacy = readLegacy(personalId)
  if (schedules.length === 0 && legacy.length > 0) {
    for (const schedule of legacy) {
      try {
        schedules = await saveStudentScheduleService(personalId, schedule)
      } catch {
        return legacy
      }
    }
  }
  if (legacy.length > 0) {
    localStorage.removeItem(`${STORAGE_PREFIX}${personalId}`)
  }

  return schedules
}

export const saveStudentScheduleService = async (
  _personalId: number,
  schedule: StudentSchedule,
): Promise<StudentSchedule[]> => {
  const result = await api(`/agenda/${schedule.alunoId}`, {
    method: 'PUT',
    data: { dias: schedule.dias, horarios: schedule.horarios ?? {} },
  })
  return normalize(result)
}

export const removeStudentScheduleService = async (
  _personalId: number,
  alunoId: number,
): Promise<StudentSchedule[]> => {
  const result = await api(`/agenda/${alunoId}`, { method: 'DELETE' })
  return normalize(result)
}
