import { api } from '@/lib/api-client'
import type {
  Complaint,
  Notice,
  PaymentMethod,
  RentDetails,
  RentPayment,
  TenantDashboard,
  TenantDocument,
  TenantPayment,
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

export function getNotices(): Promise<Notice[]> {
  return api.get<Notice[]>('/tenant/notices')
}

export function markNoticeRead(id: string): Promise<void> {
  return api.post<void>(`/tenant/notices/${id}/read`)
}

export function getPaymentHistory(): Promise<TenantPayment[]> {
  return api.get<TenantPayment[]>('/tenant/payments')
}

export function getDocuments(): Promise<TenantDocument[]> {
  return api.get<TenantDocument[]>('/tenant/documents')
}

export function downloadDocument(
  id: string
): Promise<{ fileName: string; mimeType: string; dataUrl: string }> {
  return api.get<{ fileName: string; mimeType: string; dataUrl: string }>(
    `/tenant/documents/${id}/download`
  )
}
