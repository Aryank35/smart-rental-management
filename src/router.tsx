import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/auth-layout'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { adminNav, tenantNav } from '@/config/navigation'
import { ProtectedRoute, PublicOnlyRoute } from '@/features/auth/protected-route'
import { LoginPage } from '@/pages/auth/login'
import { RegisterPage } from '@/pages/auth/register'
import { ForgotPasswordPage } from '@/pages/auth/forgot-password'
import { ProfileSetupPage } from '@/pages/auth/profile-setup'
import { ShowcasePage } from '@/pages/showcase'
import { TenantDashboardPage } from '@/pages/tenant/dashboard'
import { RentPage } from '@/pages/tenant/rent'
import { BillsPage } from '@/pages/tenant/bills'
import { ComplaintsPage } from '@/pages/tenant/complaints'
import { TenantNoticesPage } from '@/pages/tenant/notices'
import { TenantDocumentsPage } from '@/pages/tenant/documents'
import { TenantPaymentsPage } from '@/pages/tenant/payments'
import { TenantSettingsPage } from '@/pages/tenant/settings'
import { AdminDashboardPage } from '@/pages/admin/dashboard'
import { AdminPropertiesPage } from '@/pages/admin/properties'
import { AdminPropertyDetailPage } from '@/pages/admin/property-detail'
import { AdminTenantsPage } from '@/pages/admin/tenants'
import { AdminBillingPage } from '@/pages/admin/billing'
import { AdminPaymentsPage } from '@/pages/admin/payments'
import { AdminComplaintsPage } from '@/pages/admin/complaints'
import { AdminNoticesPage } from '@/pages/admin/notices'
import { AdminDocumentsPage } from '@/pages/admin/documents'
import { AdminSettingsPage } from '@/pages/admin/settings'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },

  // Design system showcase (Phase 1 deliverable) — public.
  {
    element: <DashboardLayout sections={tenantNav} basePath="/app" />,
    children: [{ path: '/components', element: <ShowcasePage /> }],
  },

  // Auth — redirect signed-in users away.
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
          { path: '/forgot-password', element: <ForgotPasswordPage /> },
        ],
      },
    ],
  },

  // Profile setup — authenticated, runs before entering the app.
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [{ path: '/profile-setup', element: <ProfileSetupPage /> }],
      },
    ],
  },

  // Tenant portal.
  {
    element: <ProtectedRoute role="tenant" />,
    children: [
      {
        element: <DashboardLayout sections={tenantNav} basePath="/app" />,
        children: [
          { path: '/app', element: <TenantDashboardPage /> },
          { path: '/app/rent', element: <RentPage /> },
          { path: '/app/bills', element: <BillsPage /> },
          { path: '/app/complaints', element: <ComplaintsPage /> },
          { path: '/app/notices', element: <TenantNoticesPage /> },
          { path: '/app/documents', element: <TenantDocumentsPage /> },
          { path: '/app/payments', element: <TenantPaymentsPage /> },
          { path: '/app/settings', element: <TenantSettingsPage /> },
        ],
      },
    ],
  },

  // Admin portal.
  {
    element: <ProtectedRoute role="admin" />,
    children: [
      {
        element: <DashboardLayout sections={adminNav} basePath="/admin" />,
        children: [
          { path: '/admin', element: <AdminDashboardPage /> },
          { path: '/admin/properties', element: <AdminPropertiesPage /> },
          { path: '/admin/properties/:id', element: <AdminPropertyDetailPage /> },
          { path: '/admin/tenants', element: <AdminTenantsPage /> },
          { path: '/admin/billing', element: <AdminBillingPage /> },
          { path: '/admin/payments', element: <AdminPaymentsPage /> },
          { path: '/admin/complaints', element: <AdminComplaintsPage /> },
          { path: '/admin/notices', element: <AdminNoticesPage /> },
          { path: '/admin/documents', element: <AdminDocumentsPage /> },
          { path: '/admin/settings', element: <AdminSettingsPage /> },
        ],
      },
    ],
  },

  { path: '*', element: <Navigate to="/login" replace /> },
])
