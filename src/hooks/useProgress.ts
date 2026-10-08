import { createKeyedResource } from './useResourceCache'
import { getProgressService } from '../services/progressService'
import type { ProgressData, ProgressPeriod } from '../@types/progress'

// param = "<alunoId|me>:<periodo>"
const resource = createKeyedResource<ProgressData>((param) => {
  const [aluno, periodo] = param.split(':')
  return getProgressService(aluno === 'me' ? 'me' : Number(aluno), periodo as ProgressPeriod)
})

export const useProgress = (
  alunoId: number | 'me' | null,
  periodo: ProgressPeriod,
  userId?: number,
) => resource.use(alunoId === null ? null : `${alunoId}:${periodo}`, userId)

export const invalidateProgress = (alunoId?: number | 'me') =>
  resource.invalidate(alunoId === undefined ? '' : `${alunoId}:`)
