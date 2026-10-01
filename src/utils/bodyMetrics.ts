export interface StatusStyle {
  label: string
  color: string
}

export const STATUS_COLORS = {
  blue: 'text-blue-400 light:text-blue-600',
  emerald: 'text-emerald-400 light:text-emerald-600',
  amber: 'text-amber-400 light:text-amber-600',
  rose: 'text-rose-400 light:text-rose-600',
}

export function getImcStatus(imc: number): StatusStyle {
  if (imc < 18.5) return { color: STATUS_COLORS.blue, label: 'Abaixo do peso' }
  if (imc < 25) return { color: STATUS_COLORS.emerald, label: 'Normal' }
  if (imc < 30) return { color: STATUS_COLORS.amber, label: 'Sobrepeso' }
  return { color: STATUS_COLORS.rose, label: 'Obesidade' }
}

export function getBodyFatStatus(pct: number, sexo: string): StatusStyle {
  if (sexo === 'M') {
    if (pct < 6) return { color: STATUS_COLORS.blue, label: 'Abaixo do ideal' }
    if (pct < 18) return { color: STATUS_COLORS.emerald, label: 'Adequado' }
    if (pct < 25) return { color: STATUS_COLORS.amber, label: 'Acima do ideal' }
    return { color: STATUS_COLORS.rose, label: 'Obesidade' }
  }
  if (pct < 14) return { color: STATUS_COLORS.blue, label: 'Abaixo do ideal' }
  if (pct < 25) return { color: STATUS_COLORS.emerald, label: 'Adequado' }
  if (pct < 32) return { color: STATUS_COLORS.amber, label: 'Acima do ideal' }
  return { color: STATUS_COLORS.rose, label: 'Obesidade' }
}

/** Classes Tailwind (fundo + texto) para exibir o status do IMC como um "pill". */
export function getImcStatusPillClass(status: string): string {
  if (status === 'Normal') return 'bg-emerald-500/12 text-emerald-400 light:bg-emerald-50 light:text-emerald-600'
  if (status === 'Abaixo do peso') return 'bg-blue-500/12 text-blue-400 light:bg-blue-50 light:text-blue-600'
  if (status === 'Sobrepeso') return 'bg-amber-500/12 text-amber-400 light:bg-amber-50 light:text-amber-600'
  return 'bg-rose-500/12 text-rose-400 light:bg-rose-50 light:text-rose-600'
}

/** Massa magra (kg) a partir do peso e do % de gordura, com validação de range. */
export function calcMassaMagra(
  peso: number | null | undefined,
  percentualGordura: number | null | undefined,
): number | null {
  if (peso == null || percentualGordura == null) return null
  if (percentualGordura < 0 || percentualGordura > 100) return null
  return parseFloat((peso * (1 - percentualGordura / 100)).toFixed(1))
}
