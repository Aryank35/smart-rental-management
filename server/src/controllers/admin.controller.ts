import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { Types } from 'mongoose'
import { Organization, toPublicOrg } from '../models/Organization.js'
import { Property } from '../models/Property.js'
import { Unit } from '../models/Unit.js'
import { Tenancy } from '../models/Tenancy.js'
import { Bill, effectiveStatus } from '../models/Bill.js'
import { Complaint } from '../models/Complaint.js'
import { Notice } from '../models/Notice.js'
import { DocumentModel } from '../models/Document.js'
import { User } from '../models/User.js'
import { HttpError } from '../utils/http.js'
import {
  createBillSchema,
  createDocumentSchema,
  createNoticeSchema,
  createPropertySchema,
  createTenantSchema,
  createUnitSchema,
  markPaidSchema,
  updateComplaintSchema,
  updateNoticeSchema,
  updatePropertySchema,
  updateSettingsSchema,
  updateTenantSchema,
  updateUnitSchema,
} from '../validation/admin.js'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** The org the authenticated admin belongs to. */
function orgId(req: Request): Types.ObjectId {
  const org = req.auth?.org
  if (!org) throw new HttpError(401, 'No organization on this session. Please sign in again.')
  return new Types.ObjectId(org)
}

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const periodLabel = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
const receiptNo = (prefix: string) => `${prefix}-${new Date().getFullYear()}-${rand(100000, 999999)}`

/* ============================== Dashboard ============================== */

export async function getDashboard(req: Request, res: Response) {
  const org = orgId(req)
  const [org_, properties, units, tenants, bills, openComplaints] = await Promise.all([
    Organization.findById(org),
    Property.countDocuments({ org }),
    Unit.find({ org }),
    User.countDocuments({ org, role: 'tenant', status: 'active' }),
    Bill.find({ org }),
    Complaint.countDocuments({ org, status: { $in: ['open', 'in-progress'] } }),
  ])

  const occupied = units.filter((u) => u.status === 'occupied').length
  const vacant = units.filter((u) => u.status === 'vacant').length
  const maintenance = units.filter((u) => u.status === 'maintenance').length
  const occupancyRate = units.length ? Math.round((occupied / units.length) * 100) : 0

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const paid = bills.filter((b) => effectiveStatus(b) === 'paid' && b.paidOn)
  const collectedThisMonth = paid
    .filter((b) => b.paidOn! >= startOfMonth)
    .reduce((s, b) => s + b.amount, 0)

  const unpaid = bills.filter((b) => effectiveStatus(b) !== 'paid')
  const totalOutstanding = unpaid.reduce((s, b) => s + b.amount, 0)
  const overdueAmount = bills
    .filter((b) => effectiveStatus(b) === 'overdue')
    .reduce((s, b) => s + b.amount, 0)

  // Collections for the last 6 months (oldest → newest) for the chart.
  const revenueByMonth = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1)
    const amount = paid
      .filter((b) => b.paidOn! >= d && b.paidOn! < next)
      .reduce((s, b) => s + b.amount, 0)
    return { month: MONTHS[d.getMonth()].slice(0, 3), amount }
  })

  const recentPayments = paid
    .sort((a, b) => b.paidOn!.getTime() - a.paidOn!.getTime())
    .slice(0, 6)

  // Resolve tenant names for the recent-payments feed.
  const payerIds = [...new Set(recentPayments.map((b) => b.user.toString()))]
  const payers = await User.find({ _id: { $in: payerIds } })
  const nameById = new Map(payers.map((u) => [u._id.toString(), u.name]))

  res.json({
    org: org_ ? toPublicOrg(org_) : null,
    stats: {
      properties,
      units: units.length,
      occupied,
      vacant,
      maintenance,
      occupancyRate,
      tenants,
      collectedThisMonth,
      totalOutstanding,
      overdueAmount,
      openComplaints,
    },
    revenueByMonth,
    recentPayments: recentPayments.map((b) => ({
      id: b._id.toString(),
      tenantName: nameById.get(b.user.toString()) ?? 'Tenant',
      type: b.type,
      period: b.period,
      amount: b.amount,
      method: b.method ?? 'Cash',
      paidOn: b.paidOn!.toISOString(),
    })),
  })
}

