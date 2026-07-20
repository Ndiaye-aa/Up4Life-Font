import { X } from 'lucide-react'
import { useState } from 'react'
import type { StudentRecord } from '../../../@types/student'
import {
  createAssessmentScheduleService,
  updateAssessmentScheduleService,
} from '../../../services/assessmentSchedule'
import type { AssessmentScheduleRecord } from '../../../@types/assessmentSchedule'

interface Props {
  initialSchedule?: AssessmentScheduleRecord
  onClose: () => void
  onSaved: (schedule: AssessmentScheduleRecord) => void
  students: StudentRecord[]
}

const toDateInputValue = (isoDate: string) => {
  const date = new Date(isoDate)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

export const ScheduleAssessmentModal = ({ initialSchedule, onClose, onSaved, students }: Props) => {
  const isEditing = Boolean(initialSchedule)
  const [alunoId, setAlunoId] = useState<number | ''>(
    initialSchedule?.alunoId ?? students[0]?.id ?? '',
  )
  const [data, setData] = useState(
    initialSchedule ? toDateInputValue(initialSchedule.dataAgendada) : '',
  )
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitError('')

    if (alunoId === '') {
      setSubmitError('Selecione o aluno.')
      return
    }

    if (!data) {
      setSubmitError('Informe a data da avaliação.')
      return
    }

    setIsSubmitting(true)

    try {
      const saved = initialSchedule
        ? await updateAssessmentScheduleService(initialSchedule.id, {
            alunoId,
            dataAgendada: new Date(data).toISOString(),
          })
        : await createAssessmentScheduleService({
            alunoId,
            dataAgendada: new Date(data).toISOString(),
          })
      onSaved(saved)
      onClose()
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Não foi possível salvar o agendamento agora.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-[1.6rem] border border-line bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-3 p-5 pb-0">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-accent">Avaliações</p>
            <h3 className="font-display mt-2 text-lg font-semibold text-ink">
              {isEditing ? 'Editar agendamento' : 'Agendar avaliação'}
            </h3>
          </div>
          <button
            className="rounded-xl p-1.5 text-faint transition hover:bg-elev hover:text-ink"
            onClick={onClose}
            type="button"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-5">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-mute">Aluno</span>
            <select
              className="field"
              disabled={students.length === 0}
              onChange={(event) => setAlunoId(event.target.value ? Number(event.target.value) : '')}
              value={alunoId}
            >
              <option value="">
                {students.length === 0 ? 'Nenhum aluno cadastrado' : 'Selecione o aluno'}
              </option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-mute">
              Data da avaliação
            </span>
            <input
              className="field"
              onChange={(event) => setData(event.target.value)}
              type="date"
              value={data}
            />
          </label>

          {submitError ? (
            <p className="text-sm text-rose-400 light:text-rose-600">{submitError}</p>
          ) : null}

          <div className="mt-1 flex gap-3">
            <button
              className="flex-1 rounded-2xl border border-line px-4 py-2.5 text-sm font-medium text-mute transition hover:bg-elev"
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="btn-primary flex-1"
              disabled={isSubmitting}
              onClick={handleSubmit}
              type="button"
            >
              {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar' : 'Agendar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
