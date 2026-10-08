import { useState } from 'react'
import type { SessionItem, SessionRecord, SessionStatus, UpdateSessionPayload } from '../../../@types/session'
import { DISPOSITION_EMOJI, formatYmd, STATUS_LABEL } from '../../../utils/sessionFormat'
import { ModalShell } from '../../ui/ModalShell'

type Role = 'PERSONAL' | 'ALUNO'

interface Props {
  /** Texto do motivo quando a edição está bloqueada (fora do prazo ou validada). */
  lockedReason?: string
  onClose: () => void
  onSubmit: (payload: UpdateSessionPayload) => Promise<void>
  role: Role
  session: SessionRecord
}

const STATUS_BY_ROLE: Record<Role, SessionStatus[]> = {
  ALUNO: ['REALIZADA', 'PARCIAL', 'FALTA_JUSTIFICADA'],
  PERSONAL: ['REALIZADA', 'PARCIAL', 'FALTA', 'FALTA_JUSTIFICADA'],
}

/** Edição de uma sessão. O feedback (RPE, dor…) é a voz do aluno: o personal só o visualiza. */
export const EditSessionModal = ({ lockedReason, onClose, onSubmit, role, session }: Props) => {
  const locked = Boolean(lockedReason)
  const [status, setStatus] = useState<SessionStatus>(session.status)
  const [motivo, setMotivo] = useState(session.motivoFalta ?? '')
  const [itens, setItens] = useState<SessionItem[]>(session.itens)
  const [rpe, setRpe] = useState(session.rpe ?? 7)
  const [hasRpe, setHasRpe] = useState(session.rpe !== null)
  const [disposicao, setDisposicao] = useState<number | null>(session.disposicao)
  const [dor, setDor] = useState(session.dor)
  const [dorLocal, setDorLocal] = useState(session.dorLocal ?? '')
  const [comentario, setComentario] = useState(session.comentarioAluno ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const isAluno = role === 'ALUNO'
  const showItems = status === 'REALIZADA' || status === 'PARCIAL'
  const showMotivo = status === 'FALTA' || status === 'FALTA_JUSTIFICADA'

  const patchItem = (ordem: number, patch: Partial<SessionItem>) =>
    setItens((current) => current.map((i) => (i.ordem === ordem ? { ...i, ...patch } : i)))

  const submit = async () => {
    if (dor && !dorLocal.trim()) {
      setError('Informe onde sente a dor.')
      return
    }
    const payload: UpdateSessionPayload = { version: session.version }
    if (status !== session.status) payload.status = status
    if (showMotivo && motivo !== (session.motivoFalta ?? '')) payload.motivoFalta = motivo.trim()
    if (showItems) {
      payload.itens = itens.map((i) => ({
        ordem: i.ordem,
        exercicio: i.exercicio,
        seriesFeitas: i.seriesFeitas ?? undefined,
        repsFeitas: i.repsFeitas ?? undefined,
        cargaTexto: i.cargaTexto ?? undefined,
        concluido: i.concluido,
      }))
    }
    if (isAluno) {
      if (hasRpe) payload.rpe = rpe
      if (disposicao !== null) payload.disposicao = disposicao
      payload.dor = dor
      if (dor) payload.dorLocal = dorLocal.trim()
      if (comentario !== (session.comentarioAluno ?? '')) payload.comentarioAluno = comentario.trim()
    }

    setBusy(true)
    setError('')
    try {
      await onSubmit(payload)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar a sessão.')
      setBusy(false)
    }
  }

  return (
    <ModalShell
      eyebrow={`Sessão de ${formatYmd(session.data, true)}`}
      onClose={onClose}
      size="lg"
      title="Editar sessão"
    >
      {locked ? (
        <p className="mb-4 rounded-xl bg-amber-500/10 px-3 py-2 text-sm text-amber-400 light:text-amber-700" role="status">
          {lockedReason}
        </p>
      ) : null}

      <fieldset className="space-y-5" disabled={locked || busy}>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-mute">Situação</span>
          <select className="field" onChange={(e) => setStatus(e.target.value as SessionStatus)} value={status}>
            {STATUS_BY_ROLE[role].map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>

        {showMotivo ? (
          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-mute">Motivo</span>
            <textarea className="field min-h-20 resize-none" maxLength={500} onChange={(e) => setMotivo(e.target.value)} value={motivo} />
          </label>
        ) : null}

        {showItems ? (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-mute">Exercícios</p>
            {itens.length === 0 ? <p className="text-sm text-faint">Nenhum exercício registrado.</p> : null}
            {itens.map((item) => (
              <div key={item.ordem} className="grid grid-cols-[auto_1fr_4rem_4rem_5rem] items-center gap-2 text-sm">
                <input
                  aria-label={`${item.exercicio} concluído`}
                  checked={item.concluido}
                  className="h-4 w-4 accent-[var(--ui-accent-strong)]"
                  onChange={(e) => patchItem(item.ordem, { concluido: e.target.checked })}
                  type="checkbox"
                />
                <span className="truncate text-ink">{item.exercicio}</span>
                <input
                  aria-label={`Séries de ${item.exercicio}`}
                  className="field px-2 py-2 text-center"
                  inputMode="numeric"
                  onChange={(e) => patchItem(item.ordem, { seriesFeitas: e.target.value === '' ? null : Number(e.target.value) })}
                  placeholder="séries"
                  value={item.seriesFeitas ?? ''}
                />
                <input
                  aria-label={`Repetições de ${item.exercicio}`}
                  className="field px-2 py-2 text-center"
                  maxLength={20}
                  onChange={(e) => patchItem(item.ordem, { repsFeitas: e.target.value })}
                  placeholder="reps"
                  value={item.repsFeitas ?? ''}
                />
                <input
                  aria-label={`Carga de ${item.exercicio}`}
                  className="field px-2 py-2 text-center"
                  maxLength={30}
                  onChange={(e) => patchItem(item.ordem, { cargaTexto: e.target.value })}
                  placeholder="carga"
                  value={item.cargaTexto ?? ''}
                />
              </div>
            ))}
          </div>
        ) : null}

        {isAluno && showItems ? (
          <div className="space-y-4 border-t border-line pt-4">
            <div>
              <label className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-mute">
                <span>Esforço (RPE)</span>
                <span className="text-sm normal-case text-ink">{hasRpe ? `${rpe}/10` : '—'}</span>
              </label>
              <input
                className="mt-2 w-full accent-[var(--ui-accent-strong)]"
                max={10}
                min={1}
                onChange={(e) => {
                  setRpe(Number(e.target.value))
                  setHasRpe(true)
                }}
                type="range"
                value={rpe}
              />
            </div>
            <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Disposição">
              {DISPOSITION_EMOJI.map((emoji, index) => (
                <button
                  key={emoji}
                  aria-checked={disposicao === index + 1}
                  className={`rounded-xl border py-2 text-xl ${disposicao === index + 1 ? 'border-accent-strong bg-accent-soft' : 'border-line'}`}
                  onClick={() => setDisposicao(index + 1)}
                  role="radio"
                  type="button"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <label className="flex items-center justify-between gap-3 text-sm text-ink">
              Senti dor ou desconforto
              <input checked={dor} className="h-5 w-5 accent-[var(--ui-accent-strong)]" onChange={(e) => setDor(e.target.checked)} type="checkbox" />
            </label>
            {dor ? <input className="field" onChange={(e) => setDorLocal(e.target.value)} placeholder="Onde?" value={dorLocal} /> : null}
            <textarea className="field min-h-20 resize-none" maxLength={1000} onChange={(e) => setComentario(e.target.value)} placeholder="Comentário (opcional)" value={comentario} />
          </div>
        ) : null}
      </fieldset>

      {error ? <p className="mt-3 text-sm text-rose-400 light:text-rose-600">{error}</p> : null}

      <div className="mt-5 flex gap-3">
        <button
          className="flex-1 rounded-2xl border border-line px-4 py-2.5 text-sm font-medium text-mute transition hover:bg-elev"
          onClick={onClose}
          type="button"
        >
          {locked ? 'Fechar' : 'Cancelar'}
        </button>
        {locked ? null : (
          <button className="btn-primary flex-1" disabled={busy} onClick={() => void submit()} type="button">
            {busy ? 'Salvando...' : 'Salvar'}
          </button>
        )}
      </div>
    </ModalShell>
  )
}
