import { pathToFileURL } from 'node:url'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import { User } from './models/User.js'
import { Tenancy } from './models/Tenancy.js'
import { Bill } from './models/Bill.js'
import { Complaint } from './models/Complaint.js'
import { Notice } from './models/Notice.js'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const METHODS = ['UPI', 'Card', 'Net Banking', 'Cash'] as const
const MONTHLY_RENT = 18500

/** Build 15 months of rent bills ending at July 2026 (newest first). */
function buildRentBills(userId: mongoose.Types.ObjectId) {
  const bills = []
  let year = 2026
  let month = 6 // July (0-indexed)

  for (let i = 0; i < 15; i++) {
    const seq = year * 12 + month
    const dueDate = new Date(year, month, 5)
    let status: 'paid' | 'pending' | 'overdue' = 'paid'
    let paidOn: Date | null = null
    let method: (typeof METHODS)[number] | null = null

    if (i === 0) {
      status = 'pending' // upcoming July
    } else if (i === 1) {
      status = 'overdue' // June unpaid
    } else {
      status = 'paid'
      paidOn = new Date(year, month, 3 + (seq % 5))
      method = METHODS[seq % METHODS.length]
    }

    bills.push({
      user: userId,
      type: 'rent' as const,
      period: `${MONTHS[month]} ${year}`,
      amount: MONTHLY_RENT,
      dueDate,
      paidOn,
      method,
      status,
      receiptNo: `RCPT-${year}-${String(i + 1).padStart(3, '0')}`,
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
  // Wipe existing data (demo only — never run against production data).
  await Promise.all([
    User.deleteMany({}),
    Tenancy.deleteMany({}),
    Bill.deleteMany({}),
    Complaint.deleteMany({}),
    Notice.deleteMany({}),
  ])

  const passwordHash = await bcrypt.hash('password1', 10)

  const tenant = await User.create({
    name: 'Aarav Sharma',
    email: 'tenant@tenantflow.app',
    phone: '9876543210',
    passwordHash,
    role: 'tenant',
    occupation: 'Software Engineer',
    profileComplete: true,
  })

  await User.create({
    name: 'Property Admin',
    email: 'admin@tenantflow.app',
    phone: '9876500000',
    passwordHash,
    role: 'admin',
    profileComplete: true,
  })

  await Tenancy.create({
    user: tenant._id,
    propertyName: 'Greenwood Residency',
    roomNumber: '204',
    floor: 2,
    occupancy: 'active',
    movedInAt: new Date('2025-04-01'),
    agreementEndsAt: new Date('2027-03-31'),
    monthlyRent: MONTHLY_RENT,
    securityDeposit: 37000,
    dueDayOfMonth: 5,
    penaltyPerDay: 100,
    graceDays: 3,
  })

  await Bill.insertMany([
    ...buildRentBills(tenant._id),
    {
      user: tenant._id,
      type: 'penalty',
      period: 'June 2026',
      amount: 300,
      dueDate: new Date('2026-06-08'),
      paidOn: null,
      method: null,
      status: 'overdue',
      receiptNo: 'RCPT-2026-PEN1',
    },
    {
      user: tenant._id,
      type: 'electricity',
      period: 'June 2026',
      amount: 1240,
      dueDate: new Date('2026-06-28'),
      paidOn: null,
      method: null,
      status: 'pending',
      receiptNo: 'RCPT-2026-ELE6',
    },
    {
      user: tenant._id,
      type: 'water',
      period: 'June 2026',
      amount: 450,
      dueDate: new Date('2026-06-20'),
      paidOn: null,
      method: null,
      status: 'overdue',
      receiptNo: 'RCPT-2026-WAT6',
    },
  ])

  await Notice.insertMany([
    {
      title: 'Water supply interruption on 25 Jun',
      category: 'maintenance',
      date: new Date('2026-06-22'),
      excerpt: 'Water will be unavailable from 10 AM–2 PM for tank cleaning.',
      readBy: [],
    },
    {
      title: 'Revised rent from next quarter',
      category: 'rent',
      date: new Date('2026-06-18'),
      excerpt: 'A 4% revision applies from 1 July as per your agreement.',
      readBy: [],
    },
    {
      title: 'Independence Day get-together',
      category: 'community',
      date: new Date('2026-06-15'),
      excerpt: 'Join residents at the terrace lounge on 15 Aug, 6 PM onwards.',
      readBy: [tenant._id],
    },
  ])

  await Complaint.insertMany([
    {
      user: tenant._id,
      title: 'Kitchen sink leakage',
      category: 'plumbing',
      priority: 'high',
      status: 'in-progress',
      description: 'The sink pipe is leaking under the counter and water collects after use.',
      location: 'Room 204 kitchen',
      referenceNo: 'CMP-2026-1042',
      raisedAt: new Date('2026-06-20T10:30:00'),
      updatedAt: new Date('2026-06-22T15:45:00'),
      assignedTo: 'Maintenance team',
    },
    {
      user: tenant._id,
      title: 'Corridor light flickering',
      category: 'electrical',
      priority: 'medium',
      status: 'open',
      description: 'The light outside room 204 keeps flickering at night.',
      location: 'Second floor corridor',
      referenceNo: 'CMP-2026-1088',
      raisedAt: new Date('2026-06-22T19:15:00'),
      updatedAt: new Date('2026-06-22T19:15:00'),
      assignedTo: null,
    },
    {
      user: tenant._id,
      title: 'Bathroom exhaust fan repaired',
      category: 'maintenance',
      priority: 'low',
      status: 'resolved',
      description: 'The exhaust fan had stopped working and needed inspection.',
      location: 'Room 204 bathroom',
      referenceNo: 'CMP-2026-0977',
      raisedAt: new Date('2026-06-12T09:00:00'),
      updatedAt: new Date('2026-06-14T12:20:00'),
      resolvedAt: new Date('2026-06-14T12:20:00'),
      assignedTo: 'Ravi Kumar',
    },
  ])

  return tenant
}

/** CLI entry point: connect, seed, disconnect. */
async function runSeedCli() {
  await connectDB()
  console.log('🌱 Seeding database…')
  await seedDatabase()
  console.log('✅ Seed complete.')
  console.log('   Tenant login: tenant@tenantflow.app / password1')
  console.log('   Admin login:  admin@tenantflow.app  / password1')
  await mongoose.disconnect()
  process.exit(0)
}

// Only run when executed directly (not when imported by a test).
const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (invokedDirectly) {
  runSeedCli().catch((err) => {
    console.error('❌ Seed failed:', err)
    process.exit(1)
  })
}
