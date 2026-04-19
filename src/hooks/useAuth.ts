import { useContext, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../store/AuthContext'

export const useAuth = () => {
  const context = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.')
  }

  const { isAuthenticated, user } = context

  useEffect(() => {
    // Redireciona se não houver usuário ou se o token (accessToken) não existir
    // Mas apenas se não estivermos já na página de login
    if ((!isAuthenticated || !user?.accessToken) && location.pathname !== '/login') {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, user, navigate, location.pathname])

  return context
}
