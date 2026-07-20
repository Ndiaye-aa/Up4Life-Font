import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthUser, LoginPayload } from '../@types/auth'
import { loginService } from '../services/auth'
import { api, SESSION_EXPIRED_EVENT } from '../services/api'

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<AuthUser>
  logout: () => Promise<void>
  updateUser: (patch: Partial<AuthUser>) => void
  user: AuthUser | null
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

interface MeResponse {
  user: {
    id: number
    nome: string
    telefone: string
    role: AuthUser['role']
  }
}

const mapMeResponse = (data: MeResponse): AuthUser => ({
  id: data.user.id,
  name: data.user.nome,
  phone: data.user.telefone,
  role: data.user.role,
})

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    api('/auth/me', { skipAuthRedirect: true })
      .then((data) => {
        if (!cancelled) setUser(mapMeResponse(data as MeResponse))
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = async (payload: LoginPayload) => {
    setIsLoading(true)

    try {
      const authenticatedUser = await loginService(payload)
      setUser(authenticatedUser)

      return authenticatedUser
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await api('/auth/logout', { method: 'POST' })
    } catch {
      // Mesmo se a chamada falhar (ex: sessão já expirada), limpa o estado local.
    }
    setUser(null)
  }

  useEffect(() => {
    const handleSessionExpired = () => setUser(null)
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
  }, [])

  const updateUser = (patch: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev
      return { ...prev, ...patch }
    })
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      updateUser,
      user,
    }),
    [isLoading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
