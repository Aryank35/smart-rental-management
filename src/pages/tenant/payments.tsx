import { useMemo } from 'react'
import { IndianRupee, Receipt } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { usePaymentHistory } from '@/features/tenant/queries'
import { billTypeLabels } from '@/features/admin/utils'
import { formatCurrency, formatDate } from '@/lib/utils'

export function TenantPaymentsPage() {
  const payments = usePaymentHistory()

  const total = useMemo(
    () => (payments.data ?? []).reduce((s, p) => s + p.amount, 0),
    [payments.data]
  )

  return (
    <PageContainer title="Payments" description="Every payment you’ve made.">
      {payments.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn't load payments</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            Please try again in a moment.
            <Button size="sm" variant="outline" onClick={() => payments.refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : payments.isLoading || !payments.data ? (
        <div className="space-y-4">
          <Skeleton className="h-[96px] rounded-lg" />
          <Skeleton className="h-[320px] rounded-lg" />
        </div>
      ) : payments.data.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No payments yet"
          description="Once you pay rent or a bill, your receipts will appear here."
        />
      ) : (
        <div className="space-y-6">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <span className="flex size-11 items-center justify-center rounded-lg bg-success/10 text-success">
                <IndianRupee className="size-6" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Total paid</p>
                <p className="text-xl font-bold tabular-nums">{formatCurrency(total)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0 sm:p-2">
              <TableWrapper>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>For</TableHead>
                      <TableHead className="hidden sm:table-cell">Period</TableHead>
                      <TableHead className="hidden md:table-cell">Method</TableHead>
                      <TableHead className="hidden lg:table-cell">Date</TableHead>
                      <TableHead className="hidden xl:table-cell">Receipt</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.data.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <Badge variant="secondary">{billTypeLabels[p.type]}</Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{p.period}</TableCell>
                        <TableCell className="hidden md:table-cell">{p.method}</TableCell>
                        <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                          {formatDate(p.paidOn)}
                        </TableCell>
                        <TableCell className="hidden font-mono text-xs text-muted-foreground xl:table-cell">
                          {p.receiptNo}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {formatCurrency(p.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableWrapper>
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  )
}
