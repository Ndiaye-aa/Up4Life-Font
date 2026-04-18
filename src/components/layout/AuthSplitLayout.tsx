import type { ReactNode } from 'react'

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
    <main className="min-h-screen bg-[#f5f6f9] text-stone-950">
      <div
        className={[
          'mx-auto min-h-screen max-w-7xl gap-6 px-4 py-4 lg:px-6 lg:py-6',
          hasAside
            ? 'grid lg:grid-cols-[1.1fr_0.9fr]'
            : 'flex items-center justify-center',
        ].join(' ')}
      >
        {hasAside ? (
          <section className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-[#0f172a] p-8 shadow-[0_30px_80px_rgba(15,23,42,0.35)] lg:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(168,85,247,0.24),_transparent_30%),linear-gradient(160deg,_rgba(255,255,255,0.02),_rgba(255,255,255,0.08))]" />
            <div className="absolute -right-24 top-16 h-64 w-64 rounded-full bg-[#a855f7]/20 blur-3xl" />
            <div className="absolute -bottom-20 left-10 h-72 w-72 rounded-full bg-[#1f2937]/40 blur-3xl" />
            <div className="relative h-full">{aside}</div>
          </section>
        ) : null}

        <section className="flex w-full items-center justify-center rounded-[2rem] border border-[#e6e8ef] bg-white px-5 py-8 shadow-[0_18px_55px_rgba(15,23,42,0.12)] lg:max-w-xl lg:px-10">
          <div className="w-full max-w-md">{children}</div>
        </section>
      </div>
    </main>
  )
}
