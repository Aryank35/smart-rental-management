import { z } from 'zod'

const phoneRegex = /^[6-9]\d{9}$/
const normalizePhone = (v: string) => v.replace(/^(\+91|0)/, '').replace(/\s|-/g, '')
const phoneField = z
  .string()
  .trim()
  .transform(normalizePhone)
  .pipe(z.string().regex(phoneRegex, 'Enter a valid 10-digit mobile number'))

/* ------------------------------ Properties ------------------------------ */

export const createPropertySchema = z.object({
  name: z.string().trim().min(2).max(80),
  type: z.enum(['apartment', 'independent-house', 'pg', 'commercial']).default('apartment'),
  addressLine: z.string().trim().min(3).max(160),
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().max(60).optional().default(''),
  pincode: z.string().trim().max(10).optional().default(''),
  notes: z.string().trim().max(500).optional().default(''),
})

export const updatePropertySchema = createPropertySchema.partial()

/* -------------------------------- Units --------------------------------- */

export const createUnitSchema = z.object({
  label: z.string().trim().min(1).max(30),
  floor: z.coerce.number().int().min(-2).max(200).default(0),
  bedrooms: z.coerce.number().int().min(0).max(20).default(1),
  bathrooms: z.coerce.number().int().min(0).max(20).default(1),
  sizeSqft: z.coerce.number().min(0).max(100000).default(0),
  rentAmount: z.coerce.number().min(0).max(10000000),
  depositAmount: z.coerce.number().min(0).max(10000000).default(0),
  status: z.enum(['vacant', 'occupied', 'maintenance']).optional(),
})

export const updateUnitSchema = createUnitSchema.partial()

/* ------------------------------- Tenants -------------------------------- */

export const createTenantSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().toLowerCase().email(),
  phone: phoneField,
  password: z.string().min(8),
  unitId: z.string().min(1),
  moveInDate: z.coerce.date().optional(),
  agreementMonths: z.coerce.number().int().min(1).max(120).default(11),
  /** Override the unit's default rent/deposit for this tenancy, if provided. */
  monthlyRent: z.coerce.number().min(0).max(10000000).optional(),
  securityDeposit: z.coerce.number().min(0).max(10000000).optional(),
  occupation: z.string().trim().max(80).optional(),
  /** Generate the first (current-month) rent bill on creation. */
  generateFirstRent: z.boolean().default(true),
})

export const updateTenantSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  phone: phoneField.optional(),
  occupation: z.string().trim().max(80).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  monthlyRent: z.coerce.number().min(0).max(10000000).optional(),
  agreementEndsAt: z.coerce.date().optional(),
})

/* -------------------------------- Bills --------------------------------- */

export const createBillSchema = z.object({
  tenantId: z.string().min(1),
  type: z.enum(['rent', 'electricity', 'water', 'penalty']),
  period: z.string().trim().min(3).max(30),
  amount: z.coerce.number().min(0).max(10000000),
  dueDate: z.coerce.date(),
})

export const markPaidSchema = z.object({
  method: z.enum(['UPI', 'Card', 'Net Banking', 'Cash']).default('Cash'),
  paidOn: z.coerce.date().optional(),
})

/* ------------------------------ Complaints ------------------------------ */

export const updateComplaintSchema = z.object({
  status: z.enum(['open', 'in-progress', 'resolved', 'closed']).optional(),
  assignedTo: z.string().trim().max(80).nullable().optional(),
  resolutionNote: z.string().trim().max(1000).nullable().optional(),
})

/* ------------------------------- Notices -------------------------------- */

export const createNoticeSchema = z.object({
  title: z.string().trim().min(4).max(120),
  category: z.enum(['maintenance', 'rent', 'community', 'emergency']),
  excerpt: z.string().trim().min(4).max(200),
  body: z.string().trim().max(4000).optional().default(''),
  date: z.coerce.date().optional(),
})

export const updateNoticeSchema = createNoticeSchema.partial()

/* ------------------------------ Documents ------------------------------- */

export const createDocumentSchema = z.object({
  title: z.string().trim().min(2).max(120),
  category: z.enum(['agreement', 'receipt', 'id-proof', 'notice', 'other']).default('other'),
  fileName: z.string().trim().min(1).max(200),
  mimeType: z.string().trim().min(1).max(120),
  dataUrl: z.string().min(1),
  sizeBytes: z.coerce.number().min(0).default(0),
  audience: z.enum(['all', 'tenant']).default('all'),
  tenantId: z.string().nullable().optional(),
})

/* ------------------------------- Settings ------------------------------- */

export const updateSettingsSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  settings: z
    .object({
      currency: z.string().trim().max(8).optional(),
      dueDayOfMonth: z.coerce.number().int().min(1).max(28).optional(),
      penaltyPerDay: z.coerce.number().min(0).max(100000).optional(),
      graceDays: z.coerce.number().int().min(0).max(60).optional(),
      supportEmail: z.string().trim().max(120).optional(),
      supportPhone: z.string().trim().max(20).optional(),
    })
    .optional(),
})
