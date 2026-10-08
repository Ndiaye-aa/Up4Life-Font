import { createKeyedResource } from './useResourceCache'
import { listSessionsService } from '../services/sessionService'
import type { SessionRecord } from '../@types/session'

// param = "<alunoId|me>:<de>:<ate>"
const resource = createKeyedResource<SessionRecord[]>((param) => {
  const [aluno, de, ate] = param.split(':')
  return listSessionsService(aluno === 'me' ? 'me' : Number(aluno), de || undefined, ate || undefined)
})

/** Sessões de treino de um aluno (ou do próprio aluno logado, com `'me'`) no intervalo. */
export const useSessions = (
  alunoId: number | 'me' | null,
  range: { de?: string; ate?: string },
  userId?: number,
) =>
  resource.use(
    alunoId === null ? null : `${alunoId}:${range.de ?? ''}:${range.ate ?? ''}`,
    userId,
  )

/** Invalida as sessões em cache (todas, ou só as de um aluno). */
export const invalidateSessions = (alunoId?: number | 'me') =>
  resource.invalidate(alunoId === undefined ? '' : `${alunoId}:`)
