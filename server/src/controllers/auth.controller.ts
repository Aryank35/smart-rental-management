import bcrypt from 'bcryptjs'
import type { Request, Response } from 'express'
import { User, toPublicUser, type UserDoc } from '../models/User.js'
import { HttpError } from '../utils/http.js'
import { signToken } from '../utils/token.js'
import { provisionTenancy } from '../services/provision.js'
import {
  forgotPasswordSchema,
  loginSchema,
  profileSchema,
  registerSchema,
} from '../validation/auth.js'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const normalizePhone = (v: string) => v.replace(/^(\+91|0)/, '').replace(/\s|-/g, '')

function sessionResponse(user: UserDoc) {
  const token = signToken({ sub: user._id.toString(), role: user.role })
  return { token, user: toPublicUser(user) }
}

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body)
  const passwordHash = await bcrypt.hash(input.password, 10)
  const user = await User.create({
    name: input.name,
    email: input.email,
    phone: input.phone,
    passwordHash,
    role: 'tenant',
    profileComplete: false,
  })
  res.status(201).json(sessionResponse(user))
}

export async function login(req: Request, res: Response) {
  const { identifier, password } = loginSchema.parse(req.body)

  const query = emailRegex.test(identifier)
    ? { email: identifier.toLowerCase() }
    : { phone: normalizePhone(identifier) }

  const user = await User.findOne(query).select('+passwordHash')
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError(401, 'Invalid credentials. Please check and try again.')
  }
  res.json(sessionResponse(user))
}

export async function forgotPassword(req: Request, res: Response) {
  forgotPasswordSchema.parse(req.body)
  // Always succeed — don't disclose whether the email exists.
  // A real implementation would email a signed reset link here.
  res.json({ ok: true })
}

export async function me(req: Request, res: Response) {
  const user = await User.findById(req.auth!.sub)
  if (!user) throw new HttpError(404, 'User not found.')
  res.json({ user: toPublicUser(user) })
}

export async function updateProfile(req: Request, res: Response) {
  const input = profileSchema.parse(req.body)
  const user = await User.findById(req.auth!.sub)
  if (!user) throw new HttpError(404, 'User not found.')

  user.occupation = input.occupation
  user.avatarUrl = input.avatarUrl
  user.emergencyContact = {
    name: input.emergencyName,
    phone: input.emergencyPhone,
    relation: input.emergencyRelation,
  }
  user.profileComplete = true
  await user.save()

  // Give the new tenant a real tenancy + opening bills so the app works
  // immediately (no dependency on seeded demo data). Idempotent.
  if (user.role === 'tenant') {
    await provisionTenancy(user._id.toString())
  }

  res.json({ user: toPublicUser(user) })
}
