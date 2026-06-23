import type { Request, Response } from 'express'
import { z } from 'zod'
import { Tenancy } from '../models/Tenancy.js'
import { Bill, effectiveStatus, type BillDoc } from '../models/Bill.js'
import { Complaint } from '../models/Complaint.js'
import { Notice } from '../models/Notice.js'
import { User } from '../models/User.js'
import { HttpError } from '../utils/http.js'

const TYPE_LABEL: Record<string, string> = {
  rent: 'Rent',
  electricity: 'Electricity',
  water: 'Water',
  penalty: 'Penalty',
}

const paySchema = z.object({
  method: z.enum(['UPI', 'Card', 'Net Banking', 'Cash']),
  /** Specific bills to pay. If omitted, `scope` decides the set. */
  billIds: z.array(z.string()).optional(),
  scope: z.enum(['rent', 'utilities', 'all']).optional(),
})

const createComplaintSchema = z.object({
  title: z.string().trim().min(4).max(80),
  category: z.enum(['maintenance', 'plumbing', 'electrical', 'cleaning', 'security', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  location: z.string().trim().min(2).max(80),
  description: z.string().trim().min(10).max(1000),
})

/** "June 2026" + type "rent" → "June Rent". */
function billLabel(bill: BillDoc) {
  const month = bill.period.split(' ')[0]
  return `${month} ${TYPE_LABEL[bill.type] ?? ''}`.trim()
}

function isUnpaid(bill: BillDoc) {
  return effectiveStatus(bill) !== 'paid'
}

function isOverdue(bill: BillDoc) {
  return effectiveStatus(bill) === 'overdue'
}

async function getTenancyOrThrow(userId: string) {
  const tenancy = await Tenancy.findOne({ user: userId })
  if (!tenancy) throw new HttpError(404, 'No tenancy found for this account.')
  return tenancy
}

export async function getDashboard(req: Request, res: Response) {
  const userId = req.auth!.sub
  const [user, tenancy, bills, notices] = await Promise.all([
    User.findById(userId),
    getTenancyOrThrow(userId),
    Bill.find({ user: userId }).sort({ dueDate: -1 }),
    Notice.find().sort({ date: -1 }).limit(5),
  ])
  if (!user) throw new HttpError(404, 'User not found.')

  const latestByType = (type: string) =>
    bills.find((b) => b.type === type)?.amount ?? 0

  // "Dues" = amounts already past their due date (not future pending bills).
  const outstandingDues = bills.filter(isOverdue).reduce((sum, b) => sum + b.amount, 0)

  const upcomingPayments = bills
    .filter(isUnpaid)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .map((b) => ({
      id: b._id.toString(),
      label: billLabel(b),
      dueDate: b.dueDate.toISOString(),
      amount: b.amount,
      status: effectiveStatus(b),
    }))

  const recentPayments = bills
    .filter((b) => effectiveStatus(b) === 'paid' && b.paidOn)
    .sort((a, b) => (b.paidOn!.getTime() - a.paidOn!.getTime()))
    .slice(0, 5)
    .map((b) => ({
      id: b._id.toString(),
      label: billLabel(b),
      date: b.paidOn!.toISOString(),
      amount: b.amount,
      method: b.method ?? 'UPI',
      status: effectiveStatus(b),
    }))

  const recentNotices = notices.slice(0, 3).map((n) => ({
    id: n._id.toString(),
    title: n.title,
    category: n.category,
    date: n.date.toISOString(),
    excerpt: n.excerpt,
    read: n.readBy?.some((id) => id.toString() === userId) ?? false,
  }))

  res.json({
    tenancy: {
      tenantName: user.name,
      propertyName: tenancy.propertyName,
      roomNumber: tenancy.roomNumber,
      floor: tenancy.floor,
      occupancy: tenancy.occupancy,
      movedInAt: tenancy.movedInAt.toISOString(),
      agreementEndsAt: tenancy.agreementEndsAt.toISOString(),
    },
    summary: {
      monthlyRent: tenancy.monthlyRent,
      electricityBill: latestByType('electricity'),
      waterBill: latestByType('water'),
      outstandingDues,
      securityDeposit: tenancy.securityDeposit,
    },
    upcomingPayments,
    recentPayments,
    recentNotices,
  })
}

export async function getRentDetails(req: Request, res: Response) {
  const userId = req.auth!.sub
  const [tenancy, bills] = await Promise.all([
    getTenancyOrThrow(userId),
    Bill.find({ user: userId, type: { $in: ['rent', 'penalty'] } }),
  ])

  const overdue = bills.filter(isOverdue)
  const outstandingBalance = overdue.reduce((sum, b) => sum + b.amount, 0)
  const accruedPenalty = overdue
    .filter((b) => b.type === 'penalty')
    .reduce((sum, b) => sum + b.amount, 0)

  const nextRentDue = bills
    .filter((b) => b.type === 'rent' && isUnpaid(b))
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0]

  const nextDueDate =
    nextRentDue?.dueDate.toISOString() ??
    nextMonthDueDate(tenancy.dueDayOfMonth).toISOString()

  res.json({
    monthlyRent: tenancy.monthlyRent,
    securityDeposit: tenancy.securityDeposit,
    dueDayOfMonth: tenancy.dueDayOfMonth,
    nextDueDate,
    outstandingBalance,
    penalty: {
      perDay: tenancy.penaltyPerDay,
      graceDays: tenancy.graceDays,
      accrued: accruedPenalty,
    },
  })
}

export async function getRentHistory(req: Request, res: Response) {
  const userId = req.auth!.sub
  const bills = await Bill.find({ user: userId, type: 'rent' }).sort({ dueDate: -1 })

  res.json(
    bills.map((b) => ({
      id: b._id.toString(),
      receiptNo: b.receiptNo,
      period: b.period,
      dueDate: b.dueDate.toISOString(),
      paidOn: b.paidOn ? b.paidOn.toISOString() : null,
      amount: b.amount,
      method: b.method ?? null,
      status: effectiveStatus(b),
    }))
  )
}

export async function getUtilityBills(req: Request, res: Response) {
  const userId = req.auth!.sub
  await getTenancyOrThrow(userId)

  const bills = await Bill.find({
    user: userId,
    type: { $in: ['electricity', 'water'] },
  }).sort({ dueDate: -1 })

  const billRows = bills.map((b) => ({
    id: b._id.toString(),
    type: b.type,
    period: b.period,
    dueDate: b.dueDate.toISOString(),
    paidOn: b.paidOn ? b.paidOn.toISOString() : null,
    amount: b.amount,
    method: b.method ?? null,
    status: effectiveStatus(b),
    receiptNo: b.receiptNo,
  }))

  const unpaidBills = bills.filter(isUnpaid)
  const overdueBills = bills.filter(isOverdue)
  const latestByType = (type: 'electricity' | 'water') =>
    bills.find((b) => b.type === type)?.amount ?? 0

  res.json({
    summary: {
      electricity: latestByType('electricity'),
      water: latestByType('water'),
      unpaidTotal: unpaidBills.reduce((sum, b) => sum + b.amount, 0),
      overdueTotal: overdueBills.reduce((sum, b) => sum + b.amount, 0),
    },
    bills: billRows,
  })
}

export async function payBills(req: Request, res: Response) {
  const userId = req.auth!.sub
  await getTenancyOrThrow(userId)

  const { method, billIds, scope } = paySchema.parse(req.body)

  const all = await Bill.find({ user: userId })
  const unpaid = all.filter(isUnpaid)

  // Resolve the target set so the amount charged matches what each page shows:
  //  • rent page shows the OVERDUE rent + penalty balance
  //  • bills page shows ALL unpaid (pending + overdue) utilities
  let targets: BillDoc[]
  if (billIds && billIds.length > 0) {
    const wanted = new Set(billIds)
    targets = unpaid.filter((b) => wanted.has(b._id.toString()))
  } else if (scope === 'rent') {
    targets = all.filter((b) => (b.type === 'rent' || b.type === 'penalty') && isOverdue(b))
  } else if (scope === 'utilities') {
    targets = unpaid.filter((b) => b.type === 'electricity' || b.type === 'water')
  } else {
    targets = unpaid // 'all'
  }

  if (targets.length === 0) {
    throw new HttpError(400, 'No outstanding bills to pay.')
  }

  const paidOn = new Date()
  await Bill.updateMany(
    { _id: { $in: targets.map((b) => b._id) } },
    { $set: { status: 'paid', paidOn, method } }
  )

  const totalPaid = targets.reduce((sum, b) => sum + b.amount, 0)
  res.json({
    paidCount: targets.length,
    totalPaid,
    method,
    paidOn: paidOn.toISOString(),
    receiptNos: targets.map((b) => b.receiptNo),
  })
}

export async function getComplaints(req: Request, res: Response) {
  const userId = req.auth!.sub
  await getTenancyOrThrow(userId)

  const complaints = await Complaint.find({ user: userId }).sort({ raisedAt: -1 })

  res.json(
    complaints.map((c) => ({
      id: c._id.toString(),
      title: c.title,
      category: c.category,
      priority: c.priority,
      status: c.status,
      description: c.description,
      location: c.location,
      referenceNo: c.referenceNo,
      raisedAt: c.raisedAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      resolvedAt: c.resolvedAt ? c.resolvedAt.toISOString() : null,
      assignedTo: c.assignedTo ?? null,
    }))
  )
}

export async function createComplaint(req: Request, res: Response) {
  const userId = req.auth!.sub
  await getTenancyOrThrow(userId)

  const input = createComplaintSchema.parse(req.body)
  const now = new Date()
  const referenceNo = `CMP-${now.getFullYear()}-${Date.now().toString().slice(-6)}`

  const complaint = await Complaint.create({
    user: userId,
    ...input,
    status: 'open',
    referenceNo,
    raisedAt: now,
    updatedAt: now,
  })

  res.status(201).json({
    id: complaint._id.toString(),
    title: complaint.title,
    category: complaint.category,
    priority: complaint.priority,
    status: complaint.status,
    description: complaint.description,
    location: complaint.location,
    referenceNo: complaint.referenceNo,
    raisedAt: complaint.raisedAt.toISOString(),
    updatedAt: complaint.updatedAt.toISOString(),
    resolvedAt: null,
    assignedTo: null,
  })
}

function nextMonthDueDate(day: number) {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, day)
}
