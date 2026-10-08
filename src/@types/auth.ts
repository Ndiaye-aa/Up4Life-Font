export type UserRole = 'PERSONAL'

export interface AuthUser {
  id: number
  phone: string
  name: string
  role: UserRole
}

export interface LoginPayload {
  phone: string
  password: string
}
