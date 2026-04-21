import { api } from './api'
import type { CreateWorkoutPayload, UpdateWorkoutPayload, WorkoutRecord, WorkoutCategory } from '../@types/workout'

function normalizeExercicios(raw: Record<string, unknown>): WorkoutRecord['exercicios'] {
  const items = (raw.itens ?? raw.exercicios ?? []) as Record<string, unknown>[]
  return items.map((item) => ({
    id: String(item.id ?? item.ordem ?? ''),
    nome: (item.exercicio ?? item.nome ?? '') as string,
    musculo: (item.musculo ?? item.grupoMuscular ?? '') as string,
    series: String(item.series ?? ''),
    repeticoes: String(item.repeticoes ?? ''),
    carga: String(item.carga ?? ''),
    descanso: String(item.descanso ?? ''),
  }))
}

function normalizeWorkout(raw: Record<string, unknown>, fallback: CreateWorkoutPayload): WorkoutRecord {
  const aluno = raw.aluno as Record<string, unknown> | undefined
  return {
    id: Number(raw.id),
    nome: (raw.nome ?? raw.objetivo ?? fallback.nome) as string,
    id_aluno: Number(raw.alunoId ?? raw.id_aluno ?? fallback.id_aluno),
    id_personal: Number(aluno?.personalId ?? raw.idPersonal ?? raw.id_personal ?? fallback.id_personal),
    nome_aluno: (aluno?.nome ?? raw.nomeAluno ?? raw.nome_aluno ?? fallback.nome_aluno) as string,
    categoria: (raw.categoria ?? fallback.categoria) as WorkoutCategory,
    ativo: raw.ativo !== false,
    criado_em: (raw.criado_em ?? raw.criadoEm ?? new Date().toISOString()) as string,
    duracao_estimada: (raw.duracao_estimada ?? '—') as string,
    exercicios: normalizeExercicios(raw),
  }
}

export const getAllWorkoutsService = async (): Promise<WorkoutRecord[]> => {
  const result = await api('/treinos')
  const raw = Array.isArray(result) ? result : result ? [result] : []
  return raw.map((w: Record<string, unknown>) => normalizeWorkout(w, {} as CreateWorkoutPayload))
}

export const getStudentWorkoutsService = async (): Promise<WorkoutRecord[]> => {
  const result = await api('/treinos/meu-treino')
  const raw = Array.isArray(result) ? result : result ? [result] : []
  return raw.map((w: Record<string, unknown>) => normalizeWorkout(w, {} as CreateWorkoutPayload))
}

export const createWorkoutService = async (
  payload: CreateWorkoutPayload,
): Promise<WorkoutRecord> => {
  const backendDto = {
    alunoId: payload.id_aluno,
    idPersonal: payload.id_personal,
    objetivo: payload.nome,
    categoria: payload.categoria,
    itens: payload.exercicios.map((ex, index) => ({
      exercicio: ex.nome,
      series: Number.parseInt(ex.series, 10),
      repeticoes: ex.repeticoes,
      carga: ex.carga || undefined,
      ordem: index + 1,
      descanso: Number.parseInt(ex.descanso, 10),
    })),
  }

  const response = await api('/treinos', {
    method: 'POST',
    data: backendDto,
  })

  return normalizeWorkout(response as Record<string, unknown>, payload)
}

export const updateWorkoutService = async (
  payload: UpdateWorkoutPayload,
): Promise<WorkoutRecord> => {
  const response = await api(`/treinos/${payload.id}`, {
    method: 'PATCH',
    data: payload,
  })
  return normalizeWorkout(response as Record<string, unknown>, payload)
}

export const deleteWorkoutService = async (workoutId: number): Promise<void> => {
  return api(`/treinos/${workoutId}`, {
    method: 'DELETE',
  })
}
