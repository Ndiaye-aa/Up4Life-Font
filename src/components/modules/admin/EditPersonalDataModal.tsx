import { zodResolver } from '@hookform/resolvers/zod'
import { Save, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAuth } from '../../../hooks/useAuth'
import { updatePersonalSelfService } from '../../../services/personal'
import { formatPhone } from '../../../utils/formatPhone'

const personalDataSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, 'Informe o nome completo.')
    .max(50, 'O nome deve ter no máximo 50 caracteres.'),
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

type PersonalDataFormValues = z.infer<typeof personalDataSchema>

interface EditPersonalDataModalProps {
  onClose: () => void
  updateSelf?: (payload: {
    nome: string
    telefone: string
  }) => Promise<{ nome: string; telefone: string }>
}

export const EditPersonalDataModal = ({
  onClose,
  updateSelf = updatePersonalSelfService,
}: EditPersonalDataModalProps) => {
  const { updateUser, user } = useAuth()
  const [submitError, setSubmitError] = useState('')

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<PersonalDataFormValues>({
    defaultValues: {
      nome: user?.name ?? '',
      telefone: formatPhone(user?.phone ?? ''),
    },
    resolver: zodResolver(personalDataSchema),
  })

  const telefoneRegistration = register('telefone')

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError('')

    try {
      const updated = await updateSelf({
        nome: values.nome.trim(),
        telefone: values.telefone.replace(/\D/g, ''),
      })

      updateUser({ name: updated.nome, phone: updated.telefone })
      onClose()
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Não foi possível salvar os dados.',
      )
    }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-[1.6rem] border border-line bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-3 p-5 pb-0">
          <h3 className="font-display text-lg font-semibold text-ink">Dados pessoais</h3>
          <button
            className="rounded-xl p-1.5 text-faint transition hover:bg-elev hover:text-ink"
            onClick={onClose}
            type="button"
          >
            <X size={16} />
          </button>
        </div>

        <form className="space-y-4 p-5" onSubmit={onSubmit}>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-mute">
              Nome completo
            </span>
            <input className="field" {...register('nome')} />
            {errors.nome ? (
              <span className="text-sm text-rose-400 light:text-rose-600">
                {errors.nome.message}
              </span>
            ) : null}
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-mute">
              Telefone
            </span>
            <input
              className="field"
              inputMode="tel"
              placeholder="(65) 99999-9999"
              {...telefoneRegistration}
              onChange={(event) => {
                event.target.value = formatPhone(event.target.value)
                telefoneRegistration.onChange(event)
              }}
            />
            {errors.telefone ? (
              <span className="text-sm text-rose-400 light:text-rose-600">
                {errors.telefone.message}
              </span>
            ) : null}
          </label>

          {submitError ? (
            <p className="text-sm text-rose-400 light:text-rose-600">{submitError}</p>
          ) : null}

          <div className="flex gap-3 pt-1">
            <button
              className="flex-1 rounded-2xl border border-line px-4 py-2.5 text-sm font-medium text-mute transition hover:bg-elev"
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>
            <button className="btn-primary flex-1" disabled={isSubmitting} type="submit">
              <Save size={14} />
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
