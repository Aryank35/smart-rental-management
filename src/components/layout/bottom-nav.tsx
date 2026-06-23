import { NavLink } from 'react-router-dom'
import type { NavSection } from '@/config/navigation'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  sections: NavSection[]
}

/** Mobile bottom tab bar (hidden on desktop). Shows items flagged `mobile`. */
export function BottomNav({ sections }: BottomNavProps) {
  const items = sections.flatMap((s) => s.items).filter((i) => i.mobile).slice(0, 5)

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden">
      <ul className="flex items-stretch justify-around">
        {items.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.to.split('/').length <= 2}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 px-1 py-2 text-[11px] font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex h-7 w-12 items-center justify-center rounded-full transition-colors',
                      isActive && 'bg-accent'
                    )}
                  >
                    <item.icon className="size-5" />
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
