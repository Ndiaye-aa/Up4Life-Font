import { Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { StudentProfileModal } from './StudentProfileModal'
import { formatPhone } from '../../../utils/formatPhone'

interface StudentCard {
  goal: string
  id: number
  personalId: number
  initials: string
  lastWorkout: string
  name: string
  progress: number
  status: 'ativo' | 'inativo'
  telefone: string
}

interface Props {
  onClose: () => void
  onToggleStatus: (student: StudentCard) => void
  students: StudentCard[]
}

const STATUS_OPTIONS = ['Todos', 'Ativos', 'Inativos'] as const
type StatusFilter = (typeof STATUS_OPTIONS)[number]

export const StudentsListModal = ({ onClose, onToggleStatus, students }: Props) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Todos')
  const [selectedStudent, setSelectedStudent] = useState<StudentCard | null>(null)

  const filteredStudents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return students.filter((student) => {
      const matchesStatus =
        statusFilter === 'Todos' ||
        (statusFilter === 'Ativos' && student.status === 'ativo') ||
        (statusFilter === 'Inativos' && student.status === 'inativo')

      const matchesSearch =
        normalizedSearch.length === 0 ||
        student.name.toLowerCase().includes(normalizedSearch)

      return matchesStatus && matchesSearch
    })
  }, [students, searchTerm, statusFilter])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-[1.6rem] border border-line bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-3 p-5 pb-0">
          <div>
            <h3 className="font-display text-lg font-semibold text-ink">
              Todos os alunos
            </h3>
            <p className="text-xs text-faint">
              {students.length === 1 ? '1 aluno cadastrado' : `${students.length} alunos cadastrados`}
            </p>
          </div>
          <button
            className="rounded-xl p-1.5 text-faint transition hover:bg-elev hover:text-ink"
            onClick={onClose}
            type="button"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 pb-0">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint"
              size={16}
            />
            <input
              className="field pl-10"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar aluno pelo nome"
              type="text"
              value={searchTerm}
            />
          </div>

          <div className="mt-3 grid grid-cols-3 rounded-2xl bg-elev p-1">
            {STATUS_OPTIONS.map((option) => {
              const isActive = option === statusFilter
              return (
                <button
                  key={option}
                  className={`rounded-[0.85rem] px-3 py-2 text-xs font-medium transition ${
                    isActive ? 'bg-surface text-ink shadow-sm' : 'text-mute hover:text-accent'
                  }`}
                  onClick={() => setStatusFilter(option)}
                  type="button"
                >
                  {option}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-3 flex-1 divide-y divide-line overflow-y-auto px-5 pb-5">
          {filteredStudents.length === 0 ? (
            <p className="py-6 text-center text-sm text-faint">Nenhum aluno encontrado.</p>
          ) : (
            filteredStudents.map((student) => {
              const isActive = student.status === 'ativo'
              return (
                <div className="flex items-center gap-3 py-3" key={student.id}>
                  <button
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left transition hover:bg-elev"
                    onClick={() => setSelectedStudent(student)}
                    type="button"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#a855f7] to-[#6d28d9] text-xs font-semibold text-white">
                      {student.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{student.name}</p>
                      <p className="truncate text-xs text-faint">{formatPhone(student.telefone)}</p>
                    </div>
                  </button>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ${
                      isActive ? 'bg-accent-soft text-accent' : 'bg-elev text-faint'
                    }`}
                  >
                    {isActive ? 'Ativo' : 'Inativo'}
                  </span>
                  <button
                    aria-label={isActive ? `Desativar ${student.name}` : `Ativar ${student.name}`}
                    aria-pressed={isActive}
                    className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                      isActive ? 'bg-accent-strong' : 'bg-line'
                    }`}
                    onClick={() => onToggleStatus(student)}
                    title={isActive ? 'Desativar aluno' : 'Ativar aluno'}
                    type="button"
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                        isActive ? 'left-[1.125rem]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>

      {selectedStudent ? (
        <StudentProfileModal
          onClose={() => setSelectedStudent(null)}
          student={selectedStudent}
        />
      ) : null}
    </div>
  )
}
