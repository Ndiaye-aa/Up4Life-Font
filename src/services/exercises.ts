import { api } from './api'

export interface ExerciseFromApi {
  id: number
  nome: string
  grupoMuscular: string
}

export const getAllExercisesService = async (): Promise<ExerciseFromApi[]> => {
  const result = await api('/exercicios')
  return Array.isArray(result) ? result : []
}

export interface CreateExercisePayload {
  nome: string
  grupoMuscular: string
  descricao?: string
}

export const createExerciseService = async (payload: CreateExercisePayload): Promise<ExerciseFromApi> => {
  return api('/exercicios', { data: payload })
}
