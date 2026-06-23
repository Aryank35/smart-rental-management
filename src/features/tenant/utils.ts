import type { BadgeProps } from '@/components/ui/badge'
import type { NoticeCategory, PaymentStatus } from './types'

/** Map a payment status to a Badge variant + display label. */
export function paymentStatusBadge(status: PaymentStatus): {
  variant: BadgeProps['variant']
  label: string
} {
  switch (status) {
    case 'paid':
      return { variant: 'success', label: 'Paid' }
    case 'pending':
      return { variant: 'warning', label: 'Pending' }
    case 'overdue':
      return { variant: 'destructive', label: 'Overdue' }
  }
}

/** Map a notice category to a Badge variant + display label. */
export function noticeCategoryBadge(category: NoticeCategory): {
  variant: BadgeProps['variant']
  label: string
} {
  switch (category) {
    case 'maintenance':
      return { variant: 'info', label: 'Maintenance' }
    case 'rent':
      return { variant: 'warning', label: 'Rent' }
    case 'community':
      return { variant: 'secondary', label: 'Community' }
    case 'emergency':
      return { variant: 'destructive', label: 'Emergency' }
  }
}
