import { NavLink } from 'react-router-dom'
import type { NavSection } from '@/config/navigation'
import { Logo } from './logo'
import { cn } from '@/lib/utils'

interface SidebarProps {
  sections: NavSection[]
  /** Rendered at the bottom of the sidebar (e.g. user card, upgrade CTA). */
  footer?: React.ReactNode
}

/** Persistent left sidebar for tablet/desktop (hidden on mobile). */
export function Sidebar({ sections, footer }: SidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4 scrollbar-thin">
        {sections.map((section, i) => (
          <div key={i}>
            {section.title && (
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to.split('/').length <= 2}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                      )
                    }
                  >
                    <item.icon className="size-5 shrink-0" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {footer && <div className="border-t border-sidebar-border p-3">{footer}</div>}
    </aside>
  )
}
