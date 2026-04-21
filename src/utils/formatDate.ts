export const formatDateBR = (dateStr: string): string => {
  const parts = dateStr.split('T')[0].split('-')
  if (parts.length !== 3) return dateStr
  const [year, month, day] = parts
  return `${(day ?? '').padStart(2, '0')}/${(month ?? '').padStart(2, '0')}/${year ?? ''}`
}

export const todayBR = (): string => {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${now.getFullYear()}`
}
