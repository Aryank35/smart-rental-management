import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, homePathForRole } from '@/stores/auth-store'
import { toast } from '@/hooks/use-toast'
import * as mockAuth from './mock-auth'
import type { ForgotPasswordInput, LoginInput, RegisterInput } from './schemas'

/** Auth actions wired to the mock backend + store + navigation + toasts. */
export function useAuth() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const logout = useAuthStore((s) => s.logout)

  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) => mockAuth.login(input),
    onSuccess: (session) => {
      setSession(session)
      toast.success(`Welcome back, ${session.user.name.split(' ')[0]}!`)
      navigate(
        session.user.profileComplete
          ? homePathForRole(session.user.role)
          : '/profile-setup',
        { replace: true }
      )
    },
    onError: (err: Error) => toast.error(err.message, 'Sign in failed'),
  })

  const registerMutation = useMutation({
    mutationFn: (input: RegisterInput) => mockAuth.register(input),
    onSuccess: (session) => {
      setSession(session)
      toast.success('Account created. Let’s set up your profile.')
      navigate('/profile-setup', { replace: true })
    },
    onError: (err: Error) => toast.error(err.message, 'Registration failed'),
  })

  const forgotMutation = useMutation({
    mutationFn: (input: ForgotPasswordInput) => mockAuth.requestPasswordReset(input.email),
    onSuccess: () =>
      toast.success('If that email exists, a reset link is on its way.', 'Check your inbox'),
  })

  return {
    login: loginMutation,
    register: registerMutation,
    forgotPassword: forgotMutation,
    signOut: () => {
      logout()
      navigate('/login', { replace: true })
    },
  }
}
