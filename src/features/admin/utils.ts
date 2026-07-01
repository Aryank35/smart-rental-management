import type { BadgeProps } from '@/components/ui/badge'
import type { UnitStatus } from './types'

export function unitStatusBadge(status: UnitStatus): {
  variant: BadgeProps['variant']
  label: string
} {
  switch (status) {
    case 'occupied':
      return { variant: 'success', label: 'Occupied' }
    case 'vacant':
      return { variant: 'warning', label: 'Vacant' }
    case 'maintenance':
      return { variant: 'secondary', label: 'Maintenance' }
  }
}

export const propertyTypeLabels: Record<string, string> = {
  apartment: 'Apartment',
  'independent-house': 'Independent house',
  pg: 'PG / Hostel',
  commercial: 'Commercial',
}

export const billTypeLabels: Record<string, string> = {
  rent: 'Rent',
  electricity: 'Electricity',
  water: 'Water',
  penalty: 'Penalty',
}

export const documentCategoryLabels: Record<string, string> = {
  agreement: 'Agreement',
  receipt: 'Receipt',
  'id-proof': 'ID proof',
  notice: 'Notice',
  other: 'Other',
}

/** Human file size, e.g. 1.2 MB. */
export function formatBytes(bytes: number) {
  if (!bytes) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${units[i]}`
}
