import { Types } from 'mongoose'
import { Tenancy } from '../models/Tenancy.js'
import { Bill } from '../models/Bill.js'

/**
 * Auto-provision a tenancy + opening bills for a new tenant so the app is
 * usable immediately (no seeded dummy data required). Everything is generated
 * relative to "now", so the data is always current.
 *
 * In a fuller build these values come from the admin/owner assigning a room
 * and generating bills (Phases 11–15); until then we create sensible defaults.
 *
 * Idempotent: does nothing if the user already has a tenancy.
 */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const PROPERTIES = ['Greenwood Residency', 'Lakeview Apartments', 'Sunrise Towers']

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const periodLabel = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
const receiptNo = (prefix: string) =>
  `${prefix}-${new Date().getFullYear()}-${rand(100000, 999999)}`

export async function provisionTenancy(userId: string) {
  const existing = await Tenancy.findOne({ user: userId })
  if (existing) return existing

  const uid = new Types.ObjectId(userId)
  const now = new Date()
  const dueDay = 5
  const monthlyRent = rand(12, 24) * 1000 // 12k–24k
  const floor = rand(1, 6)

  const movedInAt = new Date(now)
  movedInAt.setMonth(movedInAt.getMonth() - 3)
  const agreementEndsAt = new Date(movedInAt)
  agreementEndsAt.setMonth(agreementEndsAt.getMonth() + 11)

  const tenancy = await Tenancy.create({
    user: uid,
    propertyName: PROPERTIES[rand(0, PROPERTIES.length - 1)],
    roomNumber: `${floor}${String(rand(1, 20)).padStart(2, '0')}`,
    floor,
    occupancy: 'active',
    movedInAt,
    agreementEndsAt,
    monthlyRent,
    securityDeposit: monthlyRent * 2,
    dueDayOfMonth: dueDay,
    penaltyPerDay: 100,
    graceDays: 3,
  })

  const methods = ['UPI', 'Card', 'Net Banking'] as const
  const bills: Array<Record<string, unknown>> = []

  // Past 3 months of rent — paid.
  for (let i = 3; i >= 1; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, dueDay)
    bills.push({
      user: uid,
      type: 'rent',
      period: periodLabel(month),
      amount: monthlyRent,
      dueDate: month,
      paidOn: new Date(month.getFullYear(), month.getMonth(), dueDay - rand(0, 2)),
      method: methods[rand(0, methods.length - 1)],
      status: 'paid',
      receiptNo: receiptNo('RCPT'),
    })
  }

  // Current month rent — unpaid (effectiveStatus derives pending/overdue from the date).
  const thisMonthRentDue = new Date(now.getFullYear(), now.getMonth(), dueDay)
  bills.push({
    user: uid,
    type: 'rent',
    period: periodLabel(now),
    amount: monthlyRent,
    dueDate: thisMonthRentDue,
    paidOn: null,
    method: null,
    status: 'pending',
    receiptNo: receiptNo('RCPT'),
  })

  // Current utility bills — unpaid, due in the next couple of weeks.
  const elecDue = new Date(now)
  elecDue.setDate(elecDue.getDate() + 10)
  bills.push({
    user: uid,
    type: 'electricity',
    period: periodLabel(now),
    amount: rand(8, 18) * 100, // 800–1800
    dueDate: elecDue,
    paidOn: null,
    method: null,
    status: 'pending',
    receiptNo: receiptNo('ELEC'),
  })

  const waterDue = new Date(now)
  waterDue.setDate(waterDue.getDate() + 8)
  bills.push({
    user: uid,
    type: 'water',
    period: periodLabel(now),
    amount: rand(3, 7) * 100, // 300–700
    dueDate: waterDue,
    paidOn: null,
    method: null,
    status: 'pending',
    receiptNo: receiptNo('WATR'),
  })

  await Bill.insertMany(bills)
  return tenancy
}
