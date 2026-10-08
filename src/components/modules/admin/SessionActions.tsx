import { Check, MessageSquare, Pencil, ShieldCheck, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import type { SessionRecord, UpdateSessionPayload } from '../../../@types/session'

interface Props {
  /** Data de hoje (YYYY-MM-DD) no fuso do personal. */
  hoje: string
  onDelete: (session: SessionRecord) => Promise<void>
  onEdit: (session: SessionRecord) => void
  onUpdate: (session: SessionRecord, payload: Omit<UpdateSessionPayload, 'version'>) => Promise<void>
  session: SessionRecord
}

const button =
  'inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-ink transition hover:bg-elev disabled:opacity-50'

/** Ações do personal sobre uma sessão: presença/falta, abonar, validar, responder, editar e excluir. */
export const SessionActions = ({ hoje, onDelete, onEdit, onUpdate, session }: Props) => {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [replying, setReplying] = useState(false)
  const [reply, setReply] = useState(session.respostaPersonal ?? '')

  const run = async (action: () => Promise<void>) => {
    setBusy(true)
    setError('')
    try {
      await action()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível concluir a ação.')
    } finally {
      setBusy(false)
    }
  }

  const isFalta = session.status === 'FALTA'
  const hasFeedback = session.rpe !== null || session.comentarioAluno !== null || session.dor

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {isFalta ? (
          <>
            <button
              className={button}
              disabled={busy}
              onClick={() => void run(() => onUpdate(session, { status: 'REALIZADA' }))}
              type="button"
            >
              <Check size={12} /> Marcar presença
            </button>
            <button
              className={button}
              disabled={busy}
              onClick={() => void run(() => onUpdate(session, { status: 'FALTA_JUSTIFICADA' }))}
              type="button"
            >
              Abonar
            </button>
          </>
        ) : null}
        {!isFalta && session.modalidade !== 'ONLINE' && session.data <= hoje ? (
          <button
            className={button}
            disabled={busy}
            onClick={() => void run(() => onUpdate(session, { status: 'FALTA' }))}
            type="button"
          >
            <X size={12} /> Marcar falta
          </button>
        ) : null}

        {session.status === 'REALIZADA' || session.status === 'PARCIAL' ? (
          <button
            className={button}
            disabled={busy}
            onClick={() => void run(() => onUpdate(session, { validar: !session.validadaEm }))}
            type="button"
          >
            <ShieldCheck size={12} /> {session.validadaEm ? 'Remover validação' : 'Validar'}
          </button>
        ) : null}

        {hasFeedback ? (
          <button className={button} disabled={busy} onClick={() => setReplying((v) => !v)} type="button">
            <MessageSquare size={12} /> {session.respostaPersonal ? 'Editar resposta' : 'Responder'}
          </button>
        ) : null}

        <button className={button} disabled={busy} onClick={() => onEdit(session)} type="button">
          <Pencil size={12} /> Editar
        </button>

        {/* Faltas automáticas não podem ser excluídas (o job as recriaria): use abonar. */}
        {session.origem !== 'AUTOMATICA' ? (
          <button
            className={`${button} hover:text-rose-400`}
            disabled={busy}
            onClick={() => {
              if (window.confirm('Excluir esta sessão? Essa ação não pode ser desfeita.')) {
                void run(() => onDelete(session))
              }
            }}
            type="button"
          >
            <Trash2 size={12} /> Excluir
          </button>
        ) : null}
      </div>

      {replying ? (
        <div className="space-y-2">
          <textarea
            className="field min-h-16 resize-none text-sm"
            maxLength={1000}
            onChange={(event) => setReply(event.target.value)}
            placeholder="Escreva uma resposta para o aluno"
            value={reply}
          />
          <button
            className="btn-primary rounded-xl px-4 py-2"
            disabled={busy || !reply.trim()}
            onClick={() =>
              void run(async () => {
                await onUpdate(session, { respostaPersonal: reply.trim() })
                setReplying(false)
              })
            }
            type="button"
          >
            Enviar resposta
          </button>
        </div>
      ) : null}

      {error ? <p className="text-xs text-rose-400 light:text-rose-600">{error}</p> : null}
    </div>
  )
}
