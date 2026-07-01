import { pathToFileURL } from 'node:url'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import { User } from './models/User.js'
import { Organization } from './models/Organization.js'
import { Property } from './models/Property.js'
import { Unit } from './models/Unit.js'
import { Tenancy } from './models/Tenancy.js'
import { Bill } from './models/Bill.js'
import { Complaint } from './models/Complaint.js'
import { Notice } from './models/Notice.js'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const METHODS = ['UPI', 'Card', 'Net Banking', 'Cash'] as const

type Id = mongoose.Types.ObjectId

/** 15 months of rent bills ending at the current month (newest first). */
function buildRentBills(userId: Id, org: Id, monthlyRent: number, dueDay: number) {
  const bills = []
  const now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth()

  for (let i = 0; i < 15; i++) {
    const seq = year * 12 + month
    const dueDate = new Date(year, month, dueDay)
    let status: 'paid' | 'pending' | 'overdue' = 'paid'
    let paidOn: Date | null = null
    let method: (typeof METHODS)[number] | null = null

    if (i === 0) {
      status = 'pending' // current month
    } else if (i === 1) {
      status = 'overdue' // last month unpaid
    } else {
      status = 'paid'
      paidOn = new Date(year, month, 3 + (seq % 5))
      method = METHODS[seq % METHODS.length]
    }

    bills.push({
      user: userId,
      org,
      type: 'rent' as const,
      period: `${MONTHS[month]} ${year}`,
      amount: monthlyRent,
      dueDate,
      paidOn,
      method,
      status,
      receiptNo: `RCPT-${year}-${String(seq).slice(-4)}${i}`,
    })

    month -= 1
    if (month < 0) {
      month = 11
      year -= 1
    }
  }
  return bills
}

