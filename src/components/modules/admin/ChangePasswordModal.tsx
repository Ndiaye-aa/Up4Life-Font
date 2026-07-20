import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { updatePersonalSelfService } from '../../../services/personal'

const changePasswordSchema = z
  .object({
    senha: z
      .string()
      .min(6, 'A senha deve ter no mínimo 6 caracteres.')
      .max(72, 'A senha deve ter no máximo 72 caracteres.'),
    confirmar: z.string(),
  })
  .refine((data) => data.senha === data.confirmar, {
    message: 'As senhas não coincidem.',
    path: ['confirmar'],
  })

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

interface ChangePasswordModalProps {
  onClose: () => void
  updateSelf?: (payload: { senha: string }) => Promise<unknown>
}

export const ChangePasswordModal = ({
  onClose,
  updateSelf = updatePersonalSelfService,
}: ChangePasswordModalProps) => {
  const [submitError, setSubmitError] = useState('')

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ChangePasswordFormValues>({
    defaultValues: { confirmar: '', senha: '' },
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError('')

    try {
      await updateSelf({ senha: values.senha })
      onClose()
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Não foi possível alterar a senha.',
      )
    }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-[1.6rem] border border-line bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-3 p-5 pb-0">
          <h3 className="font-display text-lg font-semibold text-ink">Alterar senha</h3>
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
              Nova senha
            </span>
            <input
              autoComplete="new-password"
              className="field"
              placeholder="••••••••"
              type="password"
              {...register('senha')}
            />
            {errors.senha ? (
              <span className="text-sm text-rose-400 light:text-rose-600">
                {errors.senha.message}
              </span>
            ) : null}
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-mute">
              Confirmar nova senha
            </span>
            <input
              autoComplete="new-password"
              className="field"
              placeholder="••••••••"
              type="password"
              {...register('confirmar')}
            />
            {errors.confirmar ? (
              <span className="text-sm text-rose-400 light:text-rose-600">
                {errors.confirmar.message}
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
              <KeyRound size={14} />
              {isSubmitting ? 'Alterando...' : 'Alterar senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
