import { z } from 'zod'

const phoneRegex = /^[6-9]\d{9}$/
const normalizePhone = (v: string) => v.replace(/^(\+91|0)/, '').replace(/\s|-/g, '')

export const phoneField = z
  .string()
  .trim()
  .transform(normalizePhone)
  .pipe(z.string().regex(phoneRegex, 'Enter a valid 10-digit mobile number'))

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().toLowerCase().email(),
  phone: phoneField,
  password: z.string().min(8),
  /** Landlord signup creates an organization with this name. */
  orgName: z.string().trim().min(2).max(80),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
})

export const loginSchema = z.object({
  identifier: z.string().trim().min(1),
  password: z.string().min(1),
})

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
})

export const profileSchema = z.object({
  occupation: z.string().trim().min(2),
  emergencyName: z.string().trim().min(2),
  emergencyPhone: phoneField,
  emergencyRelation: z.string().trim().optional(),
  avatarUrl: z.string().optional(),
})
