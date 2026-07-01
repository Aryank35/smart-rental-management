import { api } from '@/lib/api-client'
import type {
  AdminComplaint,
  AdminDashboard,
  AdminDocument,
  AdminNotice,
  BillRow,
  Organization,
  PaymentRow,
  PropertyDetail,
  PropertyRow,
  TenantDetail,
  TenantOption,
  TenantRow,
  VacantUnit,
} from './types'
import type {
  BillInput,
  NoticeInput,
  PropertyInput,
  SettingsInput,
  TenantInput,
  UnitInput,
} from './schemas'

/** Admin API calls against the TenantFlow backend (MongoDB-backed, org-scoped). */

export const getAdminDashboard = () => api.get<AdminDashboard>('/admin/dashboard')

/* Properties + units */
export const getProperties = () => api.get<PropertyRow[]>('/admin/properties')
export const getProperty = (id: string) => api.get<PropertyDetail>(`/admin/properties/${id}`)
export const createProperty = (input: PropertyInput) =>
  api.post<{ id: string }>('/admin/properties', input)
export const updateProperty = (id: string, input: Partial<PropertyInput>) =>
  api.patch<{ id: string }>(`/admin/properties/${id}`, input)
export const deleteProperty = (id: string) => api.delete<void>(`/admin/properties/${id}`)

export const createUnit = (propertyId: string, input: UnitInput) =>
  api.post<{ id: string }>(`/admin/properties/${propertyId}/units`, input)
export const updateUnit = (id: string, input: Partial<UnitInput> & { status?: string }) =>
  api.patch<{ id: string }>(`/admin/units/${id}`, input)
export const deleteUnit = (id: string) => api.delete<void>(`/admin/units/${id}`)

/* Tenants */
export const getTenants = () => api.get<TenantRow[]>('/admin/tenants')
export const getTenant = (id: string) => api.get<TenantDetail>(`/admin/tenants/${id}`)
export const getTenantOptions = () => api.get<TenantOption[]>('/admin/tenant-options')
export const getVacantUnits = () => api.get<VacantUnit[]>('/admin/vacant-units')
export const createTenant = (input: TenantInput) =>
  api.post<{ id: string; userId: string }>('/admin/tenants', input)
export const updateTenant = (id: string, input: Record<string, unknown>) =>
  api.patch<{ id: string }>(`/admin/tenants/${id}`, input)
export const offboardTenant = (id: string) =>
  api.post<{ id: string }>(`/admin/tenants/${id}/offboard`)

/* Billing + payments */
export const getBills = () => api.get<BillRow[]>('/admin/bills')
export const createBill = (input: BillInput) => api.post<{ id: string }>('/admin/bills', input)
export const generateRent = () =>
  api.post<{ generated: number; period: string }>('/admin/bills/generate-rent')
export const markBillPaid = (id: string, method: string) =>
  api.post<{ id: string }>(`/admin/bills/${id}/mark-paid`, { method })
export const deleteBill = (id: string) => api.delete<void>(`/admin/bills/${id}`)
export const getPayments = () => api.get<PaymentRow[]>('/admin/payments')

/* Complaints */
export const getAdminComplaints = () => api.get<AdminComplaint[]>('/admin/complaints')
export const updateComplaint = (
  id: string,
  input: { status?: string; assignedTo?: string | null; resolutionNote?: string | null }
) => api.patch<{ id: string }>(`/admin/complaints/${id}`, input)

/* Notices */
export const getAdminNotices = () => api.get<AdminNotice[]>('/admin/notices')
export const createNotice = (input: NoticeInput) =>
  api.post<{ id: string }>('/admin/notices', input)
export const updateNotice = (id: string, input: Partial<NoticeInput>) =>
  api.patch<{ id: string }>(`/admin/notices/${id}`, input)
export const deleteNotice = (id: string) => api.delete<void>(`/admin/notices/${id}`)

/* Documents */
export interface DocumentUpload {
  title: string
  category: string
  fileName: string
  mimeType: string
  dataUrl: string
  sizeBytes: number
  audience: 'all' | 'tenant'
  tenantId?: string | null
}
export const getAdminDocuments = () => api.get<AdminDocument[]>('/admin/documents')
export const createDocument = (input: DocumentUpload) =>
  api.post<{ id: string }>('/admin/documents', input)
export const downloadAdminDocument = (id: string) =>
  api.get<{ fileName: string; mimeType: string; dataUrl: string }>(
    `/admin/documents/${id}/download`
  )
export const deleteDocument = (id: string) => api.delete<void>(`/admin/documents/${id}`)

/* Settings */
export const getSettings = () => api.get<Organization>('/admin/settings')
export const updateSettings = (input: SettingsInput) =>
  api.patch<Organization>('/admin/settings', {
    name: input.name,
    settings: {
      currency: input.currency,
      dueDayOfMonth: input.dueDayOfMonth,
      penaltyPerDay: input.penaltyPerDay,
      graceDays: input.graceDays,
      supportEmail: input.supportEmail,
      supportPhone: input.supportPhone,
    },
  })
