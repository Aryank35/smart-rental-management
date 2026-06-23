import { CalendarClock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { WidgetCard } from './widget-card'
import { cn, formatCurrency, formatDate, relativeDueLabel, daysUntil } from '@/lib/utils'
import { paymentStatusBadge } from '@/features/tenant/utils'
import type { UpcomingPayment } from '@/features/tenant/types'

export function UpcomingPayments({ payments }: { payments: UpcomingPayment[] }) {
  const total = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <WidgetCard title="Upcoming Payments" viewAllTo="/app/payments">
      {payments.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="All settled"
          description="You have no upcoming payments. Nice work!"
          className="border-0 py-6"
        />
      ) : (
        <>
          <ul className="divide-y divide-border">
            {payments.map((p) => {
              const badge = paymentStatusBadge(p.status)
              const overdue = daysUntil(p.dueDate) < 0
              return (
                <li key={p.id} className="flex items-center gap-3 py-3 first:pt-0">
                  <span
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-full',
                      overdue ? 'bg-destructive/10 text-destructive' : 'bg-accent text-accent-foreground'
                    )}
                  >
                    <CalendarClock className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.label}</p>
                    <p
                      className={cn(
                        'text-xs',
                        overdue ? 'text-destructive' : 'text-muted-foreground'
                      )}
                    >
                      {formatDate(p.dueDate)} · {relativeDueLabel(p.dueDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums">{formatCurrency(p.amount)}</p>
                    <Badge variant={badge.variant} className="mt-0.5">
                      {badge.label}
                    </Badge>
                  </div>
                </li>
              )
            })}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <div>
              <p className="text-xs text-muted-foreground">Total due</p>
              <p className="text-lg font-bold tabular-nums">{formatCurrency(total)}</p>
            </div>
            <Button size="sm">Pay all</Button>
          </div>
        </>
      )}
    </WidgetCard>
  )
}
