import { useMemo, useState } from 'react'
import { Droplets, ReceiptText, TriangleAlert, Zap } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { PageContainer } from '@/components/layout/page-container'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper,
} from '@/components/ui/table'
import { useUtilityBills } from '@/features/tenant/queries'
import { paymentStatusBadge } from '@/features/tenant/utils'
import type { UtilityBill, UtilityBillType } from '@/features/tenant/types'
import { cn, formatCurrency, formatDate, relativeDueLabel } from '@/lib/utils'
import { PayRentModal } from './components/pay-rent-modal'

const billTypeMeta: Record<UtilityBillType, { label: string; icon: typeof Zap; tone: string }> = {
  electricity: {
    label: 'Electricity',
    icon: Zap,
    tone: 'bg-warning/10 text-warning',
  },
  water: {
    label: 'Water',
    icon: Droplets,
    tone: 'bg-info/10 text-info',
  },
}

function billTypeLabel(type: UtilityBillType) {
  return billTypeMeta[type].label
}

export function BillsPage() {
  const bills = useUtilityBills()
  const [payOpen, setPayOpen] = useState(false)

  const unpaidBills = useMemo(
    () => bills.data?.bills.filter((bill) => bill.status !== 'paid') ?? [],
    [bills.data]
  )
  const nextDue = unpaidBills
    .slice()
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]

  return (
    <PageContainer
      title="Utility Bills"
      description="Track electricity and water charges for your room."
      actions={
        bills.data && bills.data.summary.unpaidTotal > 0 ? (
          <Button onClick={() => setPayOpen(true)}>Pay dues</Button>
        ) : null
      }
    >
      {bills.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn't load utility bills</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            Please try again in a moment.
            <Button size="sm" variant="outline" onClick={() => bills.refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : bills.isLoading || !bills.data ? (
        <BillsPageSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <UtilityStatCard
              label="Electricity"
              value={bills.data.summary.electricity}
              hint="Latest cycle"
              icon={Zap}
              iconClassName="bg-warning/10 text-warning"
            />
            <UtilityStatCard
              label="Water"
              value={bills.data.summary.water}
              hint="Latest cycle"
              icon={Droplets}
              iconClassName="bg-info/10 text-info"
            />
            <UtilityStatCard
              label="Unpaid"
              value={bills.data.summary.unpaidTotal}
              hint={nextDue ? relativeDueLabel(nextDue.dueDate) : 'No open bills'}
              icon={ReceiptText}
              iconClassName="bg-primary/10 text-primary"
              emphasize={bills.data.summary.unpaidTotal > 0}
            />
            <UtilityStatCard
              label="Overdue"
              value={bills.data.summary.overdueTotal}
              hint="Needs attention"
              icon={TriangleAlert}
              iconClassName="bg-destructive/10 text-destructive"
              emphasize={bills.data.summary.overdueTotal > 0}
            />
          </div>

          <CurrentBills bills={unpaidBills} />
          <UtilityBillsTable bills={bills.data.bills} />
        </div>
      )}

      {bills.data && (
        <PayRentModal
          open={payOpen}
          onOpenChange={setPayOpen}
          amount={bills.data.summary.unpaidTotal}
          period="Utility bill dues"
          title="Pay utility bills"
          description="Settle your electricity and water dues securely."
        />
      )}
    </PageContainer>
  )
}

interface UtilityStatCardProps {
  label: string
  value: number
  hint: string
  icon: typeof Zap
  iconClassName: string
  emphasize?: boolean
}

function UtilityStatCard({
  label,
  value,
  hint,
  icon: Icon,
  iconClassName,
  emphasize,
}: UtilityStatCardProps) {
  return (
    <Card className={cn(emphasize && value > 0 && 'border-destructive/40')}>
      <CardContent className="p-4">
        <span className={cn('flex size-9 items-center justify-center rounded-lg', iconClassName)}>
          <Icon className="size-5" />
        </span>
        <p className="mt-3 text-xs text-muted-foreground">{label}</p>
        <p
          className={cn(
            'mt-0.5 text-lg font-bold tracking-tight tabular-nums sm:text-xl',
            emphasize && value > 0 && 'text-destructive'
          )}
        >
          {formatCurrency(value)}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

function CurrentBills({ bills }: { bills: UtilityBill[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Current Charges</CardTitle>
        <CardDescription>Open electricity and water bills.</CardDescription>
      </CardHeader>
      <CardContent>
        {bills.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="No utility dues"
            description="Electricity and water bills are fully settled."
            className="py-10"
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {bills.map((bill) => {
              const meta = billTypeMeta[bill.type]
              const badge = paymentStatusBadge(bill.status)
              return (
                <div
                  key={bill.id}
                  className="rounded-lg border border-border bg-muted/30 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn('flex size-10 items-center justify-center rounded-lg', meta.tone)}
                      >
                        <meta.icon className="size-5" />
                      </span>
                      <div>
                        <p className="font-medium">{meta.label}</p>
                        <p className="text-sm text-muted-foreground">{bill.period}</p>
                      </div>
                    </div>
                    <Badge variant={badge.variant} dot>
                      {badge.label}
                    </Badge>
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Due date</p>
                      <p className="text-sm font-medium">{formatDate(bill.dueDate)}</p>
                    </div>
                    <p className="text-xl font-bold tabular-nums">{formatCurrency(bill.amount)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function UtilityBillsTable({ bills }: { bills: UtilityBill[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Bill History</CardTitle>
      </CardHeader>
      <CardContent>
        {bills.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="No utility bills yet"
            description="Your bills will appear here after the first billing cycle."
            className="py-10"
          />
        ) : (
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="hidden md:table-cell">Due / Paid</TableHead>
                  <TableHead className="hidden lg:table-cell">Receipt No.</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => {
                  const badge = paymentStatusBadge(bill.status)
                  return (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{billTypeLabel(bill.type)}</TableCell>
                      <TableCell>{bill.period}</TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                        {formatDate(bill.paidOn ?? bill.dueDate)}
                      </TableCell>
                      <TableCell className="hidden font-mono text-xs text-muted-foreground lg:table-cell">
                        {bill.receiptNo}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(bill.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={badge.variant} dot>
                          {badge.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableWrapper>
        )}
      </CardContent>
    </Card>
  )
}

function BillsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-[220px] rounded-lg" />
      <Skeleton className="h-[320px] rounded-lg" />
    </div>
  )
}