/* ============================== Properties ============================= */

export async function listProperties(req: Request, res: Response) {
  const org = orgId(req)
  const [properties, units] = await Promise.all([
    Property.find({ org }).sort({ createdAt: -1 }),
    Unit.find({ org }),
  ])

  res.json(
    properties.map((p) => {
      const own = units.filter((u) => u.property.toString() === p._id.toString())
      const occupied = own.filter((u) => u.status === 'occupied').length
      return {
        id: p._id.toString(),
        name: p.name,
        type: p.type,
        addressLine: p.addressLine,
        city: p.city,
        state: p.state,
        pincode: p.pincode,
        notes: p.notes,
        unitCount: own.length,
        occupiedCount: occupied,
        vacantCount: own.length - occupied,
        createdAt: p.createdAt.toISOString(),
      }
    })
  )
}

export async function createProperty(req: Request, res: Response) {
  const org = orgId(req)
  const input = createPropertySchema.parse(req.body)
  const property = await Property.create({ org, ...input })
  res.status(201).json({ id: property._id.toString(), name: property.name })
}

export async function getProperty(req: Request, res: Response) {
  const org = orgId(req)
  const property = await Property.findOne({ _id: req.params.id, org })
  if (!property) throw new HttpError(404, 'Property not found.')

  const units = await Unit.find({ property: property._id, org }).sort({ label: 1 })
  const tenancies = await Tenancy.find({ property: property._id, org })
  const tenantByUnit = new Map(
    tenancies.filter((t) => t.unit).map((t) => [t.unit!.toString(), t])
  )
  const tenantUserIds = tenancies.map((t) => t.user)
  const users = await User.find({ _id: { $in: tenantUserIds } })
  const userById = new Map(users.map((u) => [u._id.toString(), u]))

  res.json({
    id: property._id.toString(),
    name: property.name,
    type: property.type,
    addressLine: property.addressLine,
    city: property.city,
    state: property.state,
    pincode: property.pincode,
    notes: property.notes,
    units: units.map((u) => {
      const tenancy = tenantByUnit.get(u._id.toString())
      const tenant = tenancy ? userById.get(tenancy.user.toString()) : null
      return {
        id: u._id.toString(),
        label: u.label,
        floor: u.floor,
        bedrooms: u.bedrooms,
        bathrooms: u.bathrooms,
        sizeSqft: u.sizeSqft,
        rentAmount: u.rentAmount,
        depositAmount: u.depositAmount,
        status: u.status,
        tenantName: tenant?.name ?? null,
        tenancyId: tenancy?._id.toString() ?? null,
      }
    }),
  })
}

export async function updateProperty(req: Request, res: Response) {
  const org = orgId(req)
  const input = updatePropertySchema.parse(req.body)
  const property = await Property.findOneAndUpdate({ _id: req.params.id, org }, input, { new: true })
  if (!property) throw new HttpError(404, 'Property not found.')
  res.json({ id: property._id.toString() })
}

export async function deleteProperty(req: Request, res: Response) {
  const org = orgId(req)
  const property = await Property.findOne({ _id: req.params.id, org })
  if (!property) throw new HttpError(404, 'Property not found.')

  const occupied = await Unit.countDocuments({ property: property._id, org, status: 'occupied' })
  if (occupied > 0) {
    throw new HttpError(409, 'Offboard the tenants in this property before deleting it.')
  }

  await Unit.deleteMany({ property: property._id, org })
  await property.deleteOne()
  res.status(204).end()
}

/* ================================ Units =============================== */

export async function createUnit(req: Request, res: Response) {
  const org = orgId(req)
  const property = await Property.findOne({ _id: req.params.id, org })
  if (!property) throw new HttpError(404, 'Property not found.')

  const input = createUnitSchema.parse(req.body)
  const unit = await Unit.create({
    org,
    property: property._id,
    ...input,
    status: input.status ?? 'vacant',
  })
  res.status(201).json({ id: unit._id.toString() })
}

