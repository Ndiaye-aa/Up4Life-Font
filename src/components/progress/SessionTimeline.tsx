import { CheckCircle2, MessageSquare, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import type { SessionRecord, SessionStatus } from '../../@types/session'
import {
  DISPOSITION_EMOJI,
  formatYmd,
  STATUS_LABEL,
  weekdayName,
} from '../../utils/sessionFormat'

const STATUS_STYLE: Record<SessionStatus, string> = {
  REALIZADA: 'bg-emerald-500/12 text-emerald-400 light:bg-emerald-50 light:text-emerald-600',
  PARCIAL: 'bg-amber-500/12 text-amber-400 light:bg-amber-50 light:text-amber-700',
  FALTA: 'bg-rose-500/12 text-rose-400 light:bg-rose-50 light:text-rose-600',
  FALTA_JUSTIFICADA: 'bg-elev text-mute',
}

interface Props {
  actions?: (session: SessionRecord) => ReactNode
  /** Mostra feedback de saúde (dor): apenas aluno e seu personal. */
  sessions: SessionRecord[]
}

export const SessionTimeline = ({ actions, sessions }: Props) => {
  if (sessions.length === 0) {
    return (
      <section className="card rounded-2xl p-4">
        <h3 className="font-display text-base font-semibold text-ink">Sessões</h3>
        <p className="mt-3 text-sm text-faint">Ainda sem sessões registradas.</p>
      </section>
    )
  }

  return (
    <section className="card rounded-2xl">
      <h3 className="border-b border-line p-4 font-display text-base font-semibold text-ink">
        Sessões
      </h3>
      <ol className="divide-y divide-line">
        {sessions.map((s) => (
          <li key={s.id} className="space-y-2 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium capitalize text-ink">
                {weekdayName(s.data)}, {formatYmd(s.data, true)}
              </p>
              <span className={`rounded-full px-2 py-0.5 text-[0.68rem] font-semibold ${STATUS_STYLE[s.status]}`}>
                {STATUS_LABEL[s.status]}
              </span>
              {s.status === 'FALTA' && s.reposta ? (
                <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 text-[0.68rem] font-semibold text-emerald-400 light:bg-emerald-50 light:text-emerald-600">
                  Reposta
                </span>
              ) : null}
              {!s.prevista && s.status !== 'FALTA' && s.status !== 'FALTA_JUSTIFICADA' ? (
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[0.68rem] font-semibold text-accent">
                  {s.reposicaoDeId ? 'Reposição' : 'Extra'}
                </span>
              ) : null}
              {s.modalidade === 'ONLINE' ? (
                <span className="rounded-full bg-elev px-2 py-0.5 text-[0.68rem] text-mute">Online</span>
              ) : null}
              {s.validadaEm ? (
                <span className="inline-flex items-center gap-1 text-[0.68rem] text-emerald-400 light:text-emerald-600">
                  <ShieldCheck size={12} /> Validada
                </span>
              ) : null}
            </div>

            {s.treinoObjetivo ? <p className="text-xs text-faint">{s.treinoObjetivo}</p> : null}
            {s.motivoFalta ? <p className="text-xs text-mute">Motivo: {s.motivoFalta}</p> : null}

            {s.rpe !== null || s.disposicao !== null || s.dor ? (
              <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-mute">
                {s.rpe !== null ? <span>Esforço (RPE): {s.rpe}/10</span> : null}
                {s.disposicao !== null ? (
                  <span>Disposição: {DISPOSITION_EMOJI[s.disposicao - 1]}</span>
                ) : null}
                {s.dor ? (
                  <span className="text-rose-400 light:text-rose-600">
                    Dor{s.dorLocal ? `: ${s.dorLocal}` : ''}
                  </span>
                ) : null}
              </p>
            ) : null}

            {s.itens.length > 0 ? (
              <p className="flex items-center gap-1 text-xs text-faint">
                <CheckCircle2 size={12} />
                {s.itens.filter((i) => i.concluido).length}/{s.itens.length} exercícios concluídos
              </p>
            ) : null}

            {s.comentarioAluno ? (
              <p className="flex gap-2 rounded-xl bg-elev px-3 py-2 text-xs text-ink">
                <MessageSquare className="mt-0.5 shrink-0 text-faint" size={12} />
                {s.comentarioAluno}
              </p>
            ) : null}
            {s.respostaPersonal ? (
              <p className="rounded-xl bg-accent-soft px-3 py-2 text-xs text-ink">
                <span className="font-semibold text-accent">Personal: </span>
                {s.respostaPersonal}
              </p>
            ) : null}

            {actions ? <div className="pt-1">{actions(s)}</div> : null}
          </li>
        ))}
      </ol>
    </section>
  )
}
