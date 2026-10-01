import { createResource } from './useResourceCache'
import { getAllAssessmentsService, type AssessmentRecord } from '../services/assessments'

const resource = createResource<AssessmentRecord[]>(getAllAssessmentsService)

/** Lista de avaliações do personal logado, compartilhada entre todas as páginas (evita refetch a cada navegação). */
export const useAssessments = (personalId?: number) => resource.use(personalId)

/** Chamar após criar uma avaliação para atualizar todas as telas. */
export const invalidateAssessments = () => resource.invalidate()
