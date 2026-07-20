import type { ReactNode } from 'react'

interface PageHeaderProps {
  action?: ReactNode
  description?: string
  eyebrow: string
  title: string
}

export const PageHeader = ({
  action,
  description,
  eyebrow,
  title,
}: PageHeaderProps) => (
  <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent">
        {eyebrow}
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold text-ink">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-mute">
          {description}
        </p>
      ) : null}
    </div>
    {action}
  </header>
)
