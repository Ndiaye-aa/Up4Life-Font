const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const REQUEST_TIMEOUT_MS = 30_000

interface RequestOptions extends RequestInit {
  data?: any
  skipAuthRedirect?: boolean
}

export const api = async (endpoint: string, options: RequestOptions = {}) => {
  const { data, skipAuthRedirect = false, ...customConfig } = options

  const user = JSON.parse(localStorage.getItem('up4life.auth.user') || 'null')
  const token = user?.access_token || user?.accessToken

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
    signal: controller.signal,
  }

  if (data) {
    config.body = JSON.stringify(data)
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    clearTimeout(timeoutId)

    if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}))

      if (!skipAuthRedirect && token) {
        localStorage.removeItem('up4life.auth.user')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        throw new Error(
          errorData.message || 'Sessao expirada. Faca login novamente.',
        )
      }

      throw new Error(errorData.message || 'Credenciais invalidas.')
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Ocorreu um erro na requisição.')
    }

    return response.json()
  } catch (err) {
    clearTimeout(timeoutId)
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('A requisição demorou muito. Verifique sua conexão.')
    }
    throw err
  }
}
