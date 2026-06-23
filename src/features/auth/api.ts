import { api } from '@/lib/api-client'
import type { AuthSession, User } from './types'
import type { LoginInput, ProfileSetupInput, RegisterInput } from './schemas'

/** Auth API calls against the TenantFlow backend (MongoDB-backed). */

export function login(input: LoginInput): Promise<AuthSession> {
  return api.post<AuthSession>(
    '/auth/login',
    { identifier: input.identifier, password: input.password },
    { auth: false }
  )
}

export function register(input: RegisterInput): Promise<AuthSession> {
  return api.post<AuthSession>(
    '/auth/register',
    { name: input.name, email: input.email, phone: input.phone, password: input.password },
    { auth: false }
  )
}

export async function requestPasswordReset(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email }, { auth: false })
}

export async function completeProfile(
  input: ProfileSetupInput,
  avatarUrl?: string
): Promise<User> {
  const { user } = await api.put<{ user: User }>('/auth/profile', { ...input, avatarUrl })
  return user
}

export async function getMe(): Promise<User> {
  const { user } = await api.get<{ user: User }>('/auth/me')
  return user
}
