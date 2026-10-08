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

const AUTO_RETRY_DELAY_MS = 4_000

interface KeyedEntry<T> {
  state: ResourceState<T>
  inFlight: Promise<void> | null
}

export interface KeyedResource<T> {
  /** Hook: assina o recurso identificado por `param`; `owner` reseta todo o cache ao mudar (ex.: usuário logado). */
  use: (param: string | null, owner?: unknown) => ResourceState<T> & { refetch: () => Promise<void> }
  /** Refaz o fetch das entradas cujo `param` começa com `prefix` (todas, se omitido). */
  invalidate: (prefix?: string) => Promise<void>
}

/**
 * Variante de `createResource` para dados parametrizados (ex.: sessões/progresso
 * por aluno e período). Cada `param` tem sua própria entrada de cache; as
 * mutações invalidam por prefixo.
 */
export function createKeyedResource<T>(
  fetcher: (param: string) => Promise<T>,
): KeyedResource<T> {
  const entries = new Map<string, KeyedEntry<T>>()
  const subscribers = new Set<() => void>()
  // Tentativas automáticas após erro (ex.: timeout no cold start), por chave.
  const autoRetries = new Map<string, number>()
  let lastOwner: unknown = undefined

  const notify = () => subscribers.forEach((cb) => cb())
  const empty = (): ResourceState<T> => ({ data: null, isLoading: false, error: null })

  const load = (param: string): Promise<void> => {
    const previous = entries.get(param)
    // Mantém o dado antigo visível enquanto recarrega (evita piscar a tela).
    const entry: KeyedEntry<T> = {
      state: { data: previous?.state.data ?? null, isLoading: true, error: null },
      inFlight: null,
    }
    entries.set(param, entry)
    notify()

    entry.inFlight = fetcher(param)
      .then((data) => {
        if (entries.get(param) === entry) {
          entry.state = { data, isLoading: false, error: null }
          autoRetries.delete(param)
        }
      })
      .catch((error: unknown) => {
        if (entries.get(param) !== entry) return
        entry.state = {
          data: null,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Erro ao carregar dados.'),
        }
      })
      .finally(() => {
        entry.inFlight = null
        notify()
      })
    return entry.inFlight
  }

  const invalidate = async (prefix = ''): Promise<void> => {
    const params = [...entries.keys()].filter((key) => key.startsWith(prefix))
    await Promise.all(params.map(load))
  }

  const use = (param: string | null, owner?: unknown) => {
    const [, forceRender] = useState(0)

    useEffect(() => {
      const cb = () => forceRender((t) => t + 1)
      subscribers.add(cb)
      return () => {
        subscribers.delete(cb)
      }
    }, [])

    const hasError = param !== null && Boolean(entries.get(param)?.state.error)

    useEffect(() => {
      if (owner !== lastOwner) {
        lastOwner = owner
        entries.clear()
        autoRetries.clear()
        notify()
      }
      if (param === null || owner == null) return
      const entry = entries.get(param)
      if (!entry || (entry.state.data === null && !entry.state.isLoading && !entry.inFlight && !entry.state.error)) {
        void load(param)
        return
      }
      // Uma nova tentativa automática após erro; depois disso só via `refetch`.
      if (entry.state.error && (autoRetries.get(param) ?? 0) < 1) {
        const timer = setTimeout(() => {
          autoRetries.set(param, 1)
          void load(param)
        }, AUTO_RETRY_DELAY_MS)
        return () => clearTimeout(timer)
      }
    }, [param, owner, hasError])

    const state = (param !== null ? entries.get(param)?.state : undefined) ?? empty()
    // Enquanto a chave ainda não foi buscada, já conta como "carregando":
    // evita o flash de "sem dados" no primeiro render.
    const pendingFirstLoad =
      param !== null && owner != null && !entries.has(param) && !state.error
    return {
      ...state,
      isLoading: state.isLoading || pendingFirstLoad,
      refetch: () => (param !== null ? load(param) : Promise.resolve()),
    }
  }

  return { use, invalidate }
}
