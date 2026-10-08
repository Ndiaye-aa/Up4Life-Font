import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  eyebrow?: string
  onClose: () => void
  title: string
  /** `lg` para formulários mais largos (edição de sessão). */
  size?: 'md' | 'lg'
}

/** Casca padrão dos modais da área de sessões: overlay, cabeçalho, fechar com Esc. */
export const ModalShell = ({ children, eyebrow, onClose, size = 'md', title }: Props) => {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-5">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        aria-modal="true"
        className={`relative flex max-h-[92vh] w-full flex-col rounded-t-[2rem] border border-line bg-surface shadow-2xl sm:rounded-[1.6rem] ${
          size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-md'
        }`}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line p-5">
          <div>
            {eyebrow ? (
              <p className="text-xs uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
            ) : null}
            <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
          </div>
          <button
            aria-label="Fechar"
            className="rounded-xl p-1.5 text-faint transition hover:bg-elev hover:text-ink"
            onClick={onClose}
            type="button"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}
