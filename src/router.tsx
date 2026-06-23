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
import { PlaceholderPage } from '@/pages/placeholder-page'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },

  // Design system showcase (Phase 1 deliverable) — public.
  {
    element: <DashboardLayout sections={tenantNav} basePath="/app" />,
    children: [{ path: '/components', element: <ShowcasePage /> }],
  },

  // Auth — redirect signed-in users away (Phase 2).
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

  // Tenant portal (Phases 3–9).
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
          { path: '/app/notices', element: <PlaceholderPage title="Notices" phase="Phase 7" /> },
          {
            path: '/app/documents',
            element: <PlaceholderPage title="Documents" phase="Phase 8" />,
          },
          { path: '/app/payments', element: <PlaceholderPage title="Payments" phase="Phase 4" /> },
          { path: '/app/settings', element: <PlaceholderPage title="Settings" phase="Phase 9" /> },
        ],
      },
    ],
  },

  // Admin portal (Phases 10–22).
  {
    element: <ProtectedRoute role="admin" />,
    children: [
      {
        element: <DashboardLayout sections={adminNav} basePath="/admin" />,
        children: [
          { path: '/admin', element: <PlaceholderPage title="Admin Dashboard" phase="Phase 10" /> },
          {
            path: '/admin/properties',
            element: <PlaceholderPage title="Properties" phase="Phase 11" />,
          },
          { path: '/admin/tenants', element: <PlaceholderPage title="Tenants" phase="Phase 13" /> },
          { path: '/admin/billing', element: <PlaceholderPage title="Billing" phase="Phase 14" /> },
          {
            path: '/admin/payments',
            element: <PlaceholderPage title="Payments" phase="Phase 15" />,
          },
          {
            path: '/admin/complaints',
            element: <PlaceholderPage title="Complaints" phase="Phase 16" />,
          },
          { path: '/admin/notices', element: <PlaceholderPage title="Notices" phase="Phase 17" /> },
          {
            path: '/admin/documents',
            element: <PlaceholderPage title="Documents" phase="Phase 18" />,
          },
          { path: '/admin/settings', element: <PlaceholderPage title="Settings" phase="Phase 21" /> },
        ],
      },
    ],
  },

  { path: '*', element: <Navigate to="/login" replace /> },
])
