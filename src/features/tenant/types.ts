export type PaymentStatus = 'paid' | 'pending' | 'overdue'

export type OccupancyStatus = 'active' | 'notice-period' | 'vacated'

export type NoticeCategory = 'maintenance' | 'rent' | 'community' | 'emergency'

export type UtilityBillType = 'electricity' | 'water'

/** The tenant's current tenancy / room assignment. */
export interface Tenancy {
  tenantName: string
  propertyName: string
  roomNumber: string
  floor: number
  occupancy: OccupancyStatus
  /** ISO date the tenancy started. */
  movedInAt: string
  /** ISO date the agreement ends. */
  agreementEndsAt: string
}

/** Headline financial figures shown as summary cards. */
export interface DashboardSummary {
  monthlyRent: number
  electricityBill: number
  waterBill: number
  outstandingDues: number
  securityDeposit: number
}

export interface UpcomingPayment {
  id: string
  label: string
  /** ISO due date. */
  dueDate: string
  amount: number
  status: PaymentStatus
}

export interface PaymentRecord {
  id: string
  label: string
  /** ISO paid/created date. */
  date: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
}

export interface Notice {
  id: string
  title: string
  category: NoticeCategory
  /** ISO publish date. */
  date: string
  excerpt: string
  read: boolean
}

export type PaymentMethod = 'UPI' | 'Card' | 'Net Banking' | 'Cash'

/** Rent configuration + live balances for the tenant's tenancy. */
export interface RentDetails {
  monthlyRent: number
  securityDeposit: number
  /** Day of month rent falls due, e.g. 5. */
  dueDayOfMonth: number
  /** ISO date of the next rent due. */
  nextDueDate: string
  outstandingBalance: number
  penalty: {
    /** Penalty charged per day after the grace period. */
    perDay: number
    graceDays: number
    /** Penalty currently accrued on overdue amounts. */
    accrued: number
  }
}

/** A single rent billing period and its payment state. */
export interface RentPayment {
  id: string
  receiptNo: string
  /** Billing period label, e.g. "June 2026". */
  period: string
  dueDate: string
  paidOn: string | null
  amount: number
  method: PaymentMethod | null
  status: PaymentStatus
}

export interface UtilityBill {
  id: string
  type: UtilityBillType
  period: string
  dueDate: string
  paidOn: string | null
  amount: number
  method: PaymentMethod | null
  status: PaymentStatus
  receiptNo: string
}

export interface UtilityBillsSummary {
  electricity: number
  water: number
  unpaidTotal: number
  overdueTotal: number
}

export interface UtilityBillsDetails {
  summary: UtilityBillsSummary
  bills: UtilityBill[]
}

export interface TenantDashboard {
  tenancy: Tenancy
  summary: DashboardSummary
  upcomingPayments: UpcomingPayment[]
  recentPayments: PaymentRecord[]
  recentNotices: Notice[]
}
