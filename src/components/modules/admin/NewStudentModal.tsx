import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { CreateStudentPayload, StudentRecord } from '../../../@types/student'
import { createStudentService } from '../../../services/students'

const newStudentSchema = z.object({
  historicoSaude: z.string().max(600, 'Use no maximo 600 caracteres.').optional(),
  nascimento: z.string().optional(),
  nome: z
    .string()
    .min(3, 'Informe o nome completo do aluno.')
    .max(50, 'O nome deve ter no maximo 50 caracteres.'),
  sexo: z.enum(['M', 'F']).optional().nullable(),
  telefone: z
    .string()
    .refine(
      (value) => value.replace(/\D/g, '').length >= 10,
      'Informe um telefone valido.',
    )
    .refine(
      (value) => value.replace(/\D/g, '').length <= 11,
      'O telefone deve ter no maximo 11 digitos.',
    ),
  senha: z.string().min(6, 'A senha deve ter no minimo 6 caracteres.'),
})

type NewStudentFormValues = z.infer<typeof newStudentSchema>

const maskDate = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 2) {
    return digits ? `(${digits}` : ''
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
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
      senha: '123456',
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
        senha: values.senha,
      }

      const createdStudent = await createStudentService(payload)
      onCreated(createdStudent)
      onClose()
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel cadastrar o aluno agora.',
      )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center">
      <div className="flex max-h-[90vh] w-full flex-col rounded-t-[2rem] bg-white shadow-2xl sm:max-w-2xl sm:rounded-[2rem]">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[#7c3aed]">
              Cadastro
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-stone-950">
              Novo aluno
            </h2>
            <p className="mt-1 text-sm leading-6 text-stone-500">
              Formulario aderente a tabela `aluno`, incluindo vinculo ao personal logado.
            </p>
          </div>
          <button
            className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
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
              <span className="text-sm font-medium text-stone-700">Nome completo</span>
              <input
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-[#7c3aed] focus:bg-white focus:ring-4 focus:ring-[#7c3aed]/10"
                placeholder="Nome do aluno"
                {...register('nome')}
              />
              {errors.nome ? (
                <span className="text-sm text-rose-600">{errors.nome.message}</span>
              ) : null}
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-700">Telefone</span>
              <input
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-[#7c3aed] focus:bg-white focus:ring-4 focus:ring-[#7c3aed]/10"
                placeholder="(65) 99999-9999"
                type="tel"
                {...telefoneRegistration}
                onChange={(event) => {
                  event.target.value = formatPhone(event.target.value)
                  telefoneRegistration.onChange(event)
                }}
              />
              {errors.telefone ? (
                <span className="text-sm text-rose-600">{errors.telefone.message}</span>
              ) : null}
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-700">Sexo</span>
              <select
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-[#7c3aed] focus:bg-white focus:ring-4 focus:ring-[#7c3aed]/10"
                {...register('sexo')}
              >
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
              {errors.sexo ? (
                <span className="text-sm text-rose-600">{errors.sexo.message}</span>
              ) : null}
            </label>

            <label className="block space-y-2 sm:col-span-2">
              <span className="text-sm font-medium text-stone-700">Nascimento</span>
              <input
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-[#7c3aed] focus:bg-white focus:ring-4 focus:ring-[#7c3aed]/10"
                placeholder="DD/MM/AAAA"
                type="text"
                {...nascimentoRegistration}
                onChange={(event) => {
                  event.target.value = maskDate(event.target.value)
                  nascimentoRegistration.onChange(event)
                }}
              />
              {errors.nascimento ? (
                <span className="text-sm text-rose-600">{errors.nascimento.message}</span>
              ) : null}
            </label>

            <label className="block space-y-2 sm:col-span-2">
              <span className="text-sm font-medium text-stone-700">Senha de acesso</span>
              <input
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-[#7c3aed] focus:bg-white focus:ring-4 focus:ring-[#7c3aed]/10"
                placeholder="Senha para o aluno"
                type="password"
                {...register('senha')}
              />
              {errors.senha ? (
                <span className="text-sm text-rose-600">{errors.senha.message}</span>
              ) : (
                <span className="text-sm text-stone-500">
                  Defina uma senha inicial para o aluno.
                </span>
              )}
            </label>

            <label className="block space-y-2 sm:col-span-2">
              <span className="text-sm font-medium text-stone-700">Historico de saude</span>
              <textarea
                className="min-h-28 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-[#7c3aed] focus:bg-white focus:ring-4 focus:ring-[#7c3aed]/10"
                placeholder="Lesoes, restricoes, observacoes clinicas ou contexto relevante."
                {...register('historicoSaude')}
              />
              {errors.historicoSaude ? (
                <span className="text-sm text-rose-600">
                  {errors.historicoSaude.message}
                </span>
              ) : (
                <span className="text-sm text-stone-500">
                  O `personalId` sera vinculado automaticamente pelo backend.
                </span>
              )}
            </label>
          </div>

          {submitError ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {submitError}
            </div>
          ) : null}

          <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-gray-50"
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="rounded-2xl bg-stone-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
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
