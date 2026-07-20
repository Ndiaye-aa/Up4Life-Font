import { api } from './api'
import type {
  CreatedStudent,
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
): Promise<CreatedStudent> => {
  const response = await api('/alunos', {
    method: 'POST',
    data: payload,
  })

  const raw = response as Record<string, unknown>
  const student = normalizeStudent(raw, {
    historicoSaude: payload.historicoSaude ?? null,
    nascimento: payload.nascimento ?? null,
    nome: payload.nome,
    sexo: payload.sexo ?? null,
    telefone: payload.telefone,
  })

  return {
    student,
    senhaInicial:
      typeof raw.senhaInicial === 'string' ? raw.senhaInicial : undefined,
  }
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

export interface UpdateSelfPayload {
  nome?: string
  telefone?: string
  senha?: string
  nascimento?: string
  historicoSaude?: string
}

export const getStudentSelfService = async (): Promise<StudentRecord> => {
  const response = await api('/alunos/me')
  return normalizeStudent(response as Record<string, unknown>)
}

export const updateStudentSelfService = async (
  payload: UpdateSelfPayload,
): Promise<StudentRecord> => {
  const response = await api('/alunos/me', {
    method: 'PATCH',
    data: payload,
  })

  return normalizeStudent(response as Record<string, unknown>)
}
