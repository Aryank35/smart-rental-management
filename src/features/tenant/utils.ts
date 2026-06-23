import type { BadgeProps } from '@/components/ui/badge'
import type { ComplaintPriority, ComplaintStatus, NoticeCategory, PaymentStatus } from './types'

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

export function complaintStatusBadge(status: ComplaintStatus): {
  variant: BadgeProps['variant']
  label: string
} {
  switch (status) {
    case 'open':
      return { variant: 'warning', label: 'Open' }
    case 'in-progress':
      return { variant: 'info', label: 'In progress' }
    case 'resolved':
      return { variant: 'success', label: 'Resolved' }
    case 'closed':
      return { variant: 'secondary', label: 'Closed' }
  }
}

export function complaintPriorityBadge(priority: ComplaintPriority): {
  variant: BadgeProps['variant']
  label: string
} {
  switch (priority) {
    case 'low':
      return { variant: 'secondary', label: 'Low' }
    case 'medium':
      return { variant: 'info', label: 'Medium' }
    case 'high':
      return { variant: 'warning', label: 'High' }
    case 'urgent':
      return { variant: 'destructive', label: 'Urgent' }
  }
}
