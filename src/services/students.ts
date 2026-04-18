import { api } from './api'
import type { CreateStudentPayload, StudentRecord } from '../@types/student'

export const getStudentsService = async (): Promise<StudentRecord[]> => {
  return api('/alunos')
}

export const createStudentService = async (
  payload: CreateStudentPayload,
): Promise<StudentRecord> => {
  return api('/alunos', {
    method: 'POST',
    data: payload,
  })
}
