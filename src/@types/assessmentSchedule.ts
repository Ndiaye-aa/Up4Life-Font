export type StatusAgendamento = 'PENDENTE' | 'REALIZADA' | 'CANCELADA'

export interface AssessmentScheduleRecord {
  id: number
  alunoId: number
  personalId: number
  dataAgendada: string
  status: StatusAgendamento
  avaliacaoId: number | null
  nomeAluno?: string
}

export interface CreateAssessmentSchedulePayload {
  alunoId: number
  dataAgendada: string
}
