import type { ReactNode } from 'react'
import { ThemeToggle } from '../ui/ThemeToggle'
import { TopHeader } from './TopHeader'

interface AuthSplitLayoutProps {
  aside?: ReactNode
  children: ReactNode
}

export const AuthSplitLayout = ({
  aside,
  children,
}: AuthSplitLayoutProps) => {
  const hasAside = Boolean(aside)

  return (
    <main className="relative min-h-screen bg-canvas pt-14 text-ink">
      <TopHeader />
      <ThemeToggle className="absolute right-5 top-[4.75rem] z-10" variant="auto" />
      <div
        className={[
          'mx-auto min-h-screen max-w-6xl gap-10 px-5 py-6 lg:gap-14 lg:px-8 lg:py-8',
          hasAside
            ? 'grid lg:grid-cols-[1.05fr_0.95fr]'
            : 'flex items-center justify-center',
        ].join(' ')}
      >
        {hasAside ? (
          <section className="relative overflow-hidden rounded-[2rem] bg-[#0f172a] p-8 shadow-[0_30px_80px_rgba(10,8,20,0.45)] lg:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(168,85,247,0.24),_transparent_30%),linear-gradient(160deg,_rgba(255,255,255,0.02),_rgba(255,255,255,0.08))]" />
            <div className="absolute -right-24 top-16 h-64 w-64 rounded-full bg-[#a855f7]/20 blur-3xl" />
            <div className="absolute -bottom-20 left-10 h-72 w-72 rounded-full bg-[#1f2937]/40 blur-3xl" />
            <div className="relative h-full">{aside}</div>
          </section>
        ) : null}

        <section className="flex w-full items-center justify-center">
          <div className="w-full max-w-md">{children}</div>
        </section>
      </div>
    </main>
  )
}
