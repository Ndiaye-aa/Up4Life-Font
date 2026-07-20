import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { CreateStudentPayload, StudentRecord } from '../../../@types/student'
import { createStudentService } from '../../../services/students'
import { formatPhone } from '../../../utils/formatPhone'

const newStudentSchema = z.object({
  historicoSaude: z.string().max(600, 'Use no máximo 600 caracteres.').optional(),
  nascimento: z.string().optional(),
  nome: z
    .string()
    .min(3, 'Informe o nome completo do aluno.')
    .max(50, 'O nome deve ter no máximo 50 caracteres.'),
  sexo: z.enum(['M', 'F']).optional().nullable(),
  telefone: z
    .string()
    .refine(
      (value) => value.replace(/\D/g, '').length >= 10,
      'Informe um telefone válido.',
    )
    .refine(
      (value) => value.replace(/\D/g, '').length <= 11,
      'O telefone deve ter no máximo 11 dígitos.',
    ),
})

const DEFAULT_STUDENT_PASSWORD = '123456'

type NewStudentFormValues = z.infer<typeof newStudentSchema>

const maskDate = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

interface NewStudentModalProps {
  idPersonal: number
  onClose: () => void
  onCreated: (student: StudentRecord) => void
}

export const NewStudentModal = ({
  onClose,
  onCreated,
}: NewStudentModalProps) => {
  const [submitError, setSubmitError] = useState('')
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<NewStudentFormValues>({
    defaultValues: {
      historicoSaude: '',
      nascimento: '',
      nome: '',
      sexo: null,
      telefone: '',
    },
    resolver: zodResolver(newStudentSchema),
  })

  const telefoneRegistration = register('telefone')
  const nascimentoRegistration = register('nascimento')

  const onSubmit = async (values: NewStudentFormValues) => {
    setSubmitError('')

    try {
      const nascimentoISO = values.nascimento
        ? values.nascimento.split('/').reverse().join('-')
        : undefined

      const payload: CreateStudentPayload = {
        historicoSaude: values.historicoSaude?.trim() || undefined,
        nascimento: nascimentoISO,
        nome: values.nome,
        sexo: values.sexo ?? undefined,
        telefone: values.telefone.replace(/\D/g, ''),
        senha: DEFAULT_STUDENT_PASSWORD,
      }

      const createdStudent = await createStudentService(payload)
      onCreated(createdStudent)
      onClose()
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Não foi possível cadastrar o aluno agora.',
      )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative flex max-h-[90vh] w-full flex-col rounded-t-[2rem] border border-line bg-surface shadow-2xl sm:max-w-2xl sm:rounded-[2rem]">
        <div className="flex items-start justify-between gap-4 border-b border-line p-5">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-accent">
              Cadastro
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-ink">
              Novo aluno
            </h2>
            <p className="mt-1 text-sm leading-6 text-mute">
              Formulário aderente a tabela `aluno`, incluindo vinculo ao personal logado.
            </p>
          </div>
          <button
            className="rounded-xl p-2 text-faint transition hover:bg-elev hover:text-ink"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <form
          className="flex-1 overflow-y-auto p-5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 sm:col-span-2">
              <span className="text-sm font-medium text-ink">Nome completo</span>
              <input
                className="field rounded-2xl py-3.5"
                placeholder="Nome do aluno"
                {...register('nome')}
              />
              {errors.nome ? (
                <span className="text-sm text-rose-400 light:text-rose-600">{errors.nome.message}</span>
              ) : null}
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink">Telefone</span>
              <input
                className="field rounded-2xl py-3.5"
                placeholder="(65) 99999-9999"
                type="tel"
                {...telefoneRegistration}
                onChange={(event) => {
                  event.target.value = formatPhone(event.target.value)
                  telefoneRegistration.onChange(event)
                }}
              />
              {errors.telefone ? (
                <span className="text-sm text-rose-400 light:text-rose-600">{errors.telefone.message}</span>
              ) : null}
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink">Sexo</span>
              <select
                className="field rounded-2xl py-3.5"
                {...register('sexo')}
              >
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
              {errors.sexo ? (
                <span className="text-sm text-rose-400 light:text-rose-600">{errors.sexo.message}</span>
              ) : null}
            </label>

            <label className="block space-y-2 sm:col-span-2">
              <span className="text-sm font-medium text-ink">Nascimento</span>
              <input
                className="field rounded-2xl py-3.5"
                placeholder="DD/MM/AAAA"
                type="text"
                {...nascimentoRegistration}
                onChange={(event) => {
                  event.target.value = maskDate(event.target.value)
                  nascimentoRegistration.onChange(event)
                }}
              />
              {errors.nascimento ? (
                <span className="text-sm text-rose-400 light:text-rose-600">{errors.nascimento.message}</span>
              ) : null}
            </label>

            <label className="block space-y-2 sm:col-span-2">
              <span className="text-sm font-medium text-ink">Historico de saude</span>
              <textarea
                className="field min-h-28 resize-none rounded-2xl py-3.5"
                placeholder="Lesoes, restricoes, observacoes clinicas ou contexto relevante."
                {...register('historicoSaude')}
              />
              {errors.historicoSaude ? (
                <span className="text-sm text-rose-400 light:text-rose-600">
                  {errors.historicoSaude.message}
                </span>
              ) : (
                <span className="text-sm text-mute">
                  
                </span>
              )}
            </label>
          </div>

          <p className="mt-4 rounded-2xl bg-elev px-4 py-3 text-sm text-mute">
            A senha inicial do aluno será <span className="font-semibold text-ink">123456</span>.
            Ele poderá alterá-la depois no próprio perfil.
          </p>

          {submitError ? (
            <div className="mt-4 text-sm text-rose-400 light:text-rose-600">
              {submitError}
            </div>
          ) : null}

          <div className="mt-5 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
            <button
              className="rounded-2xl border border-line px-4 py-3 text-sm font-medium text-ink transition hover:bg-elev"
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="btn-primary"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Cadastrando...' : 'Cadastrar aluno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
