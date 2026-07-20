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
    <span className="text-sm font-medium text-ink">{label}</span>
    <input className="field" id={id} {...props} />
    {error ? (
      <span className="block text-sm text-rose-400 light:text-rose-600">
        {error}
      </span>
    ) : hint ? (
      <span className="block text-sm text-mute">{hint}</span>
    ) : null}
  </label>
)
