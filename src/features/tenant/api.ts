import { api } from '@/lib/api-client'
import type {
  Complaint,
  PaymentMethod,
  RentDetails,
  RentPayment,
  TenantDashboard,
  UtilityBillsDetails,
} from './types'
import type { ComplaintInput } from './schemas'

export interface PayInput {
  method: PaymentMethod
  /** Specific bill ids to settle; omit to use `scope`. */
  billIds?: string[]
  scope?: 'rent' | 'utilities' | 'all'
}

export interface PayResult {
  paidCount: number
  totalPaid: number
  method: PaymentMethod
  paidOn: string
  receiptNos: string[]
}

/** Tenant data API calls against the TenantFlow backend (MongoDB-backed). */

export function getTenantDashboard(): Promise<TenantDashboard> {
  return api.get<TenantDashboard>('/tenant/dashboard')
}

export function getRentDetails(): Promise<RentDetails> {
  return api.get<RentDetails>('/tenant/rent')
}

export function getRentHistory(): Promise<RentPayment[]> {
  return api.get<RentPayment[]>('/tenant/rent/history')
}

export function getUtilityBills(): Promise<UtilityBillsDetails> {
  return api.get<UtilityBillsDetails>('/tenant/bills')
}

export function getComplaints(): Promise<Complaint[]> {
  return api.get<Complaint[]>('/tenant/complaints')
}

export function createComplaint(input: ComplaintInput): Promise<Complaint> {
  return api.post<Complaint>('/tenant/complaints', input)
}

export function payBills(input: PayInput): Promise<PayResult> {
  return api.post<PayResult>('/tenant/pay', input)
}
