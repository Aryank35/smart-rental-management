import type { PaymentMethod, PaymentStatus } from '@/features/tenant/types'

export type PropertyType = 'apartment' | 'independent-house' | 'pg' | 'commercial'
export type UnitStatus = 'vacant' | 'occupied' | 'maintenance'
export type BillType = 'rent' | 'electricity' | 'water' | 'penalty'
export type NoticeCategory = 'maintenance' | 'rent' | 'community' | 'emergency'
export type ComplaintStatus = 'open' | 'in-progress' | 'resolved' | 'closed'
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent'
export type DocumentCategory = 'agreement' | 'receipt' | 'id-proof' | 'notice' | 'other'

export interface OrgSettings {
  currency: string
  dueDayOfMonth: number
  penaltyPerDay: number
  graceDays: number
  supportEmail: string
  supportPhone: string
}

export interface Organization {
  id: string
  name: string
  settings: OrgSettings
}

export interface AdminDashboard {
  org: Organization | null
  stats: {
    properties: number
    units: number
    occupied: number
    vacant: number
    maintenance: number
    occupancyRate: number
    tenants: number
    collectedThisMonth: number
    totalOutstanding: number
    overdueAmount: number
    openComplaints: number
  }
  revenueByMonth: { month: string; amount: number }[]
  recentPayments: {
    id: string
    tenantName: string
    type: BillType
    period: string
    amount: number
    method: PaymentMethod
    paidOn: string
  }[]
}

export interface PropertyRow {
  id: string
  name: string
  type: PropertyType
  addressLine: string
  city: string
  state: string
  pincode: string
  notes: string
  unitCount: number
  occupiedCount: number
  vacantCount: number
  createdAt: string
}

export interface UnitRow {
  id: string
  label: string
  floor: number
  bedrooms: number
  bathrooms: number
  sizeSqft: number
  rentAmount: number
  depositAmount: number
  status: UnitStatus
  tenantName: string | null
  tenancyId: string | null
}

export interface PropertyDetail {
  id: string
  name: string
  type: PropertyType
  addressLine: string
  city: string
  state: string
  pincode: string
  notes: string
  units: UnitRow[]
}

export interface TenantRow {
  id: string
  userId: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive'
  propertyName: string
  roomNumber: string
  floor: number
  monthlyRent: number
  occupancy: 'active' | 'notice-period' | 'vacated'
  movedInAt: string
  agreementEndsAt: string
  outstanding: number
}

export interface TenantDetail {
  id: string
  userId: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive'
  occupation: string | null
  emergencyContact: { name: string; phone: string; relation?: string } | null
  propertyName: string
  roomNumber: string
  floor: number
  occupancy: string
  monthlyRent: number
  securityDeposit: number
  movedInAt: string
  agreementEndsAt: string
  bills: {
    id: string
    type: BillType
    period: string
    amount: number
    dueDate: string
    paidOn: string | null
    method: PaymentMethod | null
    status: PaymentStatus
    receiptNo: string
  }[]
  complaints: {
    id: string
    title: string
    category: string
    priority: ComplaintPriority
    status: ComplaintStatus
    referenceNo: string
    raisedAt: string
  }[]
}

export interface TenantOption {
  userId: string
  name: string
  roomNumber: string
  propertyName: string
  monthlyRent: number
}

export interface VacantUnit {
  id: string
  label: string
  floor: number
  propertyName: string
  rentAmount: number
  depositAmount: number
}

export interface BillRow {
  id: string
  tenantId: string
  tenantName: string
  type: BillType
  period: string
  amount: number
  dueDate: string
  paidOn: string | null
  method: PaymentMethod | null
  status: PaymentStatus
  receiptNo: string
}

export interface PaymentRow {
  id: string
  tenantName: string
  type: BillType
  period: string
  amount: number
  method: PaymentMethod
  paidOn: string
  receiptNo: string
}

export interface AdminComplaint {
  id: string
  tenantName: string
  title: string
  category: string
  priority: ComplaintPriority
  status: ComplaintStatus
  description: string
  location: string
  referenceNo: string
  raisedAt: string
  updatedAt: string
  resolvedAt: string | null
  assignedTo: string | null
  resolutionNote: string | null
}

export interface AdminNotice {
  id: string
  title: string
  category: NoticeCategory
  date: string
  excerpt: string
  body: string
  readCount: number
}

export interface AdminDocument {
  id: string
  title: string
  category: DocumentCategory
  fileName: string
  mimeType: string
  sizeBytes: number
  audience: 'all' | 'tenant'
  tenantId: string | null
  tenantName: string | null
  createdAt: string
}
