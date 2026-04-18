import { api } from './api'

export interface AssessmentRecord {
  id: number
  alunoId: number
  peso: number
  altura: number
  idade: number
  cintura?: number
  quadril?: number
  peitoral?: number
  axilarMedia?: number
  triceps?: number
  subescapular?: number
  abdominal?: number
  supraIliaca?: number
  coxa?: number
  imc?: number
  iac?: number
  percentualGordura?: number
  dataAvaliacao: string
}

export interface CreateAssessmentPayload {
  alunoId: number
  peso: number
  altura: number
  idade: number
  cintura?: number
  quadril?: number
  peitoral?: number
  axilarMedia?: number
  triceps?: number
  subescapular?: number
  abdominal?: number
  supraIliaca?: number
  coxa?: number
}

export const createAssessmentService = async (
  payload: CreateAssessmentPayload,
): Promise<AssessmentRecord> => {
  return api('/avaliacoes', {
    method: 'POST',
    data: payload,
  })
}

function toNum(v: unknown): number | undefined {
  if (v == null) return undefined
  const n = Number(v)
  return isNaN(n) ? undefined : n
}

function normalizeAssessment(raw: Record<string, unknown>): AssessmentRecord {
  return {
    ...raw,
    id: Number(raw.id),
    alunoId: Number(raw.alunoId),
    peso: Number(raw.peso),
    altura: Number(raw.altura),
    idade: Number(raw.idade),
    imc: toNum(raw.imc),
    iac: toNum(raw.iac),
    percentualGordura: toNum(raw.percentualGordura),
    cintura: toNum(raw.cintura),
    quadril: toNum(raw.quadril),
    peitoral: toNum(raw.peitoral),
    axilarMedia: toNum(raw.axilarMedia),
    triceps: toNum(raw.triceps),
    subescapular: toNum(raw.subescapular),
    abdominal: toNum(raw.abdominal),
    supraIliaca: toNum(raw.supraIliaca),
    coxa: toNum(raw.coxa),
  } as AssessmentRecord
}

export const getStudentAssessmentsService = async (
  alunoId: number,
): Promise<AssessmentRecord[]> => {
  const result = await api(`/avaliacoes/aluno/${alunoId}`)
  if (!Array.isArray(result)) return []
  return result.map((r: Record<string, unknown>) => normalizeAssessment(r))
}

export const getAllAssessmentsService = async (): Promise<AssessmentRecord[]> => {
  return api('/avaliacoes')
}
