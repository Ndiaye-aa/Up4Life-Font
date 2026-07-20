import { api } from './api'
import type { CreateWorkoutPayload, UpdateWorkoutPayload, WorkoutRecord, WorkoutCategory } from '../@types/workout'

function normalizeExercicios(raw: Record<string, unknown>): WorkoutRecord['exercicios'] {
  const itens = raw.itens ?? raw.exercicios ?? []
  const items = Array.isArray(itens) ? (itens as Record<string, unknown>[]) : []
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
  const personal = raw.personal as Record<string, unknown> | undefined
  const rawAlunoId = raw.alunoId ?? raw.id_aluno ?? fallback.id_aluno
  return {
    id: Number(raw.id),
    nome: (raw.nome ?? raw.objetivo ?? fallback.nome) as string,
    id_aluno: rawAlunoId == null ? null : Number(rawAlunoId),
    id_personal: Number(raw.personalId ?? aluno?.personalId ?? raw.idPersonal ?? raw.id_personal ?? fallback.id_personal),
    nome_aluno: (aluno?.nome ?? personal?.nome ?? raw.nomeAluno ?? raw.nome_aluno ?? fallback.nome_aluno ?? 'Você') as string,
    categoria: (raw.categoria ?? fallback.categoria) as WorkoutCategory,
    ativo: raw.ativo !== false,
    criado_em: (raw.criado_em ?? raw.criadoEm ?? new Date().toISOString()) as string,
    duracao_estimada: (raw.duracao_estimada ?? '—') as string,
    exercicios: normalizeExercicios(raw),
    observacoes: (raw.observacoes ?? fallback.observacoes ?? '') as string,
  }
}

export const getAllWorkoutsService = async (): Promise<WorkoutRecord[]> => {
  const result = await api('/treinos')
  const raw = Array.isArray(result) ? result : result ? [result] : []
  return raw.map((w: Record<string, unknown>) => normalizeWorkout(w, {} as CreateWorkoutPayload))
}

export const getStudentWorkoutsService = async (alunoId: number): Promise<WorkoutRecord[]> => {
  const result = await api(`/treinos/aluno/${alunoId}`)
  const raw = Array.isArray(result) ? result : result ? [result] : []
  return raw.map((w: Record<string, unknown>) => normalizeWorkout(w, {} as CreateWorkoutPayload))
}

function toBackendTreinoDto(payload: CreateWorkoutPayload) {
  return {
    alunoId: payload.id_aluno ?? undefined,
    // Sem aluno, o treino é vinculado ao próprio personal (identificado pelo JWT no backend)
    paraMim: payload.id_aluno == null ? true : undefined,
    objetivo: payload.nome,
    observacoes: payload.observacoes || undefined,
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
}

export const createWorkoutService = async (
  payload: CreateWorkoutPayload,
): Promise<WorkoutRecord> => {
  const response = await api('/treinos', {
    method: 'POST',
    data: toBackendTreinoDto(payload),
  })

  return normalizeWorkout(response as Record<string, unknown>, payload)
}

export const updateWorkoutService = async (
  payload: UpdateWorkoutPayload,
): Promise<WorkoutRecord> => {
  const response = await api(`/treinos/${payload.id}`, {
    method: 'PATCH',
    data: toBackendTreinoDto(payload),
  })
  return normalizeWorkout(response as Record<string, unknown>, payload)
}

export const deleteWorkoutService = async (workoutId: number): Promise<void> => {
  return api(`/treinos/${workoutId}`, {
    method: 'DELETE',
  })
}
