import { api } from './api'

export interface PersonalRecord {
  id: number
  nome: string
  telefone: string
}

export interface UpdatePersonalSelfPayload {
  nome?: string
  telefone?: string
  senha?: string
}

const normalizePersonal = (raw: Record<string, unknown>): PersonalRecord => ({
  id: Number(raw.id ?? 0),
  nome: (raw.nome ?? '') as string,
  telefone: (raw.telefone ?? '') as string,
})

export const updatePersonalSelfService = async (
  payload: UpdatePersonalSelfPayload,
): Promise<PersonalRecord> => {
  const response = await api('/personais/me', {
    method: 'PATCH',
    data: payload,
  })

  return normalizePersonal(response as Record<string, unknown>)
}