export async function updateUnit(req: Request, res: Response) {
  const org = orgId(req)
  const input = updateUnitSchema.parse(req.body)
  const unit = await Unit.findOne({ _id: req.params.id, org })
  if (!unit) throw new HttpError(404, 'Unit not found.')

  // Don't let an occupied unit be flipped to vacant/maintenance directly.
  if (input.status && input.status !== 'occupied' && unit.status === 'occupied') {
    throw new HttpError(409, 'This unit is occupied. Offboard the tenant to change its status.')
  }
  Object.assign(unit, input)
  await unit.save()
  res.json({ id: unit._id.toString() })
}

export async function deleteUnit(req: Request, res: Response) {
  const org = orgId(req)
  const unit = await Unit.findOne({ _id: req.params.id, org })
  if (!unit) throw new HttpError(404, 'Unit not found.')
  if (unit.status === 'occupied') {
    throw new HttpError(409, 'Offboard the tenant before deleting this unit.')
  }
  await unit.deleteOne()
  res.status(204).end()
}

/* =============================== Tenants ============================== */

export async function listTenants(req: Request, res: Response) {
  const org = orgId(req)
  const tenancies = await Tenancy.find({ org }).sort({ createdAt: -1 })
  const userIds = tenancies.map((t) => t.user)
  const [users, bills] = await Promise.all([
    User.find({ _id: { $in: userIds } }),
    Bill.find({ org }),
  ])
  const userById = new Map(users.map((u) => [u._id.toString(), u]))

  const duesByUser = new Map<string, number>()
  for (const b of bills) {
    if (effectiveStatus(b) !== 'paid') {
      const key = b.user.toString()
      duesByUser.set(key, (duesByUser.get(key) ?? 0) + b.amount)
    }
  }

  res.json(
    tenancies.map((t) => {
      const user = userById.get(t.user.toString())
      return {
        id: t._id.toString(),
        userId: t.user.toString(),
        name: user?.name ?? 'Unknown',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
        status: user?.status ?? 'active',
        propertyName: t.propertyName,
        roomNumber: t.roomNumber,
        floor: t.floor,
        monthlyRent: t.monthlyRent,
        occupancy: t.occupancy,
        movedInAt: t.movedInAt.toISOString(),
        agreementEndsAt: t.agreementEndsAt.toISOString(),
        outstanding: duesByUser.get(t.user.toString()) ?? 0,
      }
    })
  )
}

export async function createTenant(req: Request, res: Response) {
  const org = orgId(req)
  const input = createTenantSchema.parse(req.body)

  const unit = await Unit.findOne({ _id: input.unitId, org }).populate<{ property: { name: string } }>(
    'property'
  )
  if (!unit) throw new HttpError(404, 'Unit not found.')
  if (unit.status === 'occupied') throw new HttpError(409, 'That unit is already occupied.')

  const dupe = await User.findOne({ $or: [{ email: input.email }, { phone: input.phone }] })
  if (dupe) throw new HttpError(409, 'A user with this email or phone already exists.')

  const property = await Property.findById(unit.property).select('name')
  const passwordHash = await bcrypt.hash(input.password, 10)
  const monthlyRent = input.monthlyRent ?? unit.rentAmount
  const securityDeposit = input.securityDeposit ?? unit.depositAmount
  const orgDoc = await Organization.findById(org)
  const dueDay = orgDoc?.settings?.dueDayOfMonth ?? 5

  const movedInAt = input.moveInDate ?? new Date()
  const agreementEndsAt = new Date(movedInAt)
  agreementEndsAt.setMonth(agreementEndsAt.getMonth() + input.agreementMonths)

  const user = await User.create({
    name: input.name,
    email: input.email,
    phone: input.phone,
    passwordHash,
    role: 'tenant',
    org,
    occupation: input.occupation,
    profileComplete: true,
    status: 'active',
  })

  const tenancy = await Tenancy.create({
    user: user._id,
    org,
    property: unit.property,
    unit: unit._id,
    propertyName: property?.name ?? 'Property',
    roomNumber: unit.label,
    floor: unit.floor,
    occupancy: 'active',
    movedInAt,
    agreementEndsAt,
    monthlyRent,
    securityDeposit,
    dueDayOfMonth: dueDay,
    penaltyPerDay: orgDoc?.settings?.penaltyPerDay ?? 100,
    graceDays: orgDoc?.settings?.graceDays ?? 3,
  })

  unit.status = 'occupied'
  unit.currentTenancy = tenancy._id
  await unit.save()

  if (input.generateFirstRent) {
    const now = new Date()
    await Bill.create({
      user: user._id,
      org,
      type: 'rent',
      period: periodLabel(now),
      amount: monthlyRent,
      dueDate: new Date(now.getFullYear(), now.getMonth(), dueDay),
      status: 'pending',
      receiptNo: receiptNo('RCPT'),
    })
  }

  res.status(201).json({ id: tenancy._id.toString(), userId: user._id.toString() })
}

