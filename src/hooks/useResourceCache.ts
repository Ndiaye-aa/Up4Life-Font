import { useEffect, useState } from 'react'

interface ResourceState<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
}

export interface Resource<T> {
  /** Hook: assina o recurso e dispara o fetch quando necessário. `key` reseta o cache ao mudar (ex.: id do personal logado). */
  use: (key?: unknown) => ResourceState<T> & { refetch: () => Promise<void> }
  /** Força um novo fetch e atualiza todos os componentes assinantes (chamar após criar/editar/excluir). */
  invalidate: () => Promise<void>
}

/**
 * Cache simples em escopo de módulo para uma chamada de API que várias páginas
 * buscam de forma independente (ex.: lista de alunos/treinos/avaliações do
 * personal). Evita refazer o fetch a cada navegação — o dado é buscado uma vez
 * e compartilhado entre todos os componentes montados simultaneamente.
 */
export function createResource<T>(fetcher: () => Promise<T>): Resource<T> {
  let state: ResourceState<T> = { data: null, isLoading: false, error: null }
  let inFlight: Promise<void> | null = null
  let lastKey: unknown = undefined
  const subscribers = new Set<() => void>()

  const notify = () => subscribers.forEach((cb) => cb())

  const load = (): Promise<void> => {
    state = { ...state, isLoading: true, error: null }
    notify()
    inFlight = fetcher()
      .then((data) => {
        state = { data, isLoading: false, error: null }
      })
      .catch((error: unknown) => {
        state = {
          data: null,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Erro ao carregar dados.'),
        }
      })
      .finally(() => {
        inFlight = null
        notify()
      })
    return inFlight
  }

  const invalidate = (): Promise<void> => load()

  const use = (key?: unknown) => {
    const [, forceRender] = useState(0)

    useEffect(() => {
      const cb = () => forceRender((t) => t + 1)
      subscribers.add(cb)
      return () => { subscribers.delete(cb) }
    }, [])

    useEffect(() => {
      if (key !== lastKey) {
        lastKey = key
        state = { data: null, isLoading: false, error: null }
        notify()
      }
      if (key != null && state.data === null && !state.isLoading && !inFlight) {
        load()
      }
    }, [key])

    return { ...state, refetch: load }
  }

  return { use, invalidate }
}
