// Em produção sempre usamos /api (same-origin) — a Vercel faz proxy reverso
// de /api/* para o backend real (ver vercel.json). Isso mantém os cookies de
// auth/CSRF como first-party para o navegador, o que é exigido pelo
// SameSite=Lax dos cookies (ver auth.service.ts no backend): se VITE_API_URL
// apontasse direto para o domínio do backend, a chamada voltaria a ser
// cross-site e o navegador passaria a descartar o cookie, derrubando a
// sessão logo após o login. Em dev, VITE_API_URL continua livre para apontar
// pro backend local.
const API_BASE_URL = import.meta.env.PROD
  ? '/api'
  : import.meta.env.VITE_API_URL || 'http://localhost:3000'
const REQUEST_TIMEOUT_MS = 30_000

export const SESSION_EXPIRED_EVENT = 'up4life:session-expired'
export const SESSION_EXPIRED_STORAGE_KEY = 'up4life.session_expired'

interface RequestOptions extends RequestInit {
  data?: unknown
  skipAuthRedirect?: boolean
}

const getCsrfToken = (): string | null => {
  const match = document.cookie.match(/(?:^|; )csrf_token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

// Refresh compartilhado: evita disparar vários /auth/refresh em paralelo
// quando várias chamadas tomam 401 ao mesmo tempo (token expirado).
let refreshPromise: Promise<boolean> | null = null

const tryRefresh = (): Promise<boolean> => {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-CSRF-Token': getCsrfToken() ?? '',
      },
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

const doFetch = (endpoint: string, config: RequestInit) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...config,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const api = async (
  endpoint: string,
  options: RequestOptions = {},
  isRetry = false,
): Promise<any> => {
  const { data, skipAuthRedirect = false, ...customConfig } = options

  const method = customConfig.method ?? (data ? 'POST' : 'GET')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (method !== 'GET' && method !== 'HEAD') {
    headers['X-CSRF-Token'] = getCsrfToken() ?? ''
  }

  const config: RequestInit = {
    method,
    credentials: 'include',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  }

  if (data) {
    config.body = JSON.stringify(data)
  }

  try {
    const response = await doFetch(endpoint, config)

    if (response.status === 401) {
      if (skipAuthRedirect) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Credenciais invalidas.')
      }

      if (!isRetry) {
        const refreshed = await tryRefresh()
        if (refreshed) {
          return api(endpoint, options, true)
        }
      }

      if (window.location.pathname !== '/login') {
        sessionStorage.setItem(SESSION_EXPIRED_STORAGE_KEY, '1')
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
      }
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || 'Sessao expirada. Faca login novamente.',
      )
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Ocorreu um erro na requisição.')
    }

    return response.json()
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('A requisição demorou muito. Verifique sua conexão.')
    }
    throw err
  }
}
