import {
  createContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthUser, LoginPayload } from '../@types/auth'
import { loginService } from '../services/auth'

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<AuthUser>
  logout: () => void
  user: AuthUser | null
}

const AUTH_STORAGE_KEY = 'up4life.auth.user'

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

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      user,
    }),
    [isLoading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
