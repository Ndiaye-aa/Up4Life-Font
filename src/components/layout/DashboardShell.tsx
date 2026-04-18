import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { LogOut } from 'lucide-react'
import { DashboardNav } from './DashboardNav'

export interface DashboardNavItem {
  icon: LucideIcon
  label: string
  to: string
}

interface DashboardShellProps {
  children: ReactNode
  contact: string
  name: string
  navItems: DashboardNavItem[]
  onLogout: () => void
  overviewItems: Array<{
    label: string
    value: string
  }>
  roleLabel: string
  subtitle: string
  tone: 'personal' | 'student'
}

export const DashboardShell = ({
  children,
  contact,
  name,
  navItems,
  onLogout,
  overviewItems,
  roleLabel,
  subtitle,
  tone,
}: DashboardShellProps) => {
  const isPersonal = tone === 'personal'
  const sidebarTone = isPersonal ? 'bg-[#111827]' : 'bg-[#0f172a]'
  const accentTone = isPersonal ? 'bg-[#A020F0]' : 'bg-[#A020F0]'
  const accentBorder = isPersonal ? 'border-[#A020F0]/30' : 'border-[#A020F0]/30'
  const accentText = isPersonal ? 'text-[#A020F0]' : 'text-[#A020F0]'

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#f6f7fb] text-stone-950">
      <aside className={`hidden w-72 flex-col ${sidebarTone} lg:flex`}>
        <div className="border-b border-white/10 px-6 py-6">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${accentTone}`}
            >
            </div>
              <img src="/favi.png" alt="logo" className="h-5 w-5 object-contain" />
            <div>
              <p className="font-display text-lg font-semibold text-white">
                Up4Life
              </p>
              <p className="text-xs text-white/45">{roleLabel}</p>
            </div>
          </div>
        </div>

        <div className="border-b border-white/10 px-4 py-4">
          <p className="mb-3 px-2 text-xs uppercase tracking-[0.28em] text-white/40">
            Visao geral
          </p>
          <div className="space-y-3">
            {overviewItems.map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl border ${accentBorder} bg-white/6 px-4 py-3`}
              >
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                  {item.label}
                </p>
                <p className={`mt-2 text-lg font-medium ${accentText}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 py-4">
          <p className="mb-3 px-2 text-xs uppercase tracking-[0.28em] text-white/40">
            Menu
          </p>
          <DashboardNav accentTextClassName={accentText} items={navItems} />
        </div>

        <div className="px-4 py-4">
          <p className="mb-3 px-2 text-xs uppercase tracking-[0.28em] text-white/40">
            Destaque
          </p>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
            <p className="text-sm font-medium text-white">Painel central</p>
            <p className="mt-2 text-sm leading-6 text-white/65">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="mt-auto border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3 px-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${
                isPersonal ? 'from-[#a855f7] to-[#6d28d9]' : 'from-[#3b82f6] to-[#2563eb]'
              } text-sm font-semibold text-white`}
            >
              {name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-white">{name}</p>
              <p className="truncate text-xs text-white/45">{contact}</p>
            </div>
          </div>
          <button
            className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-gray-300 transition hover:bg-white/8 hover:text-white"
            onClick={onLogout}
            type="button"
          >
            <LogOut size={16} />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 bg-[#111827] px-4 py-3 text-white lg:hidden">
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accentTone}`}>
              <img src="/favi.png" alt="logo" className="h-4 w-4 object-contain" />
            </div>
            <div>
              <p className="font-display text-base font-semibold">Up4Life</p>
              <p className="text-[11px] text-white/45">{roleLabel}</p>
            </div>
          </div>
          <button
            className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/75"
            onClick={onLogout}
            type="button"
          >
            Sair
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4 pb-24 lg:px-8 lg:py-6 lg:pb-8">
          {children}
        </main>

        <DashboardNav
          accentTextClassName={accentText}
          items={navItems}
          mobile
        />
      </div>
    </div>
  )
}
