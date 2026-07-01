import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getComplaints,
  getDocuments,
  getNotices,
  getPaymentHistory,
  getRentDetails,
  getRentHistory,
  getTenantDashboard,
  getUtilityBills,
  markNoticeRead,
  payBills,
} from './api'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

export const tenantKeys = {
  all: ['tenant'] as const,
  dashboard: () => [...tenantKeys.all, 'dashboard'] as const,
  rent: () => [...tenantKeys.all, 'rent'] as const,
  rentHistory: () => [...tenantKeys.all, 'rent', 'history'] as const,
  utilityBills: () => [...tenantKeys.all, 'bills'] as const,
  complaints: () => [...tenantKeys.all, 'complaints'] as const,
  notices: () => [...tenantKeys.all, 'notices'] as const,
  payments: () => [...tenantKeys.all, 'payments'] as const,
  documents: () => [...tenantKeys.all, 'documents'] as const,
}

export function useTenantDashboard() {
  return useQuery({
    queryKey: tenantKeys.dashboard(),
    queryFn: getTenantDashboard,
  })
}

export function useRentDetails() {
  return useQuery({
    queryKey: tenantKeys.rent(),
    queryFn: getRentDetails,
  })
}

export function useRentHistory() {
  return useQuery({
    queryKey: tenantKeys.rentHistory(),
    queryFn: getRentHistory,
  })
}

export function useUtilityBills() {
  return useQuery({
    queryKey: tenantKeys.utilityBills(),
    queryFn: getUtilityBills,
  })
}

export function useComplaints() {
  return useQuery({
    queryKey: tenantKeys.complaints(),
    queryFn: getComplaints,
  })
}

export function useNotices() {
  return useQuery({ queryKey: tenantKeys.notices(), queryFn: getNotices })
}

export function usePaymentHistory() {
  return useQuery({ queryKey: tenantKeys.payments(), queryFn: getPaymentHistory })
}

export function useDocuments() {
  return useQuery({ queryKey: tenantKeys.documents(), queryFn: getDocuments })
}

export function useMarkNoticeRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markNoticeRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.notices() })
      queryClient.invalidateQueries({ queryKey: tenantKeys.dashboard() })
    },
  })
}

/**
 * Settle bills. On success, invalidates all tenant queries so the dashboard,
 * rent, history, and bills views reflect the payment immediately.
 */
export function usePayBills() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: payBills,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all })
      toast.success(
        `${formatCurrency(result.totalPaid)} paid via ${result.method}.`,
        'Payment successful'
      )
    },
    onError: (err: Error) => toast.error(err.message, 'Payment failed'),
  })
}
