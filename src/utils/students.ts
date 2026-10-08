import type { StudentCard, StudentRecord } from '../@types/student'

export const mapStudentRecordToCard = (student: StudentRecord): StudentCard => ({
  goal: student.historicoSaude?.trim() ? 'Saude acompanhada' : 'Novo cadastro',
  id: student.id,
  initials: student.nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0]?.toUpperCase() ?? '')
    .join(''),
  name: student.nome,
  personalId: student.personalId,
  status: student.ativo ? 'ativo' : 'inativo',
  telefone: student.telefone,
})
