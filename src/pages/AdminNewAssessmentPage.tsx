import { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { AlertCircle, ArrowLeft, ChevronDown, ChevronUp, Save, Loader2 } from 'lucide-react'
import { DashboardShell } from '../components/layout/DashboardShell'
import { useAuth } from '../hooks/useAuth'
import { getDashboardNavItems } from '../utils/dashboardNav'
import { createAssessmentService } from '../services/assessments'
import { useStudents } from '../hooks/useStudents'
import { useAssessments, invalidateAssessments } from '../hooks/useAssessments'
import type { StudentRecord } from '../@types/student'
import { formatDateBR, todayBR } from '../utils/formatDate'
import { STATUS_COLORS, calcMassaMagra, getBodyFatStatus, getImcStatus } from '../utils/bodyMetrics'

const SECTIONS = (students: StudentRecord[], personalName?: string) => [
  {
    id: 'dados',
    title: 'Dados do Aluno',
    fields: [
      {
        id: 'alunoId',
        label: 'Aluno',
        type: 'select',
        options: [
          { label: `Eu mesmo (${personalName ?? 'personal'})`, value: 'self' },
          ...students.map((s) => ({ label: s.nome, value: s.id.toString() })),
        ],
        colSpan: 'col-span-2 sm:col-span-4',
      },
      { id: 'date', label: 'Data da avaliação', type: 'text', placeholder: 'DD/MM/AAAA', colSpan: '' },
      { id: 'sexo', label: 'Sexo', type: 'select', options: [{ label: 'Feminino', value: 'F' }, { label: 'Masculino', value: 'M' }], colSpan: '' },
      { id: 'peso', label: 'Peso atual (kg)', type: 'number', placeholder: '0', colSpan: '' },
      { id: 'altura', label: 'Altura (cm)', type: 'number', placeholder: '0', colSpan: '' },
      { id: 'idade', label: 'Idade (anos)', type: 'number', placeholder: '0', colSpan: '' },
    ],
  },
  {
    id: 'perimetros',
    title: 'Perímetros (cm)',
    fields: [
      { id: 'torax', label: 'Tórax', type: 'number', placeholder: '0', colSpan: '', required: false },
      { id: 'cintura', label: 'Cintura', type: 'number', placeholder: '0', colSpan: '', required: false },
      { id: 'abdomen', label: 'Abdômen', type: 'number', placeholder: '0', colSpan: '', required: false },
      { id: 'quadril', label: 'Quadril', type: 'number', placeholder: '0', colSpan: '', required: false },
      { id: 'thigh', label: 'Coxa (D/E)', type: 'number', placeholder: '0', colSpan: '', required: false },
      { id: 'calf', label: 'Panturrilha', type: 'number', placeholder: '0', colSpan: '', required: false },
      { id: 'arm', label: 'Braço contraído', type: 'number', placeholder: '0', colSpan: '', required: false },
      { id: 'forearm', label: 'Antebraço', type: 'number', placeholder: '0', colSpan: '', required: false },
    ],
  },
  {
    id: 'dobras',
    title: 'Dobras Cutâneas (mm)',
    fields: [
      { id: 'triceps', label: 'Tríceps', type: 'number', placeholder: '0', colSpan: '' },
      { id: 'subescapular', label: 'Subescapular', type: 'number', placeholder: '0', colSpan: '' },
      { id: 'supraIliaca', label: 'Supra-ilíaca', type: 'number', placeholder: '0', colSpan: '' },
      { id: 'abdominal', label: 'Abdominal', type: 'number', placeholder: '0', colSpan: '' },
      { id: 'coxa', label: 'Coxa', type: 'number', placeholder: '0', colSpan: '' },
      { id: 'peitoral', label: 'Peitoral', type: 'number', placeholder: '0', colSpan: '' },
      { id: 'axilarMedia', label: 'Axilar Média', type: 'number', placeholder: '0', colSpan: '' },
    ],
  },
  {
    id: 'anamnese',
    title: 'Anamnese',
    fields: [
      { id: 'praticaAtividadeFisica', label: 'Pratica atividade física atualmente?', type: 'select', options: SIM_NAO_OPTIONS, colSpan: '', required: false },
      { id: 'fumante', label: 'Fumante?', type: 'select', options: SIM_NAO_OPTIONS, colSpan: '', required: false },
      { id: 'consomeAlcool', label: 'Consome bebida alcoólica?', type: 'select', options: SIM_NAO_OPTIONS, colSpan: '', required: false },
      { id: 'historicoCardiovascularFamiliar', label: 'Histórico familiar cardiovascular?', type: 'select', options: SIM_NAO_OPTIONS, colSpan: '', required: false },
      { id: 'possuiDoencaDiagnosticada', label: 'Possui doença diagnosticada?', type: 'select', options: SIM_NAO_OPTIONS, colSpan: '', required: false },
      { id: 'doencaDescricao', label: 'Qual doença?', type: 'text', placeholder: 'Descreva a doença', colSpan: 'col-span-2 sm:col-span-3', required: false },
      { id: 'usaMedicamentoContinuo', label: 'Usa medicamento contínuo?', type: 'select', options: SIM_NAO_OPTIONS, colSpan: '', required: false },
      { id: 'medicamentoDescricao', label: 'Qual medicamento?', type: 'text', placeholder: 'Descreva o medicamento', colSpan: 'col-span-2 sm:col-span-3', required: false },
      { id: 'possuiLesaoOuCirurgia', label: 'Possui lesão ou cirurgia prévia?', type: 'select', options: SIM_NAO_OPTIONS, colSpan: '', required: false },
      { id: 'lesaoDescricao', label: 'Qual lesão/cirurgia?', type: 'text', placeholder: 'Descreva a lesão ou cirurgia', colSpan: 'col-span-2 sm:col-span-3', required: false },
      { id: 'dorArticularOuMuscular', label: 'Sente dor articular ou muscular atualmente?', type: 'select', options: SIM_NAO_OPTIONS, colSpan: '', required: false },
      { id: 'dorDescricao', label: 'Onde dói?', type: 'text', placeholder: 'Descreva o local da dor', colSpan: 'col-span-2 sm:col-span-3', required: false },
      { id: 'objetivoTreino', label: 'Objetivo com o treino', type: 'text', placeholder: 'Ex: emagrecimento, hipertrofia, condicionamento...', colSpan: 'col-span-2 sm:col-span-4', required: false },
    ],
  },
]

const SIM_NAO_OPTIONS = [
  { label: 'Não informado', value: '' },
  { label: 'Sim', value: 'true' },
  { label: 'Não', value: 'false' },
]

const positiveNum = (label: string) =>
  z
    .string()
    .min(1, `Informe ${label}`)
    .refine(
      (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0,
      `${label} inválido`,
    )

const optionalPositiveNum = () =>
  z
    .string()
    .optional()
    .refine(
      (v) => !v || (!isNaN(parseFloat(v)) && parseFloat(v) > 0),
      'Valor inválido',
    )

const assessmentSchema = z.object({
  // Dados
  idade: positiveNum('a idade'),
  date: z.string().min(1, 'Informe a data da avaliação'),
  altura: z
    .string()
    .min(1, 'Informe a altura')
    .refine(
      (v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 50 && parseFloat(v) <= 250,
      'Informe a altura em centímetros (ex: 165)',
    ),
  peso: positiveNum('o peso'),
  alunoId: z.string().min(1, 'Selecione o aluno'),
  // Perímetros (opcionais no backend — só validamos que, se preenchidos, sejam números válidos)
  torax: optionalPositiveNum(),
  cintura: optionalPositiveNum(),
  abdomen: optionalPositiveNum(),
  quadril: optionalPositiveNum(),
  thigh: optionalPositiveNum(),
  calf: optionalPositiveNum(),
  arm: optionalPositiveNum(),
  forearm: optionalPositiveNum(),
  // Dobras
  abdominal: positiveNum('o valor'),
  axilarMedia: positiveNum('o valor'),
  peitoral: positiveNum('o valor'),
  subescapular: positiveNum('o valor'),
  supraIliaca: positiveNum('o valor'),
  coxa: positiveNum('o valor'),
  triceps: positiveNum('o valor'),
})

const parseSimNao = (value: string | undefined): boolean | undefined =>
  value === 'true' ? true : value === 'false' ? false : undefined

const maskDate = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export const AdminNewAssessmentPage = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const [expanded, setExpanded] = useState<string[]>(['dados', 'perimetros', 'dobras'])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({
    date: todayBR(),
    sexo: 'F',
  })
  const [observations, setObservations] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: studentsData, isLoading: isLoadingStudents } = useStudents(user?.id)
  const { data: assessmentsData } = useAssessments(user?.id)
  const students: StudentRecord[] = studentsData ?? []
  const assessments = assessmentsData ?? []

  // Preenche aluno/sexo padrão uma única vez, quando a lista de alunos chega pela primeira vez.
  const hasSetDefaultAluno = useRef(false)
  useEffect(() => {
    if (hasSetDefaultAluno.current || studentsData == null) return
    hasSetDefaultAluno.current = true

    if (studentsData.length > 0) {
      setValues((prev) => ({
        ...prev,
        alunoId: studentsData[0].id.toString(),
        sexo: studentsData[0].sexo ?? prev.sexo,
      }))
    } else {
      setValues((prev) => ({ ...prev, alunoId: 'self' }))
    }
  }, [studentsData])

  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = assessments.filter((a) => {
      const d = new Date(a.dataAvaliacao)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length

    const avaliados = new Set(
      assessments.filter((a) => a.alunoId != null).map((a) => a.alunoId),
    ).size
    const pendentes = Math.max(0, students.length - avaliados)

    return { avaliados, pendentes, thisMonth }
  }, [assessments, students])

  const toggle = (id: string) =>
    setExpanded((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]))

  const handleChange = (id: string, value: string) => {
    const masked = id === 'date' ? maskDate(value) : value
    setValues((prev) => {
      const next = { ...prev, [id]: masked }
      if (id === 'alunoId') {
        const sexo = students.find((s) => s.id.toString() === value)?.sexo
        if (sexo) next.sexo = sexo
      }
      return next
    })
    if (errors[id]) setErrors((prev) => { const next = { ...prev }; delete next[id]; return next })
  }

  const computed = useMemo(() => {
    const peso = parseFloat(values.peso)
    const alturaCm = parseFloat(values.altura)
    const alturaM = alturaCm / 100
    const quadril = parseFloat(values.quadril)
    const sexo = values.sexo || 'F'
    const age = parseFloat(values.idade)

    const imc =
      !isNaN(peso) && !isNaN(alturaCm) && alturaCm > 0
        ? peso / Math.pow(alturaM, 2)
        : null

    const iac =
      !isNaN(quadril) && !isNaN(alturaCm) && alturaCm > 0
        ? quadril / Math.pow(alturaM, 1.5) - 18
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

    const massaMagra = calcMassaMagra(isNaN(peso) ? null : peso, gordura)

    return { gordura, iac, imc, massaMagra, sexo }
  }, [values])

  const imcStatus = computed.imc != null ? getImcStatus(computed.imc) : null
  const fatStatus =
    computed.gordura != null ? getBodyFatStatus(computed.gordura, computed.sexo) : null

  const previewCards = [
    {
      color: imcStatus?.color ?? 'text-faint',
      label: 'IMC',
      status: imcStatus?.label ?? '—',
      value: computed.imc != null ? computed.imc.toFixed(1) : '—',
    },
    {
      color: fatStatus?.color ?? 'text-faint',
      label: '% Gordura',
      status: fatStatus?.label ?? '—',
      value: computed.gordura != null ? `${computed.gordura.toFixed(1)}%` : '—',
    },
    {
      color: computed.iac != null ? STATUS_COLORS.blue : 'text-faint',
      label: 'IAC',
      status: computed.iac != null ? 'Normal' : '—',
      value: computed.iac != null ? computed.iac.toFixed(1) : '—',
    },
    {
      color: computed.massaMagra != null ? 'text-accent' : 'text-faint',
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

      const sectionsWithErrors = SECTIONS(students, user?.name)
        .filter((s) => s.fields.some((f) => fieldErrors[f.id]))
        .map((s) => s.id)
      setExpanded((prev) => [...new Set([...prev, ...sectionsWithErrors])])
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      const isSelf = values.alunoId === 'self'
      const payload = {
        ...(isSelf
          ? { paraMim: true, sexo: (values.sexo || 'F') as 'M' | 'F' }
          : { alunoId: parseInt(values.alunoId, 10) }),
        peso: parseFloat(values.peso),
        altura: parseFloat(values.altura) / 100,
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
        perimetroTorax: values.torax ? parseFloat(values.torax) : undefined,
        perimetroAbdomen: values.abdomen ? parseFloat(values.abdomen) : undefined,
        perimetroCoxa: values.thigh ? parseFloat(values.thigh) : undefined,
        perimetroPanturrilha: values.calf ? parseFloat(values.calf) : undefined,
        perimetroBraco: values.arm ? parseFloat(values.arm) : undefined,
        perimetroAntebraco: values.forearm ? parseFloat(values.forearm) : undefined,
        praticaAtividadeFisica: parseSimNao(values.praticaAtividadeFisica),
        fumante: parseSimNao(values.fumante),
        consomeAlcool: parseSimNao(values.consomeAlcool),
        possuiDoencaDiagnosticada: parseSimNao(values.possuiDoencaDiagnosticada),
        doencaDescricao: values.doencaDescricao || undefined,
        usaMedicamentoContinuo: parseSimNao(values.usaMedicamentoContinuo),
        medicamentoDescricao: values.medicamentoDescricao || undefined,
        possuiLesaoOuCirurgia: parseSimNao(values.possuiLesaoOuCirurgia),
        lesaoDescricao: values.lesaoDescricao || undefined,
        dorArticularOuMuscular: parseSimNao(values.dorArticularOuMuscular),
        dorDescricao: values.dorDescricao || undefined,
        historicoCardiovascularFamiliar: parseSimNao(values.historicoCardiovascularFamiliar),
        objetivoTreino: values.objetivoTreino || undefined,
        observacoesAnamnese: observations || undefined,
      }

      const assessment = await createAssessmentService(payload)
      await invalidateAssessments()
      const studentName =
        assessment.alunoId == null
          ? (user?.name ?? 'Você')
          : (students.find((s) => s.id === assessment.alunoId)?.nome ?? 'Aluno')

      navigate('/dashboard/admin/avaliacoes/resultados', {
        state: {
          alunoId: assessment.alunoId ?? undefined,
          bmi: assessment.imc != null ? parseFloat(String(assessment.imc)).toFixed(1) : '—',
          bodyFat: assessment.percentualGordura != null ? `${parseFloat(String(assessment.percentualGordura)).toFixed(1)}%` : '—',
          date: formatDateBR(assessment.dataAvaliacao),
          iac: assessment.iac != null ? parseFloat(String(assessment.iac)).toFixed(1) : '—',
          massaMagra: computed.massaMagra?.toFixed(1) ?? '—',
          name: studentName,
          perimetros: {
            abdomen: values.abdomen,
            arm: values.arm,
            calf: values.calf,
            chest: values.torax,
            forearm: values.forearm,
            hip: values.quadril,
            thigh: values.thigh,
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
      navItems={getDashboardNavItems()}
      onLogout={() => {
        logout()
        navigate('/login')
      }}
      overviewItems={[
        { label: 'Mes', value: String(stats.thisMonth) },
        { label: 'Avaliados', value: String(stats.avaliados) },
        { label: 'Pendentes', value: String(stats.pendentes) },
      ]}
      roleLabel="Personal Trainer"
      tone="personal"
    >
      <div className="space-y-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            className="flex-shrink-0 rounded-xl p-2 text-mute transition hover:bg-elev"
            onClick={() => navigate(-1)}
            type="button"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-sm uppercase tracking-[0.24em] text-accent">Nova</p>
            <h1 className="font-display text-2xl font-semibold text-ink">
              Nova Avaliação
            </h1>
            <p className="mt-0.5 text-xs text-mute">
              Insira as medidas para calcular os índices de composição corporal
            </p>
          </div>
        </div>

        {/* Global error banner */}
        {totalErrors > 0 && (
          <p className="flex items-center gap-2 text-sm text-rose-400 light:text-rose-600">
            <AlertCircle className="flex-shrink-0" size={16} />
            {totalErrors === 1
              ? '1 campo obrigatório não preenchido.'
              : `${totalErrors} campos obrigatórios não preenchidos.`}
          </p>
        )}

        {/* Preview: indices calculados em uma unica faixa */}
        <div className="card grid grid-cols-2 lg:grid-cols-4">
          {previewCards.map((card) => (
            <div key={card.label} className="p-3 text-center">
              <p className={`text-lg font-semibold ${card.color}`}>{card.value}</p>
              <p className="text-xs text-mute">{card.label}</p>
              <p className={`mt-0.5 text-xs ${card.color}`}>{card.status}</p>
            </div>
          ))}
        </div>

        {/* Secoes do formulario em um unico cartao */}
        <div className="card divide-y divide-line overflow-hidden">
          {SECTIONS(students, user?.name).map((section) => {
            const isOpen = expanded.includes(section.id)
            const sectionHasErrors = section.fields.some((f) => errors[f.id])

            return (
              <div key={section.id}>
                <button
                  className="flex w-full items-center justify-between p-5 transition hover:bg-elev"
                  onClick={() => toggle(section.id)}
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-base font-semibold text-ink">
                      {section.title}
                    </h2>
                    {sectionHasErrors && (
                      <span className="rounded-full bg-rose-500/12 px-2 py-0.5 text-xs font-medium text-rose-400 light:bg-rose-100 light:text-rose-600">
                        {section.fields.filter((f) => errors[f.id]).length} pendente
                        {section.fields.filter((f) => errors[f.id]).length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {isOpen ? (
                    <ChevronUp className="text-faint" size={18} />
                  ) : (
                    <ChevronDown className="text-faint" size={18} />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5">
                    <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-4">
                      {section.fields.map((field) => {
                        const hasError = Boolean(errors[field.id])
                        const inputClass = `w-full rounded-2xl border bg-elev px-3 py-3 text-sm text-ink outline-none transition focus:bg-surface focus:ring-4 ${
                          hasError
                            ? 'border-rose-400/60 focus:border-rose-400 focus:ring-rose-500/10'
                            : 'border-line focus:border-accent focus:ring-accent/15'
                        }`

                        return (
                          <div key={field.id} className={field.colSpan}>
                            <label className="mb-1.5 block text-xs font-medium text-mute">
                              {field.label}
                              {('required' in field ? field.required : true) && (
                                <span className="ml-0.5 text-rose-400">*</span>
                              )}
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
                              <p className="mt-1 text-xs text-rose-400 light:text-rose-600">{errors[field.id]}</p>
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

          {/* Observacoes (opcional) na mesma superficie */}
          <div className="p-5">
            <h2 className="font-display mb-3 text-base font-semibold text-ink">
              Observações
              <span className="ml-2 text-xs font-normal text-faint">(opcional)</span>
            </h2>
            <textarea
              className="field resize-none rounded-2xl"
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Observações gerais sobre a avaliação, condições do dia, etc..."
              rows={3}
              value={observations}
            />
          </div>
        </div>

        {/* Save button */}
        <button
          className="btn-primary w-full py-4"
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
