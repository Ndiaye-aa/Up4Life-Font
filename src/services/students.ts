import { api } from './api'
import type { CreateStudentPayload, StudentRecord } from '../@types/student'

const normalizeStudent = (
  raw: Record<string, unknown>,
  fallback: Partial<StudentRecord> = {},
): StudentRecord => {
  const personal =
    (raw.personal as Record<string, unknown> | undefined) ??
    (raw.trainer as Record<string, unknown> | undefined)

  return {
    criadoEm: (raw.criadoEm ?? raw.criado_em ?? fallback.criadoEm ?? '') as string,
    historicoSaude: (raw.historicoSaude ?? raw.historico_saude ?? fallback.historicoSaude ?? null) as string | null,
    id: Number(raw.id ?? fallback.id ?? 0),
    personalId: Number(
      raw.personalId ??
      raw.idPersonal ??
      raw.personal_id ??
      personal?.id ??
      fallback.personalId ??
      0,
    ),
    nascimento: (raw.nascimento ?? fallback.nascimento ?? null) as string | null,
    nome: (raw.nome ?? fallback.nome ?? '') as string,
    sexo: (raw.sexo ?? fallback.sexo ?? null) as StudentRecord['sexo'],
    telefone: (raw.telefone ?? fallback.telefone ?? '') as string,
  }
}

export const getStudentsService = async (): Promise<StudentRecord[]> => {
  const result = await api('/alunos')
  const raw = Array.isArray(result) ? result : result ? [result] : []

  return raw.map((student) =>
    normalizeStudent(student as Record<string, unknown>),
  )
}

export const createStudentService = async (
  payload: CreateStudentPayload,
): Promise<StudentRecord> => {
  const response = await api('/alunos', {
    method: 'POST',
    data: payload,
  })

  return normalizeStudent(response as Record<string, unknown>, {
    historicoSaude: payload.historicoSaude ?? null,
    nascimento: payload.nascimento ?? null,
    nome: payload.nome,
    sexo: payload.sexo ?? null,
    telefone: payload.telefone,
  })
}
