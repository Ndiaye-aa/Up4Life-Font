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

export interface CreatedStudent {
  student: StudentRecord
  // Senha inicial gerada pelo servidor; retornada uma única vez no cadastro.
  senhaInicial?: string
}
