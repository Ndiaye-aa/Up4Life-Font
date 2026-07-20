import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

interface ThemeToggleProps {
  className?: string
  variant?: 'auto' | 'onDark'
}

export const ThemeToggle = ({
  className = '',
  variant = 'onDark',
}: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const toneClasses =
    variant === 'onDark'
      ? 'border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
      : 'border-line text-mute hover:bg-elev hover:text-ink'

  return (
    <button
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${toneClasses} ${className}`}
      onClick={toggleTheme}
      title={isDark ? 'Tema claro' : 'Tema escuro'}
      type="button"
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  )
}
