import { api } from './api'

export interface ExerciseFromApi {
  id: number
  nome: string
  grupoMuscular: string
}

export const getAllExercisesService = async (): Promise<ExerciseFromApi[]> => {
  return api('/exercicios')
}

export const getExercisesByGroupService = async (group: string): Promise<ExerciseFromApi[]> => {
  return api(`/exercicios?grupoMuscular=${group}`)
}

export interface CreateExercisePayload {
  nome: string
  grupoMuscular: string
  descricao?: string
}

export const createExerciseService = async (payload: CreateExercisePayload): Promise<ExerciseFromApi> => {
  return api('/exercicios', { data: payload })
}
