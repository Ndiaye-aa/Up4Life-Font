import { api } from './api'
import type { CreateWorkoutPayload, UpdateWorkoutPayload, WorkoutRecord } from '../@types/workout'

export const getAllWorkoutsService = async (): Promise<WorkoutRecord[]> => {
  // O backend não tem um 'fetch all' genérico para personal ainda, 
  // mas podemos buscar por aluno ou implementar conforme necessário.
  // Por enquanto, vamos manter a assinatura mas chamar o endpoint correto se existir.
  return api('/treinos')
}

export const getStudentWorkoutsService = async (): Promise<WorkoutRecord[]> => {
  const result = await api('/treinos/meu-treino')
  const raw = Array.isArray(result) ? result : result ? [result] : []
  return raw.map((w: Record<string, unknown>) => ({
    ...w,
    exercicios: ((w.itens ?? w.exercicios ?? []) as Record<string, unknown>[]).map((item) => ({
      id: String(item.id ?? item.ordem ?? ''),
      nome: (item.exercicio ?? item.nome ?? '') as string,
      musculo: (item.musculo ?? '') as string,
      series: String(item.series ?? ''),
      repeticoes: String(item.repeticoes ?? ''),
      carga: String(item.carga ?? ''),
      descanso: String(item.descanso ?? ''),
    })),
  })) as WorkoutRecord[]
}

export const createWorkoutService = async (
  payload: CreateWorkoutPayload,
): Promise<WorkoutRecord> => {
  // Mapeamento para o DTO do Backend
  const backendDto = {
    alunoId: payload.id_aluno,
    objetivo: payload.nome, // Usando o nome como objetivo por enquanto
    itens: payload.exercicios.map((ex, index) => ({
      exercicio: ex.nome,
      series: Number.parseInt(ex.series, 10),
      repeticoes: ex.repeticoes,
      carga: ex.carga,
      ordem: index + 1,
      descanso: Number.parseInt(ex.descanso, 10),
    })),
  }

  return api('/treinos', {
    method: 'POST',
    data: backendDto,
  })
}

export const updateWorkoutService = async (
  payload: UpdateWorkoutPayload,
): Promise<WorkoutRecord> => {
  // O backend atual não parece ter um PUT /treinos/:id implementado 
  // Mas vamos deixar a estrutura pronta.
  return api(`/treinos/${payload.id}`, {
    method: 'PATCH',
    data: payload,
  })
}

export const deleteWorkoutService = async (workoutId: number): Promise<void> => {
  return api(`/treinos/${workoutId}`, {
    method: 'DELETE',
  })
}
