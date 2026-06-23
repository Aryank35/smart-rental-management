import { ArrowDownLeft, Receipt } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { WidgetCard } from './widget-card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { paymentStatusBadge } from '@/features/tenant/utils'
import type { PaymentRecord } from '@/features/tenant/types'

export function RecentPayments({ payments }: { payments: PaymentRecord[] }) {
  return (
    <WidgetCard title="Recent Payments" viewAllTo="/app/payments">
      {payments.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No payments yet"
          description="Your payment history will show up here."
          className="border-0 py-6"
        />
      ) : (
        <ul className="divide-y divide-border">
          {payments.map((p) => {
            const badge = paymentStatusBadge(p.status)
            return (
              <li key={p.id} className="flex items-center gap-3 py-3 first:pt-0">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                  <ArrowDownLeft className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(p.date)} · {p.method}
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
      )}
    </WidgetCard>
  )
}
