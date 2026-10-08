export const DEFAULT_TIMEZONE = 'America/Sao_Paulo'

/** Fusos brasileiros aceitos pela API (mesma lista de `FUSOS_BRASILEIROS` no backend). */
export const BRAZIL_TIMEZONES = [
  { value: 'America/Noronha', label: 'Fernando de Noronha (UTC−2)' },
  { value: 'America/Belem', label: 'Belém (UTC−3)' },
  { value: 'America/Fortaleza', label: 'Fortaleza (UTC−3)' },
  { value: 'America/Recife', label: 'Recife (UTC−3)' },
  { value: 'America/Bahia', label: 'Salvador (UTC−3)' },
  { value: 'America/Sao_Paulo', label: 'Brasília / São Paulo (UTC−3)' },
  { value: 'America/Campo_Grande', label: 'Campo Grande (UTC−4)' },
  { value: 'America/Cuiaba', label: 'Cuiabá — MT (UTC−4)' },
  { value: 'America/Manaus', label: 'Manaus (UTC−4)' },
  { value: 'America/Porto_Velho', label: 'Porto Velho (UTC−4)' },
  { value: 'America/Boa_Vista', label: 'Boa Vista (UTC−4)' },
  { value: 'America/Rio_Branco', label: 'Rio Branco (UTC−5)' },
] as const
