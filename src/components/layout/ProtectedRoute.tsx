import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { UserRole } from '../../@types/auth'
import { useAuth } from '../../hooks/useAuth'

interface ProtectedRouteProps {
  allowedRoles: UserRole[]
  children: ReactNode
}

export const ProtectedRoute = ({
  allowedRoles,
  children,
}: ProtectedRouteProps) => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate replace to="/login" />
  }

  if (!allowedRoles.includes(user.role)) {
    const fallbackRoute =
      user.role === 'PERSONAL' ? '/dashboard/admin' : '/dashboard/aluno'

    return <Navigate replace to={fallbackRoute} />
  }

  return <>{children}</>
}
