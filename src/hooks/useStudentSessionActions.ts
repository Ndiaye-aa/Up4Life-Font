import { useCallback, useState } from 'react'
import { ApiError } from '../services/api'
import { updateSessionService, createSessionService } from '../services/sessionService'
import type { CreateSessionPayload, UpdateSessionPayload } from '../@types/session'
import { invalidateProgress } from './useProgress'
import { invalidateProgressSummary } from './useProgressSummary'
import { invalidateSessions } from './useSessions'

/**
 * Escritas de sessão compartilhadas por aluno e personal: invalidam os caches
 * relacionados e traduzem o 409 (edição concorrente) em aviso + recarga.
 */
export const useSessionMutations = (scope: number | 'me') => {
  const [notice, setNotice] = useState<{ message: string; tone: 'info' | 'error' } | null>(null)

  const refresh = useCallback(async () => {
    await Promise.all([
      invalidateSessions(scope),
      invalidateProgress(scope),
      invalidateProgressSummary(),
    ])
  }, [scope])

  const run = useCallback(
    async <T,>(action: () => Promise<T>, okMessage?: string): Promise<T | undefined> => {
      try {
        const result = await action()
        if (okMessage) setNotice({ message: okMessage, tone: 'info' })
        await refresh()
        return result
      } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
          // Usa a mensagem do servidor: distingue edição concorrente de "já existe
          // sessão/falta nesta data" (que orienta a editar a sessão existente).
          setNotice({
            message: error.message || 'O registro foi alterado, recarregue.',
            tone: 'error',
          })
          await refresh()
          return undefined
        }
        throw error
      }
    },
    [refresh],
  )

  return {
    notice,
    clearNotice: useCallback(() => setNotice(null), []),
    create: (payload: CreateSessionPayload, okMessage?: string) =>
      run(() => createSessionService(payload), okMessage),
    update: (id: number, payload: UpdateSessionPayload, okMessage?: string) =>
      run(() => updateSessionService(id, payload), okMessage),
    run,
  }
}
