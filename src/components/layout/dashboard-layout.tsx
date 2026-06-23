import { Outlet } from 'react-router-dom'
import type { NavSection } from '@/config/navigation'
import { Sidebar } from './sidebar'
import { BottomNav } from './bottom-nav'
import { TopNavbar } from './top-navbar'
import { useAuthStore } from '@/stores/auth-store'
import { useAuth } from '@/features/auth/use-auth'

interface DashboardLayoutProps {
  sections: NavSection[]
  /** Base path of this portal (e.g. "/app" or "/admin"). */
  basePath?: string
  sidebarFooter?: React.ReactNode
}

/**
 * App shell for authenticated areas:
 *   ┌──────────────────────────────┐
 *   │ Sidebar │ TopNavbar           │
 *   │ (lg+)   ├─────────────────────┤
 *   │         │ <Outlet/> content   │
 *   │         ├─────────────────────┤
 *   │         │ BottomNav (mobile)  │
 *   └──────────────────────────────┘
 */
export function DashboardLayout({ sections, basePath = '/app', sidebarFooter }: DashboardLayoutProps) {
  const user = useAuthStore((s) => s.user)
  const { signOut } = useAuth()

  const navbarUser = user
    ? {
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        subtitle: user.role === 'admin' ? 'Owner' : user.occupation,
        basePath,
      }
    : undefined

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar sections={sections} footer={sidebarFooter} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar sections={sections} user={navbarUser} onSignOut={signOut} />
        {/* pb to clear the mobile bottom nav */}
        <main className="flex-1 pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>
      <BottomNav sections={sections} />
    </div>
  )
}
