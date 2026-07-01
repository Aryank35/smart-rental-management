import { z } from 'zod'

/** Indian 10-digit mobile (optionally +91 / leading 0 tolerated and stripped). */
const phoneRegex = /^[6-9]\d{9}$/

export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/^(\+91|0)/, '').replace(/\s|-/g, ''))
  .pipe(z.string().regex(phoneRegex, 'Enter a valid 10-digit mobile number'))

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Za-z]/, 'Include at least one letter')
  .regex(/\d/, 'Include at least one number')

/** Login accepts either an email or a phone number in a single field. */
export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Email or phone is required')
    .refine(
      (v) => z.string().email().safeParse(v).success || phoneRegex.test(v.replace(/^(\+91|0)/, '')),
      'Enter a valid email or 10-digit phone number'
    ),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
})

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name is too short').max(60, 'Name is too long'),
    orgName: z
      .string()
      .trim()
      .min(2, 'Business name is too short')
      .max(80, 'Business name is too long'),
    email: z.string().trim().email('Enter a valid email'),
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z
      .boolean()
      .refine((v) => v === true, { message: 'You must accept the terms to continue' }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
})

export const profileSetupSchema = z.object({
  occupation: z.string().trim().min(2, 'Occupation is required'),
  emergencyName: z.string().trim().min(2, 'Contact name is required'),
  emergencyPhone: phoneSchema,
  emergencyRelation: z.string().trim().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ProfileSetupInput = z.infer<typeof profileSetupSchema>
