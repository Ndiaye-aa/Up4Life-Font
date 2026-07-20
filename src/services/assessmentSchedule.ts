import { api } from './api'
import type {
  AssessmentScheduleRecord,
  CreateAssessmentSchedulePayload,
  StatusAgendamento,
} from '../@types/assessmentSchedule'

function normalizeSchedule(raw: Record<string, unknown>): AssessmentScheduleRecord {
  const aluno = raw.aluno as Record<string, unknown> | undefined
  return {
    id: Number(raw.id),
    alunoId: Number(raw.alunoId),
    personalId: Number(raw.personalId),
    dataAgendada: (raw.dataAgendada ?? '') as string,
    status: (raw.status ?? 'PENDENTE') as StatusAgendamento,
    avaliacaoId: raw.avaliacaoId != null ? Number(raw.avaliacaoId) : null,
    nomeAluno: (aluno?.nome ?? undefined) as string | undefined,
  }
}

export const getAssessmentSchedulesService = async (): Promise<AssessmentScheduleRecord[]> => {
  const result = await api('/agendamentos-avaliacao')
  const raw = Array.isArray(result) ? result : result ? [result] : []
  return raw.map((item: Record<string, unknown>) => normalizeSchedule(item))
}

export const createAssessmentScheduleService = async (
  payload: CreateAssessmentSchedulePayload,
): Promise<AssessmentScheduleRecord> => {
  const response = await api('/agendamentos-avaliacao', {
    method: 'POST',
    data: payload,
  })
  return normalizeSchedule(response as Record<string, unknown>)
}

export const updateAssessmentScheduleStatusService = async (
  id: number,
  status: StatusAgendamento,
  avaliacaoId?: number,
): Promise<AssessmentScheduleRecord> => {
  const response = await api(`/agendamentos-avaliacao/${id}`, {
    method: 'PATCH',
    data: { status, avaliacaoId },
  })
  return normalizeSchedule(response as Record<string, unknown>)
}

export const updateAssessmentScheduleService = async (
  id: number,
  payload: Partial<{
    alunoId: number
    avaliacaoId: number
    dataAgendada: string
    status: StatusAgendamento
  }>,
): Promise<AssessmentScheduleRecord> => {
  const response = await api(`/agendamentos-avaliacao/${id}`, {
    method: 'PATCH',
    data: payload,
  })
  return normalizeSchedule(response as Record<string, unknown>)
}

export const deleteAssessmentScheduleService = async (id: number): Promise<void> => {
  await api(`/agendamentos-avaliacao/${id}`, { method: 'DELETE' })
}
