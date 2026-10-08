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
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (!user) {
    return <Navigate replace to="/login" />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate replace to="/login" />
  }

  return <>{children}</>
}
