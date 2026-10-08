import type { ProgressData } from '../../@types/progress'
import { formatPercent, formatYmd } from '../../utils/sessionFormat'

interface Props {
  progress: ProgressData
}

const signed = (value: number | null, unit: string): string =>
  value === null ? '—' : `${value > 0 ? '+' : ''}${value.toFixed(1)}${unit}`

export const ProgressOverviewCards = ({ progress }: Props) => {
  const { frequencia, sequenciaAtual, avaliacoes, acompanhamentoDesde } = progress

  const cards = [
    {
      label: 'Frequência',
      value: formatPercent(frequencia.percentual),
      sub: `${frequencia.cumpridas}/${frequencia.previstas} treinos`,
    },
    {
      label: 'Sequência',
      value: String(sequenciaAtual),
      sub: sequenciaAtual === 1 ? 'treino seguido' : 'treinos seguidos',
    },
    {
      label: 'Faltas no período',
      value: String(frequencia.faltas),
      sub: `${frequencia.justificadas} justificadas · ${frequencia.extras} extras`,
    },
    {
      label: 'Δ Peso',
      value: signed(avaliacoes.deltaDesdePrimeira.peso, ' kg'),
      sub: 'desde a 1ª avaliação',
    },
    {
      label: 'Δ % Gordura',
      value: signed(avaliacoes.deltaDesdePrimeira.percentualGordura, ' p.p.'),
      sub: 'desde a 1ª avaliação',
    },
  ]

  return (
    <section aria-label="Resumo do progresso">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <article key={card.label} className="card rounded-2xl p-4">
            <p className="text-xl font-semibold text-ink">{card.value}</p>
            <p className="mt-0.5 text-xs text-mute">{card.label}</p>
            <p className="mt-1 text-[11px] text-faint">{card.sub}</p>
          </article>
        ))}
      </div>
      {acompanhamentoDesde ? (
        <p className="mt-2 text-xs text-faint">
          Acompanhamento desde {formatYmd(acompanhamentoDesde, true)}. Antes dessa data não há
          faltas nem frequência registradas.
        </p>
      ) : null}
    </section>
  )
}
