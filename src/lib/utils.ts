import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind class names, resolving conflicts (later wins). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a number as Indian Rupees (no decimals by default). */
export function formatCurrency(amount: number, opts?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    ...opts,
  }).format(amount)
}

/** Format an ISO date string as e.g. "23 Jun 2026". */
export function formatDate(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

/** Whole days from today until the given date (negative if in the past). */
export function daysUntil(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const target = new Date(d)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - start.getTime()) / 86_400_000)
}

/** Human relative phrasing for a due date, e.g. "in 3 days", "today", "2 days ago". */
export function relativeDueLabel(date: string | Date) {
  const days = daysUntil(date)
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  if (days === -1) return '1 day overdue'
  if (days > 1) return `Due in ${days} days`
  return `${Math.abs(days)} days overdue`
}

/** Build initials from a name, e.g. "Aryan Mohapatra" -> "AM". */
export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
