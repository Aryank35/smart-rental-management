import { api } from '@/lib/api-client'
import type { RentDetails, RentPayment, TenantDashboard, UtilityBillsDetails } from './types'

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
