import type {
  CreateSessionPayload,
  SessionRecord,
  UpdateSessionPayload,
} from '../@types/session'
import { api } from './api'

export const listSessionsService = async (
  alunoId: number | 'me',
  de?: string,
  ate?: string,
): Promise<SessionRecord[]> => {
  const params = new URLSearchParams()
  if (alunoId !== 'me') params.set('alunoId', String(alunoId))
  if (de) params.set('de', de)
  if (ate) params.set('ate', ate)
  const query = params.toString()
  const result = await api(`/sessoes-treino${query ? `?${query}` : ''}`)
  return Array.isArray(result) ? (result as SessionRecord[]) : []
}

export const createSessionService = async (
  payload: CreateSessionPayload,
): Promise<SessionRecord> =>
  api('/sessoes-treino', { method: 'POST', data: payload }) as Promise<SessionRecord>

export const updateSessionService = async (
  id: number,
  payload: UpdateSessionPayload,
): Promise<SessionRecord> =>
  api(`/sessoes-treino/${id}`, { method: 'PATCH', data: payload }) as Promise<SessionRecord>

export const deleteSessionService = async (id: number): Promise<void> => {
  await api(`/sessoes-treino/${id}`, { method: 'DELETE' })
}

export const acceptHealthConsentService = async (): Promise<void> => {
  await api('/alunos/me/consentimento-saude', { method: 'POST' })
}

export const getSessionService = async (id: number): Promise<SessionRecord> =>
  api(`/sessoes-treino/${id}`) as Promise<SessionRecord>
