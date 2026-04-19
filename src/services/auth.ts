import { api } from './api'
import type { AuthUser, LoginPayload } from '../@types/auth'

export const loginService = async ({
  phone,
  password,
  role,
}: LoginPayload): Promise<AuthUser> => {
  if (!phone.trim() || !password.trim()) {
    throw new Error('Preencha telefone e senha para continuar.')
  }

  const response = await api('/auth/login', {
    method: 'POST',
    skipAuthRedirect: true,
    data: {
      telefone: phone.replace(/\D/g, ''),
      senha: password,
      role,
    },
  })

  return {
    id: response.user.id,
    name: response.user.nome,
    phone: response.user.telefone,
    role: response.user.role,
    accessToken: response.access_token,
  }
}
