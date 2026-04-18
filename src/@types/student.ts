export type StudentSex = 'M' | 'F'

export interface StudentRecord {
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
  senha: string // Adicionado para o cadastro
}
