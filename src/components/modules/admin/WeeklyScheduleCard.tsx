import { ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { DiaSemana, StudentSchedule } from '../../../@types/schedule'
import {
  getWeeklyScheduleService,
  removeStudentScheduleService,
  saveStudentScheduleService,
} from '../../../services/schedule'
import { EditScheduleModal } from './EditScheduleModal'

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

const DAYS: { value: DiaSemana; abbr: string }[] = [
  { value: 1, abbr: 'Seg' },
  { value: 2, abbr: 'Ter' },
  { value: 3, abbr: 'Qua' },
  { value: 4, abbr: 'Qui' },
  { value: 5, abbr: 'Sex' },
  { value: 6, abbr: 'Sáb' },
  { value: 0, abbr: 'Dom' },
]

interface Props {
  personalId: number
  students: StudentCard[]
}

const DRAG_THRESHOLD_PX = 6

// Arrastar com o mouse rola a grade na horizontal; toque usa o scroll nativo.
const useDragScroll = () => {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const pointerState = useRef({ isDown: false, scrollLeft: 0, startX: 0 })
  const wasDragged = useRef(false)

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    const el = scrollRef.current
    if (!el) return
    pointerState.current = { isDown: true, scrollLeft: el.scrollLeft, startX: event.clientX }
    wasDragged.current = false
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current
    if (!el || !pointerState.current.isDown) return
    const delta = event.clientX - pointerState.current.startX
    if (!wasDragged.current && Math.abs(delta) > DRAG_THRESHOLD_PX) {
      wasDragged.current = true
      el.setPointerCapture(event.pointerId)
    }
    if (wasDragged.current) {
      el.scrollLeft = pointerState.current.scrollLeft - delta
    }
  }

  const endDrag = () => {
    pointerState.current.isDown = false
  }

  const guardClick = (handler: () => void) => () => {
    if (wasDragged.current) {
      wasDragged.current = false
      return
    }
    handler()
  }

  return { endDrag, guardClick, onPointerDown, onPointerMove, scrollRef }
}

