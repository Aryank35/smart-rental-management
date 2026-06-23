import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthSession, User } from '@/features/auth/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setSession: (session: AuthSession) => void
  setUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setSession: ({ user, token }) => set({ user, token, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'tenantflow-auth',
      partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }),
    }
  )
)

/** Default landing route for a given role. */
export function homePathForRole(role: User['role']) {
  return role === 'admin' ? '/admin' : '/app'
}
