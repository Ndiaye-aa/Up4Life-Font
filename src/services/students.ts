import { api } from './api'
import type {
  CreateStudentPayload,
  StudentRecord,
} from '../@types/student'

const normalizeStudent = (
  raw: Record<string, unknown>,
  fallback: Partial<StudentRecord> = {},
): StudentRecord => {
  const personal =
    (raw.personal as Record<string, unknown> | undefined) ??
    (raw.trainer as Record<string, unknown> | undefined)

  return {
    ativo: (raw.ativo ?? fallback.ativo ?? true) as boolean,
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

export const updateStudentStatusService = async (
  id: number,
  ativo: boolean,
): Promise<StudentRecord> => {
  const response = await api(`/alunos/${id}`, {
    method: 'PATCH',
    data: { ativo },
  })

  return normalizeStudent(response as Record<string, unknown>)
}

export type UpdateStudentPayload = Partial<CreateStudentPayload>

export const updateStudentService = async (
  id: number,
  payload: UpdateStudentPayload,
): Promise<StudentRecord> => {
  const response = await api(`/alunos/${id}`, {
    method: 'PATCH',
    data: payload,
  })

  return normalizeStudent(response as Record<string, unknown>)
}

export const deleteStudentService = async (id: number): Promise<void> => {
  await api(`/alunos/${id}`, { method: 'DELETE' })
}
