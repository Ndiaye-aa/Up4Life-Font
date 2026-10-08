import type {
  ProgressData,
  ProgressPeriod,
  ProgressSummaryRow,
} from '../@types/progress'
import { api } from './api'

export const getProgressService = async (
  alunoId: number | 'me',
  periodo: ProgressPeriod,
): Promise<ProgressData> =>
  api(`/alunos/${alunoId}/progresso?periodo=${periodo}`) as Promise<ProgressData>

export const getProgressSummaryService = async (): Promise<ProgressSummaryRow[]> => {
  const result = await api('/alunos/progresso-resumo')
  return Array.isArray(result) ? (result as ProgressSummaryRow[]) : []
}
