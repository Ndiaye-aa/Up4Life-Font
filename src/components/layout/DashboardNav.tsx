import { NavLink } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { DashboardNavItem } from './DashboardShell'

interface DashboardNavProps {
  accentTextClassName: string
  items: DashboardNavItem[]
  mobile?: boolean
}

export const DashboardNav = ({
  accentTextClassName,
  items,
  mobile = false,
}: DashboardNavProps) => {
  if (mobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white lg:hidden">
        <div className="grid grid-cols-4">
          {items.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center gap-1 px-2 py-2.5 text-[11px] transition',
                  isActive ? 'text-[#A020F0]' : 'text-gray-400',
                ].join(' ')
              }
              to={item.to}
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`flex h-8 w-12 items-center justify-center rounded-full ${
                      isActive ? 'bg-purple-100' : ''
                    }`}
                  >
                    <item.icon size={18} />
                  </div>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    )
  }

  return (
    <nav className="space-y-1">
      {items.map((item) => (
        <NavLink
          key={item.to}
          className={({ isActive }) =>
            [
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all',
              isActive
                ? 'border border-white/10 bg-white/10 text-white'
                : 'text-white/60 hover:bg-white/6 hover:text-white',
            ].join(' ')
          }
          to={item.to}
        >
          {({ isActive }) => (
            <>
              <item.icon
                className={isActive ? accentTextClassName : 'text-white/45'}
                size={17}
              />
              <span>{item.label}</span>
              {isActive ? (
                <ChevronRight className={accentTextClassName} size={14} />
              ) : null}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
