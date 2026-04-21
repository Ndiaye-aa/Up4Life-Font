import { AlertCircle, Calendar, ChevronRight, ClipboardList, Plus, User, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DashboardShell } from '../components/layout/DashboardShell'
import { useAuth } from '../hooks/useAuth'
import { getDashboardNavItems } from '../utils/dashboardNav'
import { getAllAssessmentsService, type AssessmentRecord } from '../services/assessments'
import { getStudentsService } from '../services/students'
import type { StudentRecord } from '../@types/student'
import { formatDateBR } from '../utils/formatDate'

const getBmiStatus = (imc?: number) => {
  if (!imc) return { className: 'bg-gray-100 text-gray-500', label: '—' }
  if (imc < 18.5) return { className: 'bg-blue-50 text-blue-600', label: 'Abaixo do peso' }
  if (imc < 25) return { className: 'bg-emerald-50 text-emerald-600', label: 'Normal' }
  if (imc < 30) return { className: 'bg-amber-50 text-amber-600', label: 'Sobrepeso' }
  return { className: 'bg-rose-50 text-rose-600', label: 'Obesidade' }
}

const buildInitials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('')

export const AdminAssessmentsPage = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const alunoId = searchParams.get('aluno') ? Number(searchParams.get('aluno')) : null

  const [assessments, setAssessments] = useState<AssessmentRecord[]>([])
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [as_, ss] = await Promise.all([
          getAllAssessmentsService(),
          getStudentsService(),
        ])
        setAssessments(as_)
        setStudents(ss)
      } catch (error) {
        setLoadError('Não foi possível carregar as avaliações. Tente novamente.')
        console.error('Erro ao carregar avaliacoes:', error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const studentMap = useMemo(
    () => new Map(students.map((s) => [s.id, s])),
    [students],
  )

  const displayAssessments = useMemo(() => {
    const filtered = alunoId
      ? assessments.filter((a) => a.alunoId === alunoId)
      : assessments

    return filtered
      .slice()
      .sort((a, b) => new Date(b.dataAvaliacao).getTime() - new Date(a.dataAvaliacao).getTime())
      .map((a) => {
        const student = studentMap.get(a.alunoId)
        const nome = student?.nome ?? `Aluno ${a.alunoId}`
        const bmiStatus = getBmiStatus(a.imc)
        const massaMagra = a.percentualGordura && a.peso
          ? (a.peso * (1 - a.percentualGordura / 100)).toFixed(1)
          : undefined
        return {
          alunoId: a.alunoId,
          bmi: a.imc != null ? a.imc.toFixed(1) : '—',
          bodyFat: a.percentualGordura != null ? `${a.percentualGordura.toFixed(1)}%` : '—',
          cintura: a.cintura,
          date: formatDateBR(a.dataAvaliacao),
          iac: a.iac != null ? a.iac.toFixed(1) : undefined,
          initials: buildInitials(nome),
          massaMagra,
          name: nome,
          perimetros: {
            abdomen: a.abdominal != null ? String(a.abdominal) : '',
            chest: a.peitoral != null ? String(a.peitoral) : '',
            hip: a.quadril != null ? String(a.quadril) : '',
            thigh: a.coxa != null ? String(a.coxa) : '',
            waist: a.cintura != null ? String(a.cintura) : '',
          },
          status: bmiStatus.label,
          statusClassName: bmiStatus.className,
          weight: a.peso != null ? String(a.peso) : undefined,
        }
      })
  }, [assessments, alunoId, studentMap])

  const activeStudentName = alunoId
    ? (displayAssessments[0]?.name ?? null)
    : null

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const stats = useMemo(() => {
    const thisMonth = assessments.filter((a) => {
      const d = new Date(a.dataAvaliacao)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    }).length

    const assessedStudentIds = new Set(assessments.map((a) => a.alunoId))
    const avaliados = assessedStudentIds.size
    const pendentes = Math.max(0, students.length - avaliados)

    return { avaliados, pendentes, thisMonth }
  }, [assessments, students, currentMonth, currentYear])

  return (
    <DashboardShell
      contact={user?.phone ?? ''}
      name={user?.name ?? 'Personal'}
      navItems={getDashboardNavItems('PERSONAL')}
      onLogout={() => {
        logout()
        navigate('/login')
      }}
      overviewItems={[
        { label: 'Mês', value: String(stats.thisMonth) },
        { label: 'Avaliados', value: String(stats.avaliados) },
        { label: 'Pendentes', value: String(stats.pendentes) },
      ]}
      roleLabel="Personal Trainer"
      subtitle="Historico consolidado para acompanhar composição corporal e próximas avaliações."
      tone="personal"
    >
      <div className="space-y-6">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-[#e5e7eb] bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.08)] sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[#7c3aed]">Avaliações</p>
            <h1 className="font-display mt-2 text-3xl font-semibold text-stone-950">
              Gestao de Avaliações
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
              Painel para consultar historico e abrir a leitura detalhada de cada aluno.
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-2xl bg-stone-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
            onClick={() => navigate('/dashboard/admin/avaliacoes/nova')}
            type="button"
          >
            <Plus size={16} />
            Nova avaliação
          </button>
        </section>
        <section className="grid grid-cols-3 gap-3">
          {[
            { bg: 'bg-purple-50', color: 'text-[#A020F0]', icon: ClipboardList, label: 'Este mês', value: String(stats.thisMonth) },
            { bg: 'bg-purple-50', color: 'text-[#A020F0]', icon: User, label: 'Avaliações', value: String(stats.avaliados) },
            { bg: 'bg-purple-50', color: 'text-[#A020F0]', icon: Calendar, label: 'Pendentes', value: String(stats.pendentes) },
          ].map((item) => (
            <article key={item.label} className="rounded-[1.5rem] border border-[#e5e7eb] bg-white p-4 shadow-[0_12px_36px_rgba(15,23,42,0.06)]">
              <div className={`${item.bg} mb-2 flex h-9 w-9 items-center justify-center rounded-xl`}>
                <item.icon className={item.color} size={15} />
              </div>
              <p className="text-2xl font-semibold text-stone-950">{item.value}</p>
              <p className="mt-1 text-xs text-stone-500">{item.label}</p>
            </article>
          ))}
        </section>

        {loadError ? (
          <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle size={16} />
            {loadError}
          </div>
        ) : null}

        <section className="rounded-[2rem] border border-[#e5e7eb] bg-white shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between border-b border-gray-100 p-4">
            <h2 className="font-display text-2xl font-semibold text-stone-950">Avaliações Recentes</h2>
            {activeStudentName ? (
              <div className="flex items-center gap-2 rounded-full bg-purple-50 py-1 pl-3 pr-1.5 text-xs font-medium text-[#7c3aed]">
                {activeStudentName.split(' ')[0]}
                <button
                  className="flex h-5 w-5 items-center justify-center rounded-full transition hover:bg-purple-100"
                  onClick={() => setSearchParams({})}
                  type="button"
                >
                  <X size={12} />
                </button>
              </div>
            ) : null}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#7c3aed] border-t-transparent" />
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {displayAssessments.length > 0 ? displayAssessments.map((assessment) => (
                <button
                  key={`${assessment.alunoId}-${assessment.date}`}
                  className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-gray-50"
                  onClick={() =>
                    navigate('/dashboard/admin/avaliacoes/resultados', {
                      state: {
                        alunoId: assessment.alunoId,
                        bmi: assessment.bmi,
                        bodyFat: assessment.bodyFat,
                        date: assessment.date,
                        iac: assessment.iac,
                        massaMagra: assessment.massaMagra,
                        name: assessment.name,
                        perimetros: assessment.perimetros,
                        status: assessment.status,
                        weight: assessment.weight,
                      },
                    })
                  }
                  type="button"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#a855f7] to-[#6d28d9] text-sm text-white">
                    {assessment.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-stone-950">{assessment.name}</p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-400">
                      <Calendar size={11} />
                      {assessment.date}
                    </div>
                  </div>
                  <div className="hidden gap-4 sm:flex">
                    <div className="text-center">
                      <p className="text-sm text-stone-950">{assessment.bmi}</p>
                      <p className="text-xs text-stone-400">IMC</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-stone-950">{assessment.bodyFat}</p>
                      <p className="text-xs text-stone-400">Gordura</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs ${assessment.statusClassName}`}>
                    {assessment.status}
                  </span>
                  <ChevronRight className="text-gray-300" size={16} />
                </button>
              )) : (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm font-medium text-stone-700">Nenhuma avaliação encontrada.</p>
                  <p className="mt-1 text-xs text-stone-400">Este aluno ainda nao possui avaliações registradas.</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  )
}
