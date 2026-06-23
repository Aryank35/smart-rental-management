import type { Request, Response } from 'express'
import { Tenancy } from '../models/Tenancy.js'
import { Bill, effectiveStatus, type BillDoc } from '../models/Bill.js'
import { Notice } from '../models/Notice.js'
import { User } from '../models/User.js'
import { HttpError } from '../utils/http.js'

const TYPE_LABEL: Record<string, string> = {
  rent: 'Rent',
  electricity: 'Electricity',
  water: 'Water',
  penalty: 'Penalty',
}

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

function nextMonthDueDate(day: number) {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, day)
}
