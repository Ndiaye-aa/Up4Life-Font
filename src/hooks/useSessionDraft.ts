import { useCallback, useMemo } from 'react'

/** Estado do treino em andamento, guardado para sobreviver a reload e a falhas de rede. */
export interface SessionDraft {
  treinoId: number
  sessionId: number | null
  version: number | null
  iniciadaEm: string
  /** séries concluídas por índice de exercício */
  completedSets: Record<number, number>
  /** carga real informada por exercício (texto livre) */
  cargas: Record<number, string>
  /** treino finalizado mas ainda não enviado ao servidor */
  pendingFinish: PendingFinish | null
}

export interface PendingFinish {
  concluidaEm: string
  rpe: number
  disposicao: number
  dor: boolean
  dorLocal?: string
  comentarioAluno?: string
}

const key = (userId: number, date: string) => `up4life.draft.${userId}.${date}`

/** Lê/grava o rascunho em localStorage — sempre em try/catch (modo privado, cota, bloqueio). */
export const useSessionDraft = (userId: number | undefined, date: string) => {
  const load = useCallback((): SessionDraft | null => {
    if (!userId) return null
    try {
      const raw = localStorage.getItem(key(userId, date))
      return raw ? (JSON.parse(raw) as SessionDraft) : null
    } catch {
      return null
    }
  }, [userId, date])

  const save = useCallback(
    (draft: SessionDraft) => {
      if (!userId) return
      try {
        localStorage.setItem(key(userId, date), JSON.stringify(draft))
      } catch {
        /* sem armazenamento: o treino segue funcionando, só sem rascunho */
      }
    },
    [userId, date],
  )

  const clear = useCallback(() => {
    if (!userId) return
    try {
      localStorage.removeItem(key(userId, date))
    } catch {
      /* noop */
    }
  }, [userId, date])

  // Identidade estável: o objeto entra nas dependências de efeitos das páginas.
  return useMemo(() => ({ load, save, clear }), [load, save, clear])
}