export const WeeklyScheduleCard = ({ personalId, students }: Props) => {
  const [schedules, setSchedules] = useState<StudentSchedule[]>([])
  const [editingStudent, setEditingStudent] = useState<StudentCard | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const { endDrag, guardClick, onPointerDown, onPointerMove, scrollRef } = useDragScroll()

  useEffect(() => {
    if (!personalId) return
    getWeeklyScheduleService(personalId).then(setSchedules)
  }, [personalId])

  const daysByStudent = useMemo(() => {
    const map = new Map<number, DiaSemana[]>()
    schedules.forEach((schedule) => map.set(schedule.alunoId, schedule.dias))
    return map
  }, [schedules])

  const horariosByStudent = useMemo(() => {
    const map = new Map<number, Partial<Record<DiaSemana, string>>>()
    schedules.forEach((schedule) => map.set(schedule.alunoId, schedule.horarios ?? {}))
    return map
  }, [schedules])

  const scheduledStudents = useMemo(
    () => students.filter((student) => (daysByStudent.get(student.id)?.length ?? 0) > 0),
    [students, daysByStudent],
  )

  const unscheduledStudents = useMemo(
    () => students.filter((student) => (daysByStudent.get(student.id)?.length ?? 0) === 0),
    [students, daysByStudent],
  )

  const today = new Date().getDay() as DiaSemana

  const trainToday = scheduledStudents.filter((student) =>
    daysByStudent.get(student.id)?.includes(today),
  ).length

  const expandedRows = useMemo(() => {
    const times = new Set<string>()
    let hasNoTime = false
    scheduledStudents.forEach((student) => {
      const dias = daysByStudent.get(student.id) ?? []
      const horarios = horariosByStudent.get(student.id) ?? {}
      dias.forEach((dia) => {
        const horario = horarios[dia]
        if (horario) times.add(horario)
        else hasNoTime = true
      })
    })
    const toMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number)
      return hours * 60 + minutes
    }
    const rows = Array.from(times)
      .sort((a, b) => toMinutes(a) - toMinutes(b))
      .map((time) => ({ key: time, label: time }))
    if (hasNoTime) rows.push({ key: 'sem-horario', label: 'Sem horário' })
    return rows
  }, [scheduledStudents, daysByStudent, horariosByStudent])

  const handleSave = async (dias: DiaSemana[], horarios: Partial<Record<DiaSemana, string>>) => {
    if (!editingStudent) return
    setIsSaving(true)
    setSaveError('')
    try {
      const updated = await saveStudentScheduleService(personalId, {
        alunoId: editingStudent.id,
        dias,
        horarios,
      })
      setSchedules(updated)
      setEditingStudent(null)
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : 'Não foi possível salvar a agenda agora.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemove = async (studentId: number) => {
    try {
      const updated = await removeStudentScheduleService(personalId, studentId)
      setSchedules(updated)
    } catch {
      setSaveError('Não foi possível remover a agenda agora.')
    }
  }

  return (
    <section className="card rounded-[2rem]">
      <button
        className="flex w-full items-center justify-between gap-3 border-b border-line p-4 text-left"
        onClick={() => setIsExpanded((current) => !current)}
        type="button"
      >
        <span className="flex items-center gap-2">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Treinos da semana
          </h2>
          <ChevronDown
            className={`text-faint transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            size={18}
          />
        </span>
        <span className="shrink-0 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
          {trainToday === 1 ? '1 aluno treina hoje' : `${trainToday} alunos treinam hoje`}
        </span>
      </button>

      {students.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <p className="text-sm font-medium text-ink">
            Cadastre alunos para montar a agenda.
          </p>
        </div>
      ) : (
        <>
          {isExpanded ? (
            <div
              className="cursor-grab overflow-x-auto active:cursor-grabbing"
              onPointerCancel={endDrag}
              onPointerDown={onPointerDown}
              onPointerLeave={endDrag}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              ref={scrollRef}
            >
              <button
                aria-label="Voltar à visão resumida"
                className="grid w-full min-w-[680px] select-none grid-cols-[88px_repeat(7,1fr)] gap-1.5 p-4 text-left"
                onClick={guardClick(() => setIsExpanded(false))}
                type="button"
              >
                <div className="text-center text-[0.68rem] font-semibold uppercase tracking-wide text-faint">
                  Horários
                </div>
                {DAYS.map((day) => (
                  <p
                    key={day.value}
                    className={`text-center text-[0.68rem] font-semibold uppercase tracking-wide ${
                      day.value === today ? 'text-accent' : 'text-faint'
                    }`}
                  >
                    {day.abbr}
                  </p>
                ))}
                {expandedRows.map((row) => (
                  <Fragment key={row.key}>
                    <div className="flex items-center justify-center rounded-2xl bg-elev px-2 py-2 text-center text-[0.68rem] font-semibold text-mute">
                      {row.label}
                    </div>
                    {DAYS.map((day) => {
                      const isToday = day.value === today
                      const who = scheduledStudents.filter((student) => {
                        const dias = daysByStudent.get(student.id) ?? []
                        if (!dias.includes(day.value)) return false
                        const horario = horariosByStudent.get(student.id)?.[day.value]
                        return row.key === 'sem-horario' ? !horario : horario === row.key
                      })
                      return (
                        <div
                          key={`${row.key}-${day.value}`}
                          className={`flex min-h-[56px] flex-col gap-1.5 rounded-2xl p-2 ${
                            isToday ? 'bg-accent-soft' : ''
                          }`}
                        >
                          {who.length === 0 ? (
                            <p className="mt-1 text-center text-xs text-faint opacity-40">—</p>
                          ) : (
                            who.map((student) => (
                              <span
                                key={student.id}
                                className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-left text-xs font-medium text-ink ${
                                  isToday ? 'bg-surface' : 'bg-elev'
                                }`}
                                title={student.name}
                              >
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#a855f7] to-[#6d28d9] text-[0.6rem] font-semibold text-white">
                                  {student.initials}
                                </span>
                                <span className="truncate">{student.name.split(' ')[0]}</span>
                              </span>
                            ))
                          )}
                        </div>
                      )
                    })}
                  </Fragment>
                ))}
              </button>
            </div>
          ) : (
            <div
              className="cursor-grab overflow-x-auto active:cursor-grabbing"
              onPointerCancel={endDrag}
              onPointerDown={onPointerDown}
              onPointerLeave={endDrag}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              ref={scrollRef}
            >
              <button
                aria-label="Abrir agenda semanal detalhada"
                className="grid w-full min-w-[560px] select-none grid-cols-7 gap-1.5 p-4 text-left"
                onClick={guardClick(() => setIsExpanded(true))}
                type="button"
              >
                {DAYS.map((day) => {
                  const isToday = day.value === today
                  const who = scheduledStudents.filter((student) =>
                    daysByStudent.get(student.id)?.includes(day.value),
                  )
                  return (
                    <div
                      key={day.value}
                      className={`flex min-h-[112px] flex-col gap-1.5 rounded-2xl p-2 ${
                        isToday ? 'bg-accent-soft' : ''
                      }`}
                    >
                      <p
                        className={`text-center text-[0.68rem] font-semibold uppercase tracking-wide ${
                          isToday ? 'text-accent' : 'text-faint'
                        }`}
                      >
                        {day.abbr}
                      </p>
                      {who.length === 0 ? (
                        <p className="mt-3 text-center text-xs text-faint opacity-60">—</p>
                      ) : (
                        who.map((student) => (
                          <span
                            key={student.id}
                            className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-left text-xs font-medium text-ink ${
                              isToday ? 'bg-surface' : 'bg-elev'
                            }`}
                            title={student.name}
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#a855f7] to-[#6d28d9] text-[0.6rem] font-semibold text-white">
                              {student.initials}
                            </span>
                            <span className="truncate">{student.name.split(' ')[0]}</span>
                          </span>
                        ))
                      )}
                    </div>
                  )
                })}
              </button>
            </div>
          )}

          <p className="border-t border-line px-4 pb-1 pt-3 text-xs uppercase tracking-[0.18em] text-faint">
            Agenda por aluno
          </p>

          <div className="divide-y divide-line">
            {scheduledStudents.length === 0 ? (
              <p className="px-4 py-4 text-xs text-faint">
                Nenhum aluno com agenda definida ainda.
              </p>
            ) : (
              scheduledStudents.map((student) => {
                const dias = daysByStudent.get(student.id) ?? []
                return (
                  <div key={student.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#a855f7] to-[#6d28d9] text-xs font-semibold text-white">
                      {student.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-ink">
                          {student.name}
                        </p>
                        <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[0.68rem] font-semibold text-accent">
                          {dias.length}x/semana
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-faint">
                        {DAYS.filter((day) => dias.includes(day.value))
                          .map((day) => day.abbr)
                          .join(' · ')}
                      </p>
                    </div>
                    <button
                      aria-label={`Editar dias de ${student.name.split(' ')[0]}`}
                      className="rounded-full p-1.5 text-faint transition hover:bg-elev hover:text-ink"
                      onClick={() => setEditingStudent(student)}
                      type="button"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      aria-label={`Remover agenda de ${student.name.split(' ')[0]}`}
                      className="rounded-full p-1.5 text-faint transition hover:bg-elev hover:text-rose-400 light:hover:text-rose-600"
                      onClick={() => handleRemove(student.id)}
                      type="button"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )
              })
            )}

            {unscheduledStudents.length > 0 ? (
              <div className="mx-4 my-3 divide-y divide-line rounded-2xl bg-elev">
                {unscheduledStudents.map((student) => (
                  <div key={student.id} className="flex items-center gap-3 px-3 py-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#a855f7] to-[#6d28d9] text-[0.65rem] font-semibold text-white opacity-60">
                      {student.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-mute">
                        {student.name}
                      </p>
                      <p className="text-xs text-faint">Sem agenda definida</p>
                    </div>
                    <button
                      className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-accent transition hover:bg-accent-soft"
                      onClick={() => setEditingStudent(student)}
                      type="button"
                    >
                      <Plus size={12} />
                      Definir dias
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </>
      )}

      {editingStudent ? (
        <EditScheduleModal
          errorMessage={saveError}
          initialDias={daysByStudent.get(editingStudent.id) ?? []}
          initialHorarios={horariosByStudent.get(editingStudent.id) ?? {}}
          isSaving={isSaving}
          onClose={() => {
            setSaveError('')
            setEditingStudent(null)
          }}
          onSave={handleSave}
          studentInitials={editingStudent.initials}
          studentName={editingStudent.name}
        />
      ) : null}
    </section>
  )
}
