export type UserRole = 'PERSONAL' | 'ALUNO'

export interface AuthUser {
  id: number
  phone: string
  name: string
  role: UserRole
}

export interface LoginPayload {
  phone: string
  password: string
  role: UserRole
}
