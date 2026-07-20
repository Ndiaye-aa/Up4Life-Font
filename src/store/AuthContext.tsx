import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthUser, LoginPayload } from '../@types/auth'
import { loginService } from '../services/auth'
import { AUTH_STORAGE_KEY, SESSION_EXPIRED_EVENT } from '../services/api'

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<AuthUser>
  logout: () => void
  updateUser: (patch: Partial<AuthUser>) => void
  user: AuthUser | null
}

const getInitialUser = (): AuthUser | null => {
  const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY)

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser) as AuthUser
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(() => getInitialUser())
  const [isLoading, setIsLoading] = useState(false)

  const login = async (payload: LoginPayload) => {
    setIsLoading(true)

    try {
      const authenticatedUser = await loginService(payload)
      setUser(authenticatedUser)
      window.localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify(authenticatedUser),
      )

      return authenticatedUser
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  useEffect(() => {
    const handleSessionExpired = () => logout()
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
  }, [])

  const updateUser = (patch: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next))
      return next
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
