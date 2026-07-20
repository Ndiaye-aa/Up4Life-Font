import { LogOut } from 'lucide-react'
import { ThemeToggle } from '../ui/ThemeToggle'

interface Props {
  onLogout?: () => void
}

export const TopHeader = ({ onLogout }: Props) => (
  <header className="fixed inset-x-0 top-0 z-40 grid h-14 grid-cols-3 items-center border-b border-line px-4 bg-canvas">
    <div className="flex items-center">
      <img alt="Up4Life" className="h-10 w-10 object-contain" src="/favio.png" />
    </div>

    <p className="justify-self-center font-display text-base font-semibold text-ink">
      Up4Life
    </p>

    <div className="flex items-center justify-end gap-2 lg:hidden">
      {onLogout ? (
        <>
          <ThemeToggle className="h-8 w-8" variant="auto" />
          <button
            aria-label="Sair"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-mute transition hover:bg-elev hover:text-ink"
            onClick={onLogout}
            type="button"
          >
            <LogOut size={14} />
          </button>
        </>
      ) : null}
    </div>
  </header>
)
