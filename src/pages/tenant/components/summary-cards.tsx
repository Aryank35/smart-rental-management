import { Droplets, ReceiptText, ShieldCheck, TriangleAlert, Wallet, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatCurrency } from '@/lib/utils'
import type { DashboardSummary } from '@/features/tenant/types'

interface StatDef {
  key: keyof DashboardSummary
  label: string
  icon: LucideIcon
  iconClass: string
  hint?: string
  emphasize?: boolean
}

const stats: StatDef[] = [
  { key: 'monthlyRent', label: 'Current Rent', icon: Wallet, iconClass: 'bg-primary/10 text-primary', hint: 'per month' },
  { key: 'electricityBill', label: 'Electricity', icon: ReceiptText, iconClass: 'bg-warning/10 text-warning', hint: 'this cycle' },
  { key: 'waterBill', label: 'Water', icon: Droplets, iconClass: 'bg-info/10 text-info', hint: 'this cycle' },
  { key: 'outstandingDues', label: 'Outstanding Dues', icon: TriangleAlert, iconClass: 'bg-destructive/10 text-destructive', hint: 'pay soon', emphasize: true },
  { key: 'securityDeposit', label: 'Security Deposit', icon: ShieldCheck, iconClass: 'bg-success/10 text-success', hint: 'refundable' },
]

export function SummaryCards({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
      {stats.map((stat) => {
        const value = summary[stat.key]
        const isAlert = stat.emphasize && value > 0
        return (
          <Card key={stat.key} className={cn(isAlert && 'border-destructive/40')}>
            <CardContent className="p-4">
              <span className={cn('flex size-9 items-center justify-center rounded-lg', stat.iconClass)}>
                <stat.icon className="size-5" />
              </span>
              <p className="mt-3 text-xs text-muted-foreground">{stat.label}</p>
              <p
                className={cn(
                  'mt-0.5 text-lg font-bold tracking-tight tabular-nums sm:text-xl',
                  isAlert && 'text-destructive'
                )}
              >
                {formatCurrency(value)}
              </p>
              {stat.hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{stat.hint}</p>}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-[120px] rounded-lg" />
      ))}
    </div>
  )
}