/** Wipe and re-create all demo data. Assumes an active Mongo connection. */
export async function seedDatabase() {
  await Promise.all([
    User.deleteMany({}),
    Organization.deleteMany({}),
    Property.deleteMany({}),
    Unit.deleteMany({}),
    Tenancy.deleteMany({}),
    Bill.deleteMany({}),
    Complaint.deleteMany({}),
    Notice.deleteMany({}),
  ])

  const passwordHash = await bcrypt.hash('TenantFlow@2026', 10)
  const now = new Date()

  // ---- Admin + organization ----
  const admin = await User.create({
    name: 'Meera Iyer',
    email: 'admin@tenantflow.app',
    phone: '9876500000',
    passwordHash,
    role: 'admin',
    profileComplete: true,
  })
  const org = await Organization.create({
    name: 'Greenwood Properties',
    owner: admin._id,
    settings: { currency: 'INR', dueDayOfMonth: 5, penaltyPerDay: 100, graceDays: 3 },
  })
  admin.org = org._id
  await admin.save()

  // ---- Properties ----
  const greenwood = await Property.create({
    org: org._id,
    name: 'Greenwood Residency',
    type: 'apartment',
    addressLine: '12 MG Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
  })
  const lakeview = await Property.create({
    org: org._id,
    name: 'Lakeview Apartments',
    type: 'apartment',
    addressLine: '45 Lake Street',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560034',
  })

  // ---- Units ----
  const mkUnit = (property: Id, label: string, floor: number, rent: number) =>
    Unit.create({
      org: org._id,
      property,
      label,
      floor,
      bedrooms: 2,
      bathrooms: 1,
      sizeSqft: 850,
      rentAmount: rent,
      depositAmount: rent * 2,
      status: 'vacant',
    })
  type UnitDocT = Awaited<ReturnType<typeof mkUnit>>

  const g101 = await mkUnit(greenwood._id, '101', 1, 16000)
  await mkUnit(greenwood._id, '102', 1, 16000)
  const g204 = await mkUnit(greenwood._id, '204', 2, 18500)
  await mkUnit(greenwood._id, '301', 3, 20000)
  const l_a1 = await mkUnit(lakeview._id, 'A-1', 1, 15000)
  await mkUnit(lakeview._id, 'A-2', 1, 15000)

  // ---- Tenant helper ----
  async function createTenant(opts: {
    name: string
    email: string
    phone: string
    unit: UnitDocT
    propertyName: string
    monthlyRent: number
  }) {
    const user = await User.create({
      name: opts.name,
      email: opts.email,
      phone: opts.phone,
      passwordHash,
      role: 'tenant',
      org: org._id,
      occupation: 'Software Engineer',
      profileComplete: true,
      status: 'active',
    })
    const movedInAt = new Date(now.getFullYear() - 1, now.getMonth(), 1)
    const agreementEndsAt = new Date(movedInAt)
    agreementEndsAt.setMonth(agreementEndsAt.getMonth() + 22)

    const tenancy = await Tenancy.create({
      user: user._id,
      org: org._id,
      property: opts.unit.property,
      unit: opts.unit._id,
      propertyName: opts.propertyName,
      roomNumber: opts.unit.label,
      floor: opts.unit.floor,
      occupancy: 'active',
      movedInAt,
      agreementEndsAt,
      monthlyRent: opts.monthlyRent,
      securityDeposit: opts.monthlyRent * 2,
      dueDayOfMonth: 5,
      penaltyPerDay: 100,
      graceDays: 3,
    })
    opts.unit.status = 'occupied'
    opts.unit.currentTenancy = tenancy._id
    await opts.unit.save()

    await Bill.insertMany(buildRentBills(user._id, org._id, opts.monthlyRent, 5))
    return { user, tenancy }
  }

  // ---- Primary demo tenant (rich data) ----
  const { user: aarav } = await createTenant({
    name: 'Aarav Sharma',
    email: 'tenant@tenantflow.app',
    phone: '9876543210',
    unit: g204,
    propertyName: greenwood.name,
    monthlyRent: 18500,
  })

  await Bill.insertMany([
    {
      user: aarav._id, org: org._id, type: 'penalty', period: `${MONTHS[now.getMonth()]} ${now.getFullYear()}`,
      amount: 300, dueDate: new Date(now.getFullYear(), now.getMonth(), 8),
      paidOn: null, method: null, status: 'overdue', receiptNo: 'RCPT-PEN-001',
    },
    {
      user: aarav._id, org: org._id, type: 'electricity', period: `${MONTHS[now.getMonth()]} ${now.getFullYear()}`,
      amount: 1240, dueDate: new Date(now.getFullYear(), now.getMonth(), 28),
      paidOn: null, method: null, status: 'pending', receiptNo: 'RCPT-ELE-006',
    },
    {
      user: aarav._id, org: org._id, type: 'water', period: `${MONTHS[now.getMonth()]} ${now.getFullYear()}`,
      amount: 450, dueDate: new Date(now.getFullYear(), now.getMonth(), 2),
      paidOn: null, method: null, status: 'overdue', receiptNo: 'RCPT-WAT-006',
    },
  ])

  await Complaint.insertMany([
    {
      user: aarav._id, org: org._id, title: 'Kitchen sink leakage', category: 'plumbing',
      priority: 'high', status: 'in-progress',
      description: 'The sink pipe is leaking under the counter and water collects after use.',
      location: 'Room 204 kitchen', referenceNo: 'CMP-2026-1042',
      raisedAt: new Date(now.getTime() - 5 * 86400000), updatedAt: new Date(now.getTime() - 2 * 86400000),
      assignedTo: 'Maintenance team',
    },
    {
      user: aarav._id, org: org._id, title: 'Corridor light flickering', category: 'electrical',
      priority: 'medium', status: 'open',
      description: 'The light outside room 204 keeps flickering at night.',
      location: 'Second floor corridor', referenceNo: 'CMP-2026-1088',
      raisedAt: new Date(now.getTime() - 1 * 86400000), updatedAt: new Date(now.getTime() - 1 * 86400000),
      assignedTo: null,
    },
  ])

  // ---- Second tenant (lighter data) ----
  await createTenant({
    name: 'Priya Nair',
    email: 'priya@tenantflow.app',
    phone: '9876511111',
    unit: g101,
    propertyName: greenwood.name,
    monthlyRent: 16000,
  })
  await createTenant({
    name: 'Rahul Verma',
    email: 'rahul@tenantflow.app',
    phone: '9876522222',
    unit: l_a1,
    propertyName: lakeview.name,
    monthlyRent: 15000,
  })

  // ---- Notices (org-scoped) ----
  await Notice.insertMany([
    {
      org: org._id, title: 'Water supply interruption on 25th', category: 'maintenance',
      date: new Date(now.getTime() - 3 * 86400000),
      excerpt: 'Water will be unavailable from 10 AM–2 PM for tank cleaning.',
      body: 'Please store water in advance. Normal supply resumes by 2 PM.',
      createdBy: admin._id, readBy: [],
    },
    {
      org: org._id, title: 'Revised rent from next quarter', category: 'rent',
      date: new Date(now.getTime() - 7 * 86400000),
      excerpt: 'A 4% revision applies from next quarter as per your agreement.',
      body: 'The revised amount reflects in your upcoming rent bills.',
      createdBy: admin._id, readBy: [aarav._id],
    },
    {
      org: org._id, title: 'Festive get-together', category: 'community',
      date: new Date(now.getTime() - 10 * 86400000),
      excerpt: 'Join residents at the terrace lounge this weekend, 6 PM onwards.',
      body: 'Snacks and music provided. Families welcome.',
      createdBy: admin._id, readBy: [],
    },
  ])

  return { admin, org }
}

/** CLI entry point: connect, seed, disconnect. */
async function runSeedCli() {
  await connectDB()
  console.log('🌱 Seeding database…')
  await seedDatabase()
  console.log('✅ Seed complete.')
  console.log('   Admin login:  admin@tenantflow.app  / TenantFlow@2026')
  console.log('   Tenant login: tenant@tenantflow.app / TenantFlow@2026')
  await mongoose.disconnect()
  process.exit(0)
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (invokedDirectly) {
  runSeedCli().catch((err) => {
    console.error('❌ Seed failed:', err)
    process.exit(1)
  })
}
