export type SessionStatus = 'REALIZADA' | 'PARCIAL' | 'FALTA' | 'FALTA_JUSTIFICADA'
export type SessionOrigin = 'ALUNO' | 'PERSONAL' | 'AUTOMATICA'
export type Modality = 'PRESENCIAL' | 'ONLINE'

export interface SessionItem {
  id?: number
  ordem: number
  exercicio: string
  grupoMuscular?: string | null
  seriesFeitas?: number | null
  repsFeitas?: string | null
  cargaTexto?: string | null
  cargaKg?: number | null
  concluido: boolean
}

export interface SessionRecord {
  id: number
  alunoId: number
  treinoId: number | null
  treinoObjetivo: string | null
  /** YYYY-MM-DD no fuso do personal */
  data: string
  prevista: boolean
  status: SessionStatus
  origem: SessionOrigin
  modalidade: Modality | null
  iniciadaEm: string | null
  concluidaEm: string | null
  motivoFalta: string | null
  rpe: number | null
  disposicao: number | null
  dor: boolean
  dorLocal: string | null
  comentarioAluno: string | null
  respostaPersonal: string | null
  validadaEm: string | null
  reposicaoDeId: number | null
  /** true quando esta falta já foi reposta por outra sessão */
  reposta: boolean
  version: number
  itens: SessionItem[]
}

export interface SessionFeedback {
  rpe?: number
  disposicao?: number
  dor?: boolean
  dorLocal?: string
  comentarioAluno?: string
}

export interface CreateSessionPayload extends SessionFeedback {
  alunoId?: number
  data: string
  status: SessionStatus
  treinoId?: number
  motivoFalta?: string
  iniciadaEm?: string
  concluidaEm?: string
  itens?: SessionItem[]
}

export interface UpdateSessionPayload extends SessionFeedback {
  version: number
  status?: SessionStatus
  motivoFalta?: string
  iniciadaEm?: string
  concluidaEm?: string
  itens?: SessionItem[]
  respostaPersonal?: string
  validar?: boolean
}
