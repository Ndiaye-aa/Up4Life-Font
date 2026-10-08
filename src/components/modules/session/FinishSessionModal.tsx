import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { DISPOSITION_EMOJI } from '../../../utils/sessionFormat'
import { ModalShell } from '../../ui/ModalShell'

const schema = z
  .object({
    rpe: z.number().int().min(1).max(10),
    disposicao: z.number().int().min(1).max(5),
    dor: z.boolean(),
    dorLocal: z.string().trim().max(120, 'Use no máximo 120 caracteres.').optional(),
    comentarioAluno: z.string().trim().max(1000, 'Use no máximo 1000 caracteres.').optional(),
  })
  .refine((v) => !v.dor || Boolean(v.dorLocal), {
    message: 'Informe onde sente a dor.',
    path: ['dorLocal'],
  })

export type FinishSessionValues = z.infer<typeof schema>

interface Props {
  /** Texto exibido quando o último envio falhou (rascunho mantido). */
  initialError?: string
  onClose: () => void
  onSubmit: (values: FinishSessionValues) => Promise<void>
}

/** Feedback ao concluir o treino — pensado para ser preenchido em menos de 15 segundos. */
export const FinishSessionModal = ({ initialError = '', onClose, onSubmit }: Props) => {
  const [submitError, setSubmitError] = useState(initialError)
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<FinishSessionValues>({
    defaultValues: { rpe: 7, disposicao: 4, dor: false, dorLocal: '', comentarioAluno: '' },
    resolver: zodResolver(schema),
  })
  const dor = useWatch({ control, name: 'dor' })
  const rpe = useWatch({ control, name: 'rpe' })

  const submit = handleSubmit(async (values) => {
    setSubmitError('')
    try {
      await onSubmit(values)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Não foi possível enviar agora.')
    }
  })

  return (
    <ModalShell eyebrow="Treino concluído" onClose={onClose} title="Como foi o treino?">
      <form className="space-y-5" onSubmit={submit}>
        <div>
          <div className="flex items-baseline justify-between">
            <label className="text-xs font-medium uppercase tracking-wider text-mute" htmlFor="rpe">
              Esforço (RPE)
            </label>
            <span className="text-lg font-semibold text-ink">{rpe}/10</span>
          </div>
          <Controller
            control={control}
            name="rpe"
            render={({ field }) => (
              <input
                className="mt-2 w-full accent-[var(--ui-accent-strong)]"
                id="rpe"
                max={10}
                min={1}
                onChange={(event) => field.onChange(Number(event.target.value))}
                type="range"
                value={field.value}
              />
            )}
          />
          <div className="flex justify-between text-[11px] text-faint">
            <span>leve</span>
            <span>máximo</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-mute">Disposição</p>
          <Controller
            control={control}
            name="disposicao"
            render={({ field }) => (
              <div className="mt-2 grid grid-cols-5 gap-2" role="radiogroup" aria-label="Disposição">
                {DISPOSITION_EMOJI.map((emoji, index) => {
                  const value = index + 1
                  const active = field.value === value
                  return (
                    <button
                      key={value}
                      aria-checked={active}
                      aria-label={`Disposição ${value} de 5`}
                      className={`rounded-xl border py-2 text-2xl transition ${
                        active ? 'border-accent-strong bg-accent-soft' : 'border-line hover:bg-elev'
                      }`}
                      onClick={() => field.onChange(value)}
                      role="radio"
                      type="button"
                    >
                      {emoji}
                    </button>
                  )
                })}
              </div>
            )}
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm text-ink">Senti dor ou desconforto</span>
            <input className="h-5 w-5 accent-[var(--ui-accent-strong)]" type="checkbox" {...register('dor')} />
          </label>
          {dor ? (
            <>
              <input className="field" placeholder="Onde? (ex.: joelho direito)" {...register('dorLocal')} />
              {errors.dorLocal ? (
                <p className="text-sm text-rose-400 light:text-rose-600">{errors.dorLocal.message}</p>
              ) : null}
            </>
          ) : null}
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-mute">Comentário (opcional)</span>
          <textarea className="field min-h-20 resize-none" {...register('comentarioAluno')} />
          {errors.comentarioAluno ? (
            <span className="text-sm text-rose-400 light:text-rose-600">{errors.comentarioAluno.message}</span>
          ) : null}
        </label>

        {submitError ? <p className="text-sm text-rose-400 light:text-rose-600">{submitError}</p> : null}

        <button className="btn-primary w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </ModalShell>
  )
}