export async function getTenant(req: Request, res: Response) {
  const org = orgId(req)
  const tenancy = await Tenancy.findOne({ _id: req.params.id, org })
  if (!tenancy) throw new HttpError(404, 'Tenant not found.')

  const [user, bills, complaints] = await Promise.all([
    User.findById(tenancy.user),
    Bill.find({ user: tenancy.user, org }).sort({ dueDate: -1 }),
    Complaint.find({ user: tenancy.user, org }).sort({ raisedAt: -1 }),
  ])

  res.json({
    id: tenancy._id.toString(),
    userId: tenancy.user.toString(),
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    status: user?.status ?? 'active',
    occupation: user?.occupation ?? null,
    emergencyContact: user?.emergencyContact ?? null,
    propertyName: tenancy.propertyName,
    roomNumber: tenancy.roomNumber,
    floor: tenancy.floor,
    occupancy: tenancy.occupancy,
    monthlyRent: tenancy.monthlyRent,
    securityDeposit: tenancy.securityDeposit,
    movedInAt: tenancy.movedInAt.toISOString(),
    agreementEndsAt: tenancy.agreementEndsAt.toISOString(),
    bills: bills.map((b) => ({
      id: b._id.toString(),
      type: b.type,
      period: b.period,
      amount: b.amount,
      dueDate: b.dueDate.toISOString(),
      paidOn: b.paidOn ? b.paidOn.toISOString() : null,
      method: b.method ?? null,
      status: effectiveStatus(b),
      receiptNo: b.receiptNo,
    })),
    complaints: complaints.map((c) => ({
      id: c._id.toString(),
      title: c.title,
      category: c.category,
      priority: c.priority,
      status: c.status,
      referenceNo: c.referenceNo,
      raisedAt: c.raisedAt.toISOString(),
    })),
  })
}

export async function updateTenant(req: Request, res: Response) {
  const org = orgId(req)
  const input = updateTenantSchema.parse(req.body)
  const tenancy = await Tenancy.findOne({ _id: req.params.id, org })
  if (!tenancy) throw new HttpError(404, 'Tenant not found.')

  if (input.monthlyRent !== undefined) tenancy.monthlyRent = input.monthlyRent
  if (input.agreementEndsAt) tenancy.agreementEndsAt = input.agreementEndsAt
  await tenancy.save()

  if (input.name || input.phone || input.occupation || input.status) {
    const user = await User.findById(tenancy.user)
    if (user) {
      if (input.name) user.name = input.name
      if (input.phone) user.phone = input.phone
      if (input.occupation !== undefined) user.occupation = input.occupation
      if (input.status) user.status = input.status
      await user.save()
    }
  }
  res.json({ id: tenancy._id.toString() })
}

/** Vacate a tenant: free the unit, mark tenancy vacated and the login inactive. */
export async function offboardTenant(req: Request, res: Response) {
  const org = orgId(req)
  const tenancy = await Tenancy.findOne({ _id: req.params.id, org })
  if (!tenancy) throw new HttpError(404, 'Tenant not found.')

  if (tenancy.unit) {
    await Unit.updateOne(
      { _id: tenancy.unit, org },
      { $set: { status: 'vacant', currentTenancy: null } }
    )
  }
  tenancy.occupancy = 'vacated'
  await tenancy.save()
  await User.updateOne({ _id: tenancy.user }, { $set: { status: 'inactive' } })
  res.json({ id: tenancy._id.toString() })
}

