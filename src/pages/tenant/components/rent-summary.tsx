import { CalendarClock, ReceiptText, ShieldCheck, TriangleAlert, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatCurrency, formatDate, relativeDueLabel } from '@/lib/utils'
import type { RentDetails } from '@/features/tenant/types'

interface RentSummaryProps {
  rent: RentDetails
  onPay: () => void
}

export function RentSummary({ rent, onPay }: RentSummaryProps) {
  const hasDues = rent.outstandingBalance > 0

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Outstanding / pay panel */}
      <Card
        className={cn(
          'lg:col-span-1',
          hasDues ? 'border-destructive/40 bg-destructive/5' : 'border-success/40 bg-success/5'
        )}
      >
        <CardContent className="flex h-full flex-col p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <TriangleAlert className={cn('size-4', hasDues ? 'text-destructive' : 'text-success')} />
            Outstanding balance
          </div>
          <p
            className={cn(
              'mt-2 text-3xl font-bold tabular-nums',
              hasDues ? 'text-destructive' : 'text-success'
            )}
          >
            {formatCurrency(rent.outstandingBalance)}
          </p>
          {rent.penalty.accrued > 0 && (
            <p className="mt-1 text-xs text-destructive">
              Includes {formatCurrency(rent.penalty.accrued)} penalty
            </p>
          )}
          <div className="mt-auto pt-4">
            <Button className="w-full" disabled={!hasDues} onClick={onPay}>
              {hasDues ? `Pay ${formatCurrency(rent.outstandingBalance)}` : 'All clear'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-4 lg:col-span-2">
        <StatTile
          icon={Wallet}
          iconClass="bg-primary/10 text-primary"
          label="Monthly Rent"
          value={formatCurrency(rent.monthlyRent)}
          hint="per month"
        />
        <StatTile
          icon={CalendarClock}
          iconClass="bg-info/10 text-info"
          label="Next Due Date"
          value={formatDate(rent.nextDueDate)}
          hint={relativeDueLabel(rent.nextDueDate)}
        />
        <StatTile
          icon={ShieldCheck}
          iconClass="bg-success/10 text-success"
          label="Security Deposit"
          value={formatCurrency(rent.securityDeposit)}
          hint="refundable"
        />
        <StatTile
          icon={ReceiptText}
          iconClass="bg-warning/10 text-warning"
          label="Penalty"
          value={`${formatCurrency(rent.penalty.perDay)}/day`}
          hint={`after ${rent.penalty.graceDays}-day grace`}
        />
      </div>
    </div>
  )
}

function StatTile({
  icon: Icon,
  iconClass,
  label,
  value,
  hint,
}: {
  icon: typeof Wallet
  iconClass: string
  label: string
  value: string
  hint?: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <span className={cn('flex size-9 items-center justify-center rounded-lg', iconClass)}>
          <Icon className="size-5" />
        </span>
        <p className="mt-3 text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-lg font-bold tracking-tight">{value}</p>
        {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  )
}

export function RentSummarySkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Skeleton className="h-44 rounded-lg lg:col-span-1" />
      <div className="grid grid-cols-2 gap-4 lg:col-span-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[116px] rounded-lg" />
        ))}
      </div>
    </div>
  )
}
