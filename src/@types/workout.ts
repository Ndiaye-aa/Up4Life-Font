export type WorkoutCategory = 'Musculacao' | 'Funcional' | 'Mobilidade' | 'Cardio'

export interface ExerciseEntry {
  carga: string
  descanso: string
  id: string
  musculo: string
  nome: string
  repeticoes: string
  series: string
}

export interface WorkoutRecord {
  ativo: boolean
  categoria: WorkoutCategory
  criado_em: string
  duracao_estimada: string
  exercicios: ExerciseEntry[]
  id: number
  /** null quando o treino pertence ao próprio personal */
  id_aluno: number | null
  id_personal: number
  nome: string
  nome_aluno: string
  observacoes: string
}

export interface CreateWorkoutPayload {
  categoria: WorkoutCategory
  exercicios: ExerciseEntry[]
  /** null vincula o treino ao próprio personal autenticado */
  id_aluno: number | null
  id_personal: number
  nome: string
  nome_aluno: string
  observacoes?: string
}

export interface UpdateWorkoutPayload extends CreateWorkoutPayload {
  id: number
}
