import { createResource } from './useResourceCache'
import { getStudentsService } from '../services/students'
import type { StudentRecord } from '../@types/student'

const resource = createResource<StudentRecord[]>(getStudentsService)

/** Lista de alunos do personal logado, compartilhada entre todas as páginas (evita refetch a cada navegação). */
export const useStudents = (personalId?: number) => resource.use(personalId)

/** Chamar após criar/editar/excluir um aluno para atualizar todas as telas. */
export const invalidateStudents = () => resource.invalidate()
