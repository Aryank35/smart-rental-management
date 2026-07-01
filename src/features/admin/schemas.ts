import { z } from 'zod'

const phoneRegex = /^[6-9]\d{9}$/
const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/^(\+91|0)/, '').replace(/\s|-/g, ''))
  .pipe(z.string().regex(phoneRegex, 'Enter a valid 10-digit mobile number'))

export const propertySchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(80),
  type: z.enum(['apartment', 'independent-house', 'pg', 'commercial']),
  addressLine: z.string().trim().min(3, 'Address is required').max(160),
  city: z.string().trim().min(2, 'City is required').max(60),
  state: z.string().trim().max(60).optional(),
  pincode: z.string().trim().max(10).optional(),
  notes: z.string().trim().max(500).optional(),
})
export type PropertyInput = z.infer<typeof propertySchema>

export const unitSchema = z.object({
  label: z.string().trim().min(1, 'Unit label is required').max(30),
  floor: z.coerce.number().int().min(-2).max(200),
  bedrooms: z.coerce.number().int().min(0).max(20),
  bathrooms: z.coerce.number().int().min(0).max(20),
  sizeSqft: z.coerce.number().min(0).max(100000),
  rentAmount: z.coerce.number().min(0, 'Rent is required').max(10000000),
  depositAmount: z.coerce.number().min(0).max(10000000),
})
export type UnitInput = z.infer<typeof unitSchema>

export const tenantSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(60),
  email: z.string().trim().email('Enter a valid email'),
  phone,
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Za-z]/, 'Include a letter')
    .regex(/\d/, 'Include a number'),
  unitId: z.string().min(1, 'Select a unit'),
  monthlyRent: z.coerce.number().min(0).max(10000000).optional(),
  agreementMonths: z.coerce.number().int().min(1).max(120),
  occupation: z.string().trim().max(80).optional(),
})
export type TenantInput = z.infer<typeof tenantSchema>

export const billSchema = z.object({
  tenantId: z.string().min(1, 'Select a tenant'),
  type: z.enum(['rent', 'electricity', 'water', 'penalty']),
  period: z.string().trim().min(3, 'Period is required').max(30),
  amount: z.coerce.number().min(1, 'Amount is required').max(10000000),
  dueDate: z.string().min(1, 'Due date is required'),
})
export type BillInput = z.infer<typeof billSchema>

export const noticeSchema = z.object({
  title: z.string().trim().min(4, 'Title is too short').max(120),
  category: z.enum(['maintenance', 'rent', 'community', 'emergency']),
  excerpt: z.string().trim().min(4, 'Summary is required').max(200),
  body: z.string().trim().max(4000).optional(),
})
export type NoticeInput = z.infer<typeof noticeSchema>

export const settingsSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(80),
  currency: z.string().trim().max(8),
  dueDayOfMonth: z.coerce.number().int().min(1).max(28),
  penaltyPerDay: z.coerce.number().min(0).max(100000),
  graceDays: z.coerce.number().int().min(0).max(60),
  supportEmail: z.string().trim().max(120).optional().or(z.literal('')),
  supportPhone: z.string().trim().max(20).optional().or(z.literal('')),
})
export type SettingsInput = z.infer<typeof settingsSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Za-z]/, 'Include a letter')
      .regex(/\d/, 'Include a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
