import type { AuthSession, User } from './types'
import type { LoginInput, ProfileSetupInput, RegisterInput } from './schemas'

/**
 * In-memory mock auth backend. Swap this module for real API calls (same
 * function signatures) when a backend lands — callers depend only on these.
 */

interface StoredUser extends User {
  password: string
}

const SEED_USERS: StoredUser[] = [
  {
    id: 'usr_tenant_demo',
    name: 'Aarav Sharma',
    email: 'tenant@tenantflow.app',
    phone: '9876543210',
    password: 'password1',
    role: 'tenant',
    occupation: 'Software Engineer',
    profileComplete: true,
  },
  {
    id: 'usr_admin_demo',
    name: 'Property Admin',
    email: 'admin@tenantflow.app',
    phone: '9876500000',
    password: 'password1',
    role: 'admin',
    profileComplete: true,
  },
]

const users = new Map<string, StoredUser>(SEED_USERS.map((u) => [u.id, u]))

const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms))

function normalizePhone(v: string) {
  return v.replace(/^(\+91|0)/, '').replace(/\s|-/g, '')
}

function findByIdentifier(identifier: string): StoredUser | undefined {
  const id = identifier.trim().toLowerCase()
  const phone = normalizePhone(identifier)
  return [...users.values()].find(
    (u) => u.email.toLowerCase() === id || u.phone === phone
  )
}

function strip(user: StoredUser): User {
  const { password: _password, ...rest } = user
  return rest
}

function issueToken(userId: string) {
  return `mock.${userId}.${Math.random().toString(36).slice(2)}`
}

export async function login(input: LoginInput): Promise<AuthSession> {
  await delay()
  const user = findByIdentifier(input.identifier)
  if (!user || user.password !== input.password) {
    throw new Error('Invalid credentials. Please check and try again.')
  }
  return { user: strip(user), token: issueToken(user.id) }
}

export async function register(input: RegisterInput): Promise<AuthSession> {
  await delay()
  const emailTaken = [...users.values()].some(
    (u) => u.email.toLowerCase() === input.email.toLowerCase()
  )
  const phoneTaken = [...users.values()].some((u) => u.phone === input.phone)
  if (emailTaken) throw new Error('An account with this email already exists.')
  if (phoneTaken) throw new Error('An account with this phone number already exists.')

  const newUser: StoredUser = {
    id: `usr_${Math.random().toString(36).slice(2, 10)}`,
    name: input.name,
    email: input.email,
    phone: input.phone,
    password: input.password,
    role: 'tenant',
    profileComplete: false,
  }
  users.set(newUser.id, newUser)
  return { user: strip(newUser), token: issueToken(newUser.id) }
}

export async function requestPasswordReset(email: string): Promise<void> {
  await delay()
  // Always resolve (don't disclose whether an email exists).
  void email
}

export async function completeProfile(
  userId: string,
  input: ProfileSetupInput,
  avatarUrl?: string
): Promise<User> {
  await delay()
  const user = users.get(userId)
  if (!user) throw new Error('Session expired. Please sign in again.')
  user.occupation = input.occupation
  user.avatarUrl = avatarUrl
  user.emergencyContact = {
    name: input.emergencyName,
    phone: input.emergencyPhone,
    relation: input.emergencyRelation,
  }
  user.profileComplete = true
  users.set(userId, user)
  return strip(user)
}
