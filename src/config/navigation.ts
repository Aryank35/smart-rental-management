import {
  Bell,
  Building2,
  CreditCard,
  FileText,
  LayoutDashboard,
  MessageSquareWarning,
  Receipt,
  Settings,
  Users,
  Wallet,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  /** Feature flag key — used later by the SaaS feature toggle system (Phase 21). */
  feature?: string
  /** Show this item in the mobile bottom navigation (max ~5). */
  mobile?: boolean
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

/** Tenant portal navigation (Phases 3–9). */
export const tenantNav: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', to: '/app', icon: LayoutDashboard, mobile: true },
      { label: 'Rent', to: '/app/rent', icon: Wallet, feature: 'RENT_MANAGEMENT', mobile: true },
      { label: 'Bills', to: '/app/bills', icon: Zap, mobile: true },
      {
        label: 'Complaints',
        to: '/app/complaints',
        icon: MessageSquareWarning,
        feature: 'COMPLAINT_MANAGEMENT',
        mobile: true,
      },
    ],
  },
  {
    title: 'More',
    items: [
      { label: 'Notices', to: '/app/notices', icon: Bell },
      { label: 'Documents', to: '/app/documents', icon: FileText, feature: 'DOCUMENTS' },
      { label: 'Payments', to: '/app/payments', icon: Receipt },
      { label: 'Settings', to: '/app/settings', icon: Settings },
    ],
  },
]

/** Admin portal navigation (Phases 10–22). */
export const adminNav: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, mobile: true },
      { label: 'Properties', to: '/admin/properties', icon: Building2, mobile: true },
      { label: 'Tenants', to: '/admin/tenants', icon: Users, mobile: true },
      { label: 'Billing', to: '/admin/billing', icon: CreditCard, mobile: true },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Payments', to: '/admin/payments', icon: Receipt },
      {
        label: 'Complaints',
        to: '/admin/complaints',
        icon: MessageSquareWarning,
        feature: 'COMPLAINT_MANAGEMENT',
      },
      { label: 'Notices', to: '/admin/notices', icon: Bell },
      { label: 'Documents', to: '/admin/documents', icon: FileText, feature: 'DOCUMENTS' },
      { label: 'Settings', to: '/admin/settings', icon: Settings },
    ],
  },
]
