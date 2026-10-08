import { ChevronRight } from 'lucide-react'
import type { ProgressSummaryRow } from '../../../@types/progress'
import type { StudentRecord } from '../../../@types/student'
import { formatPhone } from '../../../utils/formatPhone'
import { formatPercent, formatYmd } from '../../../utils/sessionFormat'
import { AlertBadges } from '../../progress/AlertBadges'

interface Props {
  onOpen: (student: StudentRecord) => void
  onToggleStatus: (student: StudentRecord) => void
  students: StudentRecord[]
  summary: Map<number, ProgressSummaryRow>
}

const initialsOf = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

/** Cards dos alunos com frequência de 30 dias, última sessão e alertas. */
export const StudentProgressList = ({ onOpen, onToggleStatus, students, summary }: Props) => (
  <ul className="grid gap-3 md:grid-cols-2">
    {students.map((student) => {
      const row = summary.get(student.id)
      return (
        <li key={student.id} className="card rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <button
              className="flex min-w-0 flex-1 items-start gap-3 text-left"
              onClick={() => onOpen(student)}
              type="button"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#a855f7] to-[#6d28d9] text-sm font-semibold text-white">
                {initialsOf(student.nome)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{student.nome}</span>
                <span className="block truncate text-xs text-faint">{formatPhone(student.telefone)}</span>
              </span>
              <ChevronRight className="mt-1 shrink-0 text-faint" size={16} />
            </button>
            <button
              aria-label={student.ativo ? `Desativar ${student.nome}` : `Ativar ${student.nome}`}
              aria-pressed={student.ativo}
              className={`relative mt-1 h-5 w-9 shrink-0 rounded-full transition ${
                student.ativo ? 'bg-accent-strong' : 'bg-line'
              }`}
              onClick={() => onToggleStatus(student)}
              title={student.ativo ? 'Desativar aluno' : 'Ativar aluno'}
              type="button"
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                  student.ativo ? 'left-[1.125rem]' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-3 text-xs">
            <div>
              <dt className="text-faint">Frequência (30 dias)</dt>
              <dd className="mt-0.5 text-base font-semibold text-ink">
                {formatPercent(row?.frequencia30d ?? null)}
              </dd>
            </div>
            <div>
              <dt className="text-faint">Última sessão</dt>
              <dd className="mt-0.5 text-base font-semibold text-ink">
                {row?.ultimaSessao ? formatYmd(row.ultimaSessao) : '—'}
              </dd>
            </div>
          </dl>

          {row && row.alertas.length > 0 ? (
            <div className="mt-3">
              <AlertBadges alertas={row.alertas} />
            </div>
          ) : null}
        </li>
      )
    })}
  </ul>
)
