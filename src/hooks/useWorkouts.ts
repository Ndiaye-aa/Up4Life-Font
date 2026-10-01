import { createResource } from './useResourceCache'
import { getAllWorkoutsService } from '../services/workouts'
import type { WorkoutRecord } from '../@types/workout'

const resource = createResource<WorkoutRecord[]>(getAllWorkoutsService)

/** Lista de treinos do personal logado, compartilhada entre todas as páginas (evita refetch a cada navegação). */
export const useWorkouts = (personalId?: number) => resource.use(personalId)

/** Chamar após criar/editar/excluir um treino para atualizar todas as telas. */
export const invalidateWorkouts = () => resource.invalidate()
