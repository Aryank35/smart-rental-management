import { useQuery } from '@tanstack/react-query'
import { getRentDetails, getRentHistory, getTenantDashboard, getUtilityBills } from './api'

export const tenantKeys = {
  all: ['tenant'] as const,
  dashboard: () => [...tenantKeys.all, 'dashboard'] as const,
  rent: () => [...tenantKeys.all, 'rent'] as const,
  rentHistory: () => [...tenantKeys.all, 'rent', 'history'] as const,
  utilityBills: () => [...tenantKeys.all, 'bills'] as const,
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
