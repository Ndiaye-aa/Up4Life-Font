export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface StudentSchedule {
  alunoId: number
  dias: DiaSemana[]
  horarios?: Partial<Record<DiaSemana, string>>
}
