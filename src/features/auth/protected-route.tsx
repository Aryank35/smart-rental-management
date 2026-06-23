import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { homePathForRole, useAuthStore } from '@/stores/auth-store'
import type { UserRole } from './types'

interface ProtectedRouteProps {
  /** Restrict to a specific role; omit to allow any authenticated user. */
  role?: UserRole
}

/** Guards authenticated areas. Redirects to login, profile setup, or the
 *  correct role home as appropriate. */
export function ProtectedRoute({ role }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  // Force profile completion before entering the app.
  if (!user.profileComplete && location.pathname !== '/profile-setup') {
    return <Navigate to="/profile-setup" replace />
  }

  if (role && user.role !== role) {
    return <Navigate to={homePathForRole(user.role)} replace />
  }

  return <Outlet />
}

/** For auth pages: bounce already-authenticated users to their home. */
export function PublicOnlyRoute() {
  const { user, isAuthenticated } = useAuthStore()
  if (isAuthenticated && user?.profileComplete) {
    return <Navigate to={homePathForRole(user.role)} replace />
  }
  return <Outlet />
}
