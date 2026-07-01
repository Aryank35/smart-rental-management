import { useMemo } from 'react'
import { IndianRupee, Receipt, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
import { usePayments } from '@/features/admin/queries'
import { billTypeLabels } from '@/features/admin/utils'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ErrorState, StatCard } from './components/admin-ui'

export function AdminPaymentsPage() {
  const payments = usePayments()

  const stats = useMemo(() => {
    const rows = payments.data ?? []
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return {
      count: rows.length,
      total: rows.reduce((s, p) => s + p.amount, 0),
      thisMonth: rows
        .filter((p) => new Date(p.paidOn) >= startOfMonth)
        .reduce((s, p) => s + p.amount, 0),
    }
  }, [payments.data])

  return (
    <PageContainer title="Payments" description="A ledger of every payment received.">
      {payments.isError ? (
        <ErrorState onRetry={payments.refetch} />
      ) : payments.isLoading || !payments.data ? (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[112px] rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-[360px] rounded-lg" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              label="Total collected"
              value={formatCurrency(stats.total)}
              icon={IndianRupee}
              iconClassName="bg-success/10 text-success"
            />
            <StatCard
              label="This month"
              value={formatCurrency(stats.thisMonth)}
              icon={TrendingUp}
              iconClassName="bg-info/10 text-info"
            />
            <StatCard label="Payments" value={stats.count} icon={Receipt} />
          </div>

          {payments.data.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No payments yet"
              description="Once tenants pay their bills, they’ll show up here."
              className="py-12"
            />
          ) : (
            <Card>
              <CardContent className="p-0 sm:p-2">
                <TableWrapper>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tenant</TableHead>
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
                          <TableCell className="font-medium">{p.tenantName}</TableCell>
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
          )}
        </div>
      )}
    </PageContainer>
  )
}