/* =============================== Billing ============================== */

export async function listBills(req: Request, res: Response) {
  const org = orgId(req)
  const bills = await Bill.find({ org }).sort({ dueDate: -1 }).limit(500)
  const userIds = [...new Set(bills.map((b) => b.user.toString()))]
  const users = await User.find({ _id: { $in: userIds } })
  const nameById = new Map(users.map((u) => [u._id.toString(), u.name]))

  res.json(
    bills.map((b) => ({
      id: b._id.toString(),
      tenantId: b.user.toString(),
      tenantName: nameById.get(b.user.toString()) ?? 'Tenant',
      type: b.type,
      period: b.period,
      amount: b.amount,
      dueDate: b.dueDate.toISOString(),
      paidOn: b.paidOn ? b.paidOn.toISOString() : null,
      method: b.method ?? null,
      status: effectiveStatus(b),
      receiptNo: b.receiptNo,
    }))
  )
}

export async function createBill(req: Request, res: Response) {
  const org = orgId(req)
  const input = createBillSchema.parse(req.body)

  const tenancy = await Tenancy.findOne({ user: input.tenantId, org })
  if (!tenancy) throw new HttpError(404, 'Tenant not found in your organization.')

  const bill = await Bill.create({
    user: input.tenantId,
    org,
    type: input.type,
    period: input.period,
    amount: input.amount,
    dueDate: input.dueDate,
    status: 'pending',
    receiptNo: receiptNo(input.type === 'rent' ? 'RCPT' : input.type.slice(0, 4).toUpperCase()),
  })
  res.status(201).json({ id: bill._id.toString() })
}

/** Generate the current-month rent bill for every active tenancy that lacks one. */
export async function generateRent(req: Request, res: Response) {
  const org = orgId(req)
  const now = new Date()
  const period = periodLabel(now)
  const tenancies = await Tenancy.find({ org, occupancy: 'active' })

  const existing = await Bill.find({ org, type: 'rent', period })
  const haveRent = new Set(existing.map((b) => b.user.toString()))

  const toCreate = tenancies
    .filter((t) => !haveRent.has(t.user.toString()))
    .map((t) => ({
      user: t.user,
      org,
      type: 'rent' as const,
      period,
      amount: t.monthlyRent,
      dueDate: new Date(now.getFullYear(), now.getMonth(), t.dueDayOfMonth ?? 5),
      status: 'pending' as const,
      receiptNo: receiptNo('RCPT'),
    }))

  if (toCreate.length) await Bill.insertMany(toCreate)
  res.json({ generated: toCreate.length, period })
}

export async function markBillPaid(req: Request, res: Response) {
  const org = orgId(req)
  const input = markPaidSchema.parse(req.body)
  const bill = await Bill.findOne({ _id: req.params.id, org })
  if (!bill) throw new HttpError(404, 'Bill not found.')

  bill.status = 'paid'
  bill.paidOn = input.paidOn ?? new Date()
  bill.method = input.method
  await bill.save()
  res.json({ id: bill._id.toString() })
}

export async function deleteBill(req: Request, res: Response) {
  const org = orgId(req)
  const bill = await Bill.findOneAndDelete({ _id: req.params.id, org })
  if (!bill) throw new HttpError(404, 'Bill not found.')
  res.status(204).end()
}

/* =============================== Payments ============================= */

export async function listPayments(req: Request, res: Response) {
  const org = orgId(req)
  const bills = await Bill.find({ org, paidOn: { $ne: null } })
    .sort({ paidOn: -1 })
    .limit(500)
  const userIds = [...new Set(bills.map((b) => b.user.toString()))]
  const users = await User.find({ _id: { $in: userIds } })
  const nameById = new Map(users.map((u) => [u._id.toString(), u.name]))

  res.json(
    bills.map((b) => ({
      id: b._id.toString(),
      tenantName: nameById.get(b.user.toString()) ?? 'Tenant',
      type: b.type,
      period: b.period,
      amount: b.amount,
      method: b.method ?? 'Cash',
      paidOn: b.paidOn!.toISOString(),
      receiptNo: b.receiptNo,
    }))
  )
}

