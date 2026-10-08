import { AlertTriangle } from 'lucide-react'
import type { AlertCode } from '../../@types/progress'
import { ALERT_LABEL } from '../../utils/sessionFormat'

interface Props {
  alertas: AlertCode[]
}

export const AlertBadges = ({ alertas }: Props) => {
  if (alertas.length === 0) return null

  return (
    <ul className="flex flex-wrap gap-1.5">
      {alertas.map((codigo) => (
        <li
          key={codigo}
          className="inline-flex items-center gap-1 rounded-full bg-amber-500/12 px-2.5 py-1 text-[0.68rem] font-semibold text-amber-400 light:bg-amber-50 light:text-amber-700"
        >
          <AlertTriangle size={11} />
          {ALERT_LABEL[codigo]}
        </li>
      ))}
    </ul>
  )
}
