import { useQuery } from '@tanstack/react-query'
import {
  getAdminComplaints,
  getAdminDashboard,
  getAdminDocuments,
  getAdminNotices,
  getBills,
  getPayments,
  getProperties,
  getProperty,
  getSettings,
  getTenant,
  getTenantOptions,
  getTenants,
  getVacantUnits,
} from './api'

export const adminKeys = {
  all: ['admin'] as const,
  dashboard: () => [...adminKeys.all, 'dashboard'] as const,
  properties: () => [...adminKeys.all, 'properties'] as const,
  property: (id: string) => [...adminKeys.all, 'property', id] as const,
  tenants: () => [...adminKeys.all, 'tenants'] as const,
  tenant: (id: string) => [...adminKeys.all, 'tenant', id] as const,
  tenantOptions: () => [...adminKeys.all, 'tenant-options'] as const,
  vacantUnits: () => [...adminKeys.all, 'vacant-units'] as const,
  bills: () => [...adminKeys.all, 'bills'] as const,
  payments: () => [...adminKeys.all, 'payments'] as const,
  complaints: () => [...adminKeys.all, 'complaints'] as const,
  notices: () => [...adminKeys.all, 'notices'] as const,
  documents: () => [...adminKeys.all, 'documents'] as const,
  settings: () => [...adminKeys.all, 'settings'] as const,
}

export const useAdminDashboard = () =>
  useQuery({ queryKey: adminKeys.dashboard(), queryFn: getAdminDashboard })

export const useProperties = () =>
  useQuery({ queryKey: adminKeys.properties(), queryFn: getProperties })

export const useProperty = (id: string) =>
  useQuery({ queryKey: adminKeys.property(id), queryFn: () => getProperty(id), enabled: !!id })

export const useTenants = () => useQuery({ queryKey: adminKeys.tenants(), queryFn: getTenants })

export const useTenant = (id: string | null) =>
  useQuery({
    queryKey: adminKeys.tenant(id ?? ''),
    queryFn: () => getTenant(id as string),
    enabled: !!id,
  })

export const useTenantOptions = () =>
  useQuery({ queryKey: adminKeys.tenantOptions(), queryFn: getTenantOptions })

export const useVacantUnits = () =>
  useQuery({ queryKey: adminKeys.vacantUnits(), queryFn: getVacantUnits })

export const useBills = () => useQuery({ queryKey: adminKeys.bills(), queryFn: getBills })

export const usePayments = () => useQuery({ queryKey: adminKeys.payments(), queryFn: getPayments })

export const useAdminComplaints = () =>
  useQuery({ queryKey: adminKeys.complaints(), queryFn: getAdminComplaints })

export const useAdminNotices = () =>
  useQuery({ queryKey: adminKeys.notices(), queryFn: getAdminNotices })

export const useAdminDocuments = () =>
  useQuery({ queryKey: adminKeys.documents(), queryFn: getAdminDocuments })

export const useSettings = () => useQuery({ queryKey: adminKeys.settings(), queryFn: getSettings })
