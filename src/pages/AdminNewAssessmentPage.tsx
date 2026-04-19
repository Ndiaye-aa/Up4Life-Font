import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { AlertCircle, ArrowLeft, ChevronDown, ChevronUp, Save, Loader2 } from 'lucide-react'
import { DashboardShell } from '../components/layout/DashboardShell'
import { useAuth } from '../hooks/useAuth'
import { getDashboardNavItems } from '../utils/dashboardNav'
import { getStudentsService } from '../services/students'
import { createAssessmentService } from '../services/assessments'
import type { StudentRecord } from '../@types/student'
import { formatDateBR } from '../utils/formatDate'

const SECTIONS = (students: StudentRecord[]) => [
  {
    id: 'dados',
    title: 'Dados do Aluno',
    fields: [
      {
        id: 'alunoId',
        label: 'Aluno',
        type: 'select',
        options: students.map((s) => ({ label: s.nome, value: s.id.toString() })),
        colSpan: 'col-span-2 sm:col-span-4',
      },
      { id: 'date', label: 'Data da avaliação', type: 'date', colSpan: '' },
      { id: 'sexo', label: 'Sexo', type: 'select', options: [{ label: 'Feminino', value: 'F' }, { label: 'Masculino', value: 'M' }], colSpan: '' },
      { id: 'peso', label: 'Peso atual (kg)', type: 'number', placeholder: '70.5', colSpan: '' },
      { id: 'altura', label: 'Altura (m)', type: 'number', placeholder: '1.65', colSpan: '' },
      { id: 'idade', label: 'Idade (anos)', type: 'number', placeholder: '30', colSpan: '' },
    ],
  },
  {
    id: 'perimetros',
    title: 'Perímetros (cm)',
    fields: [
      { id: 'toraax', label: 'Tórax', type: 'number', placeholder: '95', colSpan: '' },
      { id: 'cintura', label: 'Cintura', type: 'number', placeholder: '75', colSpan: '' },
      { id: 'abdômen', label: 'Abdômen', type: 'number', placeholder: '80', colSpan: '' },
      { id: 'quadril', label: 'Quadril', type: 'number', placeholder: '95', colSpan: '' },
      { id: 'thigh_p', label: 'Coxa (D/E)', type: 'number', placeholder: '55', colSpan: '' },
      { id: 'calf', label: 'Panturrilha', type: 'number', placeholder: '36', colSpan: '' },
      { id: 'arm', label: 'Braço contraído', type: 'number', placeholder: '31', colSpan: '' },
      { id: 'forearm', label: 'Antebraço', type: 'number', placeholder: '24', colSpan: '' },
    ],
  },
  {
    id: 'dobras',
    title: 'Dobras Cutâneas (mm)',
    fields: [
      { id: 'triceps', label: 'Tríceps', type: 'number', placeholder: '12', colSpan: '' },
      { id: 'subescapular', label: 'Subescapular', type: 'number', placeholder: '14', colSpan: '' },
      { id: 'supraIliaca', label: 'Supra-ilíaca', type: 'number', placeholder: '16', colSpan: '' },
      { id: 'abdominal', label: 'Abdominal', type: 'number', placeholder: '20', colSpan: '' },
      { id: 'coxa', label: 'Coxa', type: 'number', placeholder: '18', colSpan: '' },
      { id: 'peitoral', label: 'Peitoral', type: 'number', placeholder: '10', colSpan: '' },
      { id: 'axilarMedia', label: 'Axilar Média', type: 'number', placeholder: '13', colSpan: '' },
    ],
  },
]

