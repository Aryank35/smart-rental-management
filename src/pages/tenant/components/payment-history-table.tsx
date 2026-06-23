import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper,
} from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/use-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { paymentStatusBadge } from '@/features/tenant/utils'
import { downloadRentReceipt } from '@/features/tenant/receipt'
import type { RentPayment } from '@/features/tenant/types'

const PAGE_SIZE = 6

interface PaymentHistoryTableProps {
  payments: RentPayment[]
  receiptContext: { tenantName: string; propertyName: string; roomNumber: string }
}

export function PaymentHistoryTable({ payments, receiptContext }: PaymentHistoryTableProps) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(payments.length / PAGE_SIZE))
  const rows = useMemo(
    () => payments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [payments, page]
  )

  function handleDownload(payment: RentPayment) {
    if (payment.status !== 'paid') {
      toast.info('A receipt is available once the payment is completed.')
      return
    }
    downloadRentReceipt(payment, receiptContext)
    toast.success(`Receipt ${payment.receiptNo} downloaded.`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        <TableWrapper>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead className="hidden sm:table-cell">Receipt No.</TableHead>
                <TableHead className="hidden md:table-cell">Paid / Due</TableHead>
                <TableHead className="hidden lg:table-cell">Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => {
                const badge = paymentStatusBadge(p.status)
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.period}</TableCell>
                    <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">
                      {p.receiptNo}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {p.paidOn ? formatDate(p.paidOn) : formatDate(p.dueDate)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{p.method ?? '—'}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(p.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={badge.variant} dot>
                        {badge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={`Download receipt for ${p.period}`}
                        disabled={p.status !== 'paid'}
                        onClick={() => handleDownload(p)}
                      >
                        <Download className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableWrapper>
        <Pagination className="mt-4" page={page} pageCount={pageCount} onPageChange={setPage} />
      </CardContent>
    </Card>
  )
}

export function PaymentHistoryTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </CardContent>
    </Card>
  )
}
