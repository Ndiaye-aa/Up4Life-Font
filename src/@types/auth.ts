export type UserRole = 'PERSONAL' | 'ALUNO'

export interface AuthUser {
  id: number
  phone: string
  name: string
  role: UserRole
  /** Fuso IANA do personal; define a "data de hoje" das sessões. */
  timezone: string
}

export interface LoginPayload {
  phone: string
  password: string
  role: UserRole
}