/* ============================== Complaints ============================ */

export async function listComplaints(req: Request, res: Response) {
  const org = orgId(req)
  const complaints = await Complaint.find({ org }).sort({ raisedAt: -1 })
  const userIds = [...new Set(complaints.map((c) => c.user.toString()))]
  const users = await User.find({ _id: { $in: userIds } })
  const nameById = new Map(users.map((u) => [u._id.toString(), u.name]))

  res.json(
    complaints.map((c) => ({
      id: c._id.toString(),
      tenantName: nameById.get(c.user.toString()) ?? 'Tenant',
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
      resolutionNote: c.resolutionNote ?? null,
    }))
  )
}

export async function updateComplaint(req: Request, res: Response) {
  const org = orgId(req)
  const input = updateComplaintSchema.parse(req.body)
  const complaint = await Complaint.findOne({ _id: req.params.id, org })
  if (!complaint) throw new HttpError(404, 'Complaint not found.')

  if (input.status) {
    complaint.status = input.status
    complaint.resolvedAt =
      input.status === 'resolved' || input.status === 'closed' ? new Date() : null
  }
  if (input.assignedTo !== undefined) complaint.assignedTo = input.assignedTo
  if (input.resolutionNote !== undefined) complaint.resolutionNote = input.resolutionNote
  complaint.updatedAt = new Date()
  await complaint.save()
  res.json({ id: complaint._id.toString() })
}

/* =============================== Notices ============================= */

export async function listNotices(req: Request, res: Response) {
  const org = orgId(req)
  const notices = await Notice.find({ org }).sort({ date: -1 })
  res.json(
    notices.map((n) => ({
      id: n._id.toString(),
      title: n.title,
      category: n.category,
      date: n.date.toISOString(),
      excerpt: n.excerpt,
      body: n.body ?? '',
      readCount: n.readBy?.length ?? 0,
    }))
  )
}

export async function createNotice(req: Request, res: Response) {
  const org = orgId(req)
  const input = createNoticeSchema.parse(req.body)
  const notice = await Notice.create({
    org,
    title: input.title,
    category: input.category,
    excerpt: input.excerpt,
    body: input.body,
    date: input.date ?? new Date(),
    createdBy: req.auth!.sub,
    readBy: [],
  })
  res.status(201).json({ id: notice._id.toString() })
}

export async function updateNotice(req: Request, res: Response) {
  const org = orgId(req)
  const input = updateNoticeSchema.parse(req.body)
  const notice = await Notice.findOneAndUpdate({ _id: req.params.id, org }, input, { new: true })
  if (!notice) throw new HttpError(404, 'Notice not found.')
  res.json({ id: notice._id.toString() })
}

export async function deleteNotice(req: Request, res: Response) {
  const org = orgId(req)
  const notice = await Notice.findOneAndDelete({ _id: req.params.id, org })
  if (!notice) throw new HttpError(404, 'Notice not found.')
  res.status(204).end()
}

/* ============================== Documents ============================ */

export async function listDocuments(req: Request, res: Response) {
  const org = orgId(req)
  const docs = await DocumentModel.find({ org }).sort({ createdAt: -1 })
  const tenantIds = [...new Set(docs.filter((d) => d.tenant).map((d) => d.tenant!.toString()))]
  const users = await User.find({ _id: { $in: tenantIds } })
  const nameById = new Map(users.map((u) => [u._id.toString(), u.name]))

  res.json(
    docs.map((d) => ({
      id: d._id.toString(),
      title: d.title,
      category: d.category,
      fileName: d.fileName,
      mimeType: d.mimeType,
      sizeBytes: d.sizeBytes,
      audience: d.audience,
      tenantId: d.tenant ? d.tenant.toString() : null,
      tenantName: d.tenant ? nameById.get(d.tenant.toString()) ?? null : null,
      createdAt: d.createdAt.toISOString(),
    }))
  )
}

