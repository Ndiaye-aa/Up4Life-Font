export type StudentSex = 'M' | 'F'

export interface StudentRecord {
  ativo: boolean
  criadoEm: string
  historicoSaude: string | null
  id: number
  personalId: number
  nascimento: string | null
  nome: string
  sexo: StudentSex | null
  telefone: string
}

export interface CreateStudentPayload {
  historicoSaude?: string
  nascimento?: string
  nome: string
  sexo?: StudentSex
  telefone: string
}

export interface StudentCard {
  goal: string
  id: number
  initials: string
  name: string
  personalId: number
  status: 'ativo' | 'inativo'
  telefone: string
}
