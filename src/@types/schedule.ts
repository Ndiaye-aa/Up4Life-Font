export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type Modalidade = 'PRESENCIAL' | 'ONLINE'

export interface HorarioDia {
  hora: string
  modalidade: Modalidade
}

export interface StudentSchedule {
  alunoId: number
  dias: DiaSemana[]
  horarios?: Partial<Record<DiaSemana, HorarioDia>>
  acompanhamentoDesde?: string
}