export async function createDocument(req: Request, res: Response) {
  const org = orgId(req)
  const input = createDocumentSchema.parse(req.body)

  if (input.audience === 'tenant' && !input.tenantId) {
    throw new HttpError(400, 'Choose a tenant to share this document with.')
  }
  const doc = await DocumentModel.create({
    org,
    title: input.title,
    category: input.category,
    fileName: input.fileName,
    mimeType: input.mimeType,
    dataUrl: input.dataUrl,
    sizeBytes: input.sizeBytes,
    audience: input.audience,
    tenant: input.audience === 'tenant' ? input.tenantId : null,
    uploadedBy: req.auth!.sub,
  })
  res.status(201).json({ id: doc._id.toString() })
}

export async function downloadDocument(req: Request, res: Response) {
  const org = orgId(req)
  const doc = await DocumentModel.findOne({ _id: req.params.id, org }).select('+dataUrl')
  if (!doc) throw new HttpError(404, 'Document not found.')
  res.json({ fileName: doc.fileName, mimeType: doc.mimeType, dataUrl: doc.dataUrl })
}

export async function deleteDocument(req: Request, res: Response) {
  const org = orgId(req)
  const doc = await DocumentModel.findOneAndDelete({ _id: req.params.id, org })
  if (!doc) throw new HttpError(404, 'Document not found.')
  res.status(204).end()
}

/* =============================== Settings ============================ */

export async function getSettings(req: Request, res: Response) {
  const org = orgId(req)
  const orgDoc = await Organization.findById(org)
  if (!orgDoc) throw new HttpError(404, 'Organization not found.')
  res.json(toPublicOrg(orgDoc))
}

export async function updateSettings(req: Request, res: Response) {
  const org = orgId(req)
  const input = updateSettingsSchema.parse(req.body)
  const orgDoc = await Organization.findById(org)
  if (!orgDoc) throw new HttpError(404, 'Organization not found.')

  if (input.name) orgDoc.name = input.name
  if (input.settings) {
    const s = input.settings
    const cur = toPublicOrg(orgDoc).settings
    orgDoc.set('settings', {
      currency: s.currency ?? cur.currency,
      dueDayOfMonth: s.dueDayOfMonth ?? cur.dueDayOfMonth,
      penaltyPerDay: s.penaltyPerDay ?? cur.penaltyPerDay,
      graceDays: s.graceDays ?? cur.graceDays,
      supportEmail: s.supportEmail ?? cur.supportEmail,
      supportPhone: s.supportPhone ?? cur.supportPhone,
    })
  }
  await orgDoc.save()
  res.json(toPublicOrg(orgDoc))
}

/** Vacant units across the org, for the create-tenant picker. */
export async function listVacantUnits(req: Request, res: Response) {
  const org = orgId(req)
  const units = await Unit.find({ org, status: 'vacant' }).sort({ label: 1 })
  const propIds = [...new Set(units.map((u) => u.property.toString()))]
  const properties = await Property.find({ _id: { $in: propIds } })
  const nameById = new Map(properties.map((p) => [p._id.toString(), p.name]))

  res.json(
    units.map((u) => ({
      id: u._id.toString(),
      label: u.label,
      floor: u.floor,
      propertyName: nameById.get(u.property.toString()) ?? 'Property',
      rentAmount: u.rentAmount,
      depositAmount: u.depositAmount,
    }))
  )
}

/** Lightweight tenant options for pickers (create bill / share document). */
export async function tenantOptions(req: Request, res: Response) {
  const org = orgId(req)
  const tenancies = await Tenancy.find({ org, occupancy: 'active' })
  const users = await User.find({ _id: { $in: tenancies.map((t) => t.user) } })
  const byId = new Map(users.map((u) => [u._id.toString(), u]))
  res.json(
    tenancies.map((t) => ({
      userId: t.user.toString(),
      name: byId.get(t.user.toString())?.name ?? 'Tenant',
      roomNumber: t.roomNumber,
      propertyName: t.propertyName,
      monthlyRent: t.monthlyRent,
    }))
  )
}
