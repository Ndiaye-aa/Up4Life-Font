import type { LucideIcon } from 'lucide-react'

export interface StatStripItem {
  icon?: LucideIcon
  label: string
  onClick?: () => void
  sub?: string
  value: string
}

interface StatStripProps {
  items: StatStripItem[]
}

export const StatStrip = ({ items }: StatStripProps) => (
  <section
    className=" grid divide-x divide-line overflow-hidden"
    style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
  >
    {items.map((item) => {
      const Wrapper = item.onClick ? 'button' : 'article'
      return (
        <Wrapper
          key={item.label}
          className={`flex flex-col gap-2 px-4 py-4 text-left sm:flex-row sm:items-center sm:gap-3 ${
            item.onClick ? 'cursor-pointer transition hover:bg-elev' : ''
          }`}
          onClick={item.onClick}
          type={item.onClick ? 'button' : undefined}
        >
          {item.icon ? (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft">
              <item.icon className="text-accent" size={15} />
            </div>
          ) : null}
          <div className="min-w-0">
            <p className="text-xl font-semibold text-ink">{item.value}</p>
            <p className="truncate text-xs text-mute">{item.label}</p>
            {item.sub ? (
              <p className="mt-0.5 truncate text-[11px] text-faint">{item.sub}</p>
            ) : null}
          </div>
        </Wrapper>
      )
    })}
  </section>
)
