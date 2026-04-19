import type { InputHTMLAttributes } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  hint?: string
  label: string
}

export const TextField = ({
  error,
  hint,
  id,
  label,
  ...props
}: TextFieldProps) => (
  <label className="block space-y-2" htmlFor={id}>
    <span className="text-sm font-medium text-stone-700">{label}</span>
    <input
      className="w-full rounded-2xl border border-[#d7e1db] bg-[#f7faf7] px-4 py-3.5 text-sm text-stone-950 outline-none transition focus:border-[#2a7d67] focus:bg-white focus:ring-4 focus:ring-[#2a7d67]/10"
      id={id}
      {...props}
    />
    {error ? (
      <span className="block text-sm text-rose-600">{error}</span>
    ) : hint ? (
      <span className="block text-sm text-stone-500">{hint}</span>
    ) : null}
  </label>
)
