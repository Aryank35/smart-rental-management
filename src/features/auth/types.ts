export type UserRole = 'tenant' | 'admin'

export interface EmergencyContact {
  name: string
  phone: string
  relation?: string
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  avatarUrl?: string
  occupation?: string
  emergencyContact?: EmergencyContact
  /** Whether the post-registration profile setup step is complete. */
  profileComplete: boolean
}

export interface AuthSession {
  user: User
  token: string
}