const positiveNum = (label: string) =>
  z
    .string()
    .min(1, `Informe ${label}`)
    .refine(
      (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0,
      `${label} inválido`,
    )

const assessmentSchema = z.object({
  // Dados
  idade: positiveNum('a idade'),
  date: z.string().min(1, 'Informe a data da avaliação'),
  altura: z
    .string()
    .min(1, 'Informe a altura')
    .refine(
      (v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0.5 && parseFloat(v) <= 3.0,
      'Informe a altura em metros (ex: 1.65)',
    ),
  peso: positiveNum('o peso'),
  alunoId: z.string().min(1, 'Selecione o aluno'),
  // Dobras
  abdominal: positiveNum('o valor'),
  axilarMedia: positiveNum('o valor'),
  peitoral: positiveNum('o valor'),
  subescapular: positiveNum('o valor'),
  supraIliaca: positiveNum('o valor'),
  coxa: positiveNum('o valor'),
  triceps: positiveNum('o valor'),
})

function getIMCStatus(imc: number): { color: string; label: string } {
  if (imc < 18.5) return { color: 'text-blue-600', label: 'Abaixo do peso' }
  if (imc < 25) return { color: 'text-emerald-600', label: 'Normal' }
  if (imc < 30) return { color: 'text-amber-600', label: 'Sobrepeso' }
  return { color: 'text-rose-600', label: 'Obesidade' }
}

function getBodyFatStatus(pct: number, sexo: string): { color: string; label: string } {
  if (sexo === 'M') {
    if (pct < 6) return { color: 'text-blue-600', label: 'Abaixo do ideal' }
    if (pct < 18) return { color: 'text-emerald-600', label: 'Adequado' }
    if (pct < 25) return { color: 'text-amber-600', label: 'Acima do ideal' }
    return { color: 'text-rose-600', label: 'Obesidade' }
  }
  if (pct < 14) return { color: 'text-blue-600', label: 'Abaixo do ideal' }
  if (pct < 25) return { color: 'text-emerald-600', label: 'Adequado' }
  if (pct < 32) return { color: 'text-amber-600', label: 'Acima do ideal' }
  return { color: 'text-rose-600', label: 'Obesidade' }
}

export const AdminNewAssessmentPage = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const [expanded, setExpanded] = useState<string[]>(['dados', 'perimetros', 'dobras'])
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({
    date: new Date().toISOString().split('T')[0],
    sexo: 'F',
  })
  const [observations, setObservations] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    getStudentsService()
      .then((data) => {
        setStudents(data)
        if (data.length > 0) {
          setValues((prev) => ({ ...prev, alunoId: data[0].id.toString() }))
        }
      })
      .finally(() => setIsLoadingStudents(false))
  }, [])

  const toggle = (id: string) =>
    setExpanded((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]))

  const handleChange = (id: string, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }))
    if (errors[id]) setErrors((prev) => { const next = { ...prev }; delete next[id]; return next })
  }

  const computed = useMemo(() => {
    const peso = parseFloat(values.peso)
    const altura = parseFloat(values.altura)
    const quadril = parseFloat(values.quadril)
    const sexo = values.sexo || 'F'
    const age = parseFloat(values.idade)

    const imc =
      !isNaN(peso) && !isNaN(altura) && altura > 0
        ? peso / Math.pow(altura, 2)
        : null

    const iac =
      !isNaN(quadril) && !isNaN(altura) && altura > 0
        ? quadril / Math.pow(altura, 1.5) - 18
        : null

    const triceps = parseFloat(values.triceps)
    const subscapular = parseFloat(values.subescapular)
    const suprailiac = parseFloat(values.supraIliaca)
    const abdominal = parseFloat(values.abdominal)
    const thigh = parseFloat(values.coxa)
    const chest = parseFloat(values.peitoral)
    const axillary = parseFloat(values.axilarMedia)

    let gordura: number | null = null
    const allFolds = [triceps, subscapular, suprailiac, abdominal, thigh, chest, axillary]
    if (!allFolds.some(isNaN) && !isNaN(age)) {
      const sum7 = allFolds.reduce((a, b) => a + b, 0)
      let D: number
      if (sexo === 'M') {
        D = 1.112 - 0.00043499 * sum7 + 0.00000055 * sum7 ** 2 - 0.00028826 * age
      } else {
        D = 1.097 - 0.00046971 * sum7 + 0.00000056 * sum7 ** 2 - 0.00012828 * age
      }
      gordura = (4.95 / D - 4.5) * 100
    }

    const massaMagra =
      gordura !== null && !isNaN(peso) ? peso * (1 - gordura / 100) : null

    return { gordura, iac, imc, massaMagra, sexo }
  }, [values])

  const imcStatus = computed.imc != null ? getIMCStatus(computed.imc) : null
  const fatStatus =
    computed.gordura != null ? getBodyFatStatus(computed.gordura, computed.sexo) : null

  const previewCards = [
    {
      bg: computed.imc != null ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-100',
      color: imcStatus?.color ?? 'text-gray-400',
      label: 'IMC',
      status: imcStatus?.label ?? '—',
      value: computed.imc != null ? computed.imc.toFixed(1) : '—',
    },
    {
      bg: computed.gordura != null ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-100',
      color: fatStatus?.color ?? 'text-gray-400',
      label: '% Gordura',
      status: fatStatus?.label ?? '—',
      value: computed.gordura != null ? `${computed.gordura.toFixed(1)}%` : '—',
    },
    {
      bg: computed.iac != null ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100',
      color: computed.iac != null ? 'text-blue-600' : 'text-gray-400',
      label: 'IAC',
      status: computed.iac != null ? 'Normal' : '—',
      value: computed.iac != null ? computed.iac.toFixed(1) : '—',
    },
    {
      bg: computed.massaMagra != null ? 'bg-purple-50 border-purple-100' : 'bg-gray-50 border-gray-100',
      color: computed.massaMagra != null ? 'text-purple-600' : 'text-gray-400',
      label: 'Massa Magra',
      status: computed.massaMagra != null ? 'Calculado' : '—',
      value: computed.massaMagra != null ? `${computed.massaMagra.toFixed(1)} kg` : '—',
    },
  ]

  const handleSave = async () => {
    const result = assessmentSchema.safeParse(values)

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)

      const sectionsWithErrors = SECTIONS(students)
        .filter((s) => s.fields.some((f) => fieldErrors[f.id]))
        .map((s) => s.id)
      setExpanded((prev) => [...new Set([...prev, ...sectionsWithErrors])])
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      const payload = {
        alunoId: parseInt(values.alunoId),
        peso: parseFloat(values.peso),
        altura: parseFloat(values.altura),
        idade: parseInt(values.idade),
        cintura: values.cintura ? parseFloat(values.cintura) : undefined,
        quadril: values.quadril ? parseFloat(values.quadril) : undefined,
        peitoral: values.peitoral ? parseFloat(values.peitoral) : undefined,
        axilarMedia: values.axilarMedia ? parseFloat(values.axilarMedia) : undefined,
        triceps: values.triceps ? parseFloat(values.triceps) : undefined,
        subescapular: values.subescapular ? parseFloat(values.subescapular) : undefined,
        abdominal: values.abdominal ? parseFloat(values.abdominal) : undefined,
        supraIliaca: values.supraIliaca ? parseFloat(values.supraIliaca) : undefined,
        coxa: values.coxa ? parseFloat(values.coxa) : undefined,
      }

      const assessment = await createAssessmentService(payload)
      const studentName = students.find((s) => s.id === assessment.alunoId)?.nome ?? 'Aluno'

      navigate('/dashboard/admin/avaliacoes/resultados', {
        state: {
          alunoId: assessment.alunoId,
          bmi: assessment.imc != null ? parseFloat(String(assessment.imc)).toFixed(1) : '—',
          bodyFat: assessment.percentualGordura != null ? `${parseFloat(String(assessment.percentualGordura)).toFixed(1)}%` : '—',
          date: formatDateBR(assessment.dataAvaliacao),
          iac: assessment.iac != null ? parseFloat(String(assessment.iac)).toFixed(1) : '—',
          massaMagra: computed.massaMagra?.toFixed(1) ?? '—',
          name: studentName,
          perimetros: {
            abdomen: values.abdômen,
            arm: values.arm,
            calf: values.calf,
            chest: values.toraax,
            forearm: values.forearm,
            hip: values.quadril,
            thigh: values.thigh_p,
            waist: values.cintura,
          },
          status: imcStatus?.label ?? 'Normal',
          weight: values.peso,
        },
      })
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Falha ao salvar avaliação')
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalErrors = Object.keys(errors).length

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
        { label: 'Mes', value: '8' },
        { label: 'Avaliados', value: '6' },
        { label: 'Pendentes', value: '4' },
      ]}
      roleLabel="Personal Trainer"
      subtitle="Preencha as medidas para calcular os indices de composicao corporal."
      tone="personal"
    >
      <div className="space-y-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            className="flex-shrink-0 rounded-xl p-2 text-gray-500 transition hover:bg-gray-100"
            onClick={() => navigate(-1)}
            type="button"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-sm uppercase tracking-[0.24em] text-[#7c3aed]">Nova</p>
            <h1 className="font-display text-2xl font-semibold text-stone-950">
              Nova Avaliação
            </h1>
            <p className="mt-0.5 text-xs text-stone-500">
              Insira as medidas para calcular os índices de composição corporal
            </p>
          </div>
        </div>

        {/* Global error banner */}
        {totalErrors > 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
            <AlertCircle className="flex-shrink-0 text-rose-500" size={16} />
            <p className="text-sm text-rose-700">
              {totalErrors === 1
                ? '1 campo obrigatório não preenchido.'
                : `${totalErrors} campos obrigatórios não preenchidos.`}
            </p>
          </div>
        )}

        {/* Preview cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {previewCards.map((card) => (
            <div
              key={card.label}
              className={`${card.bg} rounded-2xl border p-3 text-center transition-colors`}
            >
              <p className={`text-lg font-semibold ${card.color}`}>{card.value}</p>
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className={`mt-0.5 text-xs ${card.color}`}>{card.status}</p>
            </div>
          ))}
        </div>

        {/* Expandable sections */}
        <div className="space-y-3">
          {SECTIONS(students).map((section) => {
            const isOpen = expanded.includes(section.id)
            const sectionHasErrors = section.fields.some((f) => errors[f.id])

            return (
              <div
                key={section.id}
                className={`overflow-hidden rounded-[1.5rem] border bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-colors ${
                  sectionHasErrors ? 'border-rose-200' : 'border-[#e5e7eb]'
                }`}
              >
                <button
                  className="flex w-full items-center justify-between p-5 transition hover:bg-gray-50"
                  onClick={() => toggle(section.id)}
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-base font-semibold text-stone-950">
                      {section.title}
                    </h2>
                    {sectionHasErrors && (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600">
                        {section.fields.filter((f) => errors[f.id]).length} pendente
                        {section.fields.filter((f) => errors[f.id]).length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {isOpen ? (
                    <ChevronUp className="text-gray-400" size={18} />
                  ) : (
                    <ChevronDown className="text-gray-400" size={18} />
                  )}
                </button>

                {isOpen && (
                  <div className="border-t border-gray-50 px-5 pb-5">
                    <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-4">
                      {section.fields.map((field) => {
                        const hasError = Boolean(errors[field.id])
                        const inputClass = `w-full rounded-2xl border bg-gray-50 px-3 py-3 text-sm outline-none transition focus:bg-white focus:ring-4 ${
                          hasError
                            ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10'
                            : 'border-gray-200 focus:border-[#7c3aed] focus:ring-[#7c3aed]/10'
                        }`

                        return (
                          <div key={field.id} className={field.colSpan}>
                            <label className="mb-1.5 block text-xs font-medium text-stone-600">
                              {field.label}
                              <span className="ml-0.5 text-rose-400">*</span>
                            </label>
                            {field.type === 'select' ? (
                              <select
                                className={inputClass}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                value={values[field.id] ?? ''}
                              >
                                {field.options?.map((opt) => (
                                  <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
                                    {typeof opt === 'string' ? opt : opt.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                className={inputClass}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                placeholder={'placeholder' in field ? field.placeholder : undefined}
                                type={field.type}
                                value={values[field.id] ?? ''}
                              />
                            )}
                            {hasError && (
                              <p className="mt-1 text-xs text-rose-600">{errors[field.id]}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Observations (optional) */}
        <div className="overflow-hidden rounded-[1.5rem] border border-[#e5e7eb] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <h2 className="font-display mb-3 text-base font-semibold text-stone-950">
            Observações
            <span className="ml-2 text-xs font-normal text-stone-400">(opcional)</span>
          </h2>
          <textarea
            className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm outline-none transition focus:border-[#7c3aed] focus:bg-white focus:ring-4 focus:ring-[#7c3aed]/10"
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Observações gerais sobre a avaliação, condições do dia, etc..."
            rows={3}
            value={observations}
          />
        </div>

        {/* Save button */}
        <button
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-950 py-4 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
          disabled={isSubmitting || isLoadingStudents}
          onClick={handleSave}
          type="button"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          {isSubmitting ? 'Salvando...' : 'Calcular & Salvar Resultados'}
        </button>
      </div>
    </DashboardShell>
  )
}
