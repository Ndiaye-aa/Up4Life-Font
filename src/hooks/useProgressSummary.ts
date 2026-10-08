import { createResource } from './useResourceCache'
import { getProgressSummaryService } from '../services/progressService'
import type { ProgressSummaryRow } from '../@types/progress'

const resource = createResource<ProgressSummaryRow[]>(getProgressSummaryService)

/** Frequência, última sessão e alertas de todos os alunos do personal (uma query). */
export const useProgressSummary = (personalId?: number) => resource.use(personalId)

export const invalidateProgressSummary = () => resource.invalidate()
