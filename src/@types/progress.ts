import type { Modality, SessionStatus } from './session'

export type ProgressPeriod = '30d' | '90d' | '180d'

export type AlertCode =
  | 'FALTAS_SEGUIDAS'
  | 'DOR_REPORTADA'
  | 'ESFORCO_ALTO'
  | 'AVALIACAO_ATRASADA'
  | 'TREINO_VENCIDO'

export interface ProgressData {
  periodo: { de: string; ate: string }
  acompanhamentoDesde: string | null
  frequencia: {
    percentual: number | null
    previstas: number
    cumpridas: number
    faltas: number
    justificadas: number
    extras: number
  }
  faltasConsecutivas: number
  sequenciaAtual: number
  feedback: { rpeMedio: number | null; dorUltimos7d: boolean }
  calendario: Array<{
    data: string
    status: SessionStatus
    reposta: boolean
    modalidade: Modality | null
  }>
  semanal: Array<{ semana: string; previstas: number; cumpridas: number }>
  volumePorGrupo: Array<{ semana: string; grupo: string; volumeKg: number }>
  cargaPorExercicio: Array<{
    exercicio: string
    pontos: Array<{ data: string; cargaKg: number }>
  }>
  avaliacoes: {
    serie: Array<{
      data: string
      peso: number
      percentualGordura: number | null
      imc: number | null
      massaMagra: number | null
    }>
    deltaDesdePrimeira: { peso: number | null; percentualGordura: number | null }
  }
  alertas: AlertCode[]
}

export interface ProgressSummaryRow {
  alunoId: number
  frequencia30d: number | null
  ultimaSessao: string | null
  faltasConsecutivas: number
  alertas: AlertCode[]
}
