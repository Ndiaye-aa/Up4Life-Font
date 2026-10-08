import { useEffect } from 'react'

interface Props {
  message: string
  onDismiss: () => void
  tone?: 'info' | 'error'
}

/** Aviso temporário (toast simples) para erros como o 409 de edição concorrente. */
export const InlineNotice = ({ message, onDismiss, tone = 'info' }: Props) => {
  useEffect(() => {
    const id = setTimeout(onDismiss, 6000)
    return () => clearTimeout(id)
  }, [message, onDismiss])

  return (
    <div
      className={`fixed bottom-24 left-1/2 z-[80] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl px-4 py-3 text-sm shadow-xl lg:bottom-6 ${
        tone === 'error'
          ? 'bg-rose-600 text-white'
          : 'border border-line bg-surface text-ink'
      }`}
      role="status"
    >
      {message}
    </div>
  )
}
