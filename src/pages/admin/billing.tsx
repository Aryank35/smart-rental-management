import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { CheckCircle2, FileStack, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal'
import { PageContainer } from '@/components/layout/page-container'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createBill, deleteBill, generateRent, markBillPaid } from '@/features/admin/api'
import { adminKeys, useBills, useTenantOptions } from '@/features/admin/queries'
import { billSchema, type BillInput } from '@/features/admin/schemas'
import { billTypeLabels } from '@/features/admin/utils'
import { paymentStatusBadge } from '@/features/tenant/utils'
import { toast } from '@/hooks/use-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ErrorState, StatCard } from './components/admin-ui'

type Filter = 'all' | 'pending' | 'overdue' | 'paid'

export function AdminBillingPage() {
  const bills = useBills()
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')

  const generate = useMutation({
    mutationFn: generateRent,
    onSuccess: (r) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.bills() })
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() })
      toast.success(
        r.generated > 0
          ? `Generated ${r.generated} rent bill(s) for ${r.period}.`
          : `All tenants already have a ${r.period} rent bill.`
      )
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const stats = useMemo(() => {
    const rows = bills.data ?? []
    return {
      total: rows.length,
      billed: rows.reduce((s, b) => s + b.amount, 0),
      collected: rows.filter((b) => b.status === 'paid').reduce((s, b) => s + b.amount, 0),
      outstanding: rows.filter((b) => b.status !== 'paid').reduce((s, b) => s + b.amount, 0),
    }
  }, [bills.data])

  const filtered = useMemo(
    () => (bills.data ?? []).filter((b) => (filter === 'all' ? true : b.status === filter)),
    [bills.data, filter]
  )

  return (
    <PageContainer
      title="Billing"
      description="Generate and track rent, utility, and penalty bills."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => generate.mutate()} loading={generate.isPending}>
            <RefreshCw className="size-4" />
            Generate rent
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Create bill
          </Button>
        </div>
      }
    >
      {bills.isError ? (
        <ErrorState onRetry={bills.refetch} />
      ) : bills.isLoading || !bills.data ? (
        <BillingSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total bills" value={stats.total} icon={FileStack} />
            <StatCard label="Total billed" value={formatCurrency(stats.billed)} icon={FileStack} />
            <StatCard
              label="Collected"
              value={formatCurrency(stats.collected)}
              icon={CheckCircle2}
              iconClassName="bg-success/10 text-success"
            />
            <StatCard
              label="Outstanding"
              value={formatCurrency(stats.outstanding)}
              icon={FileStack}
              iconClassName="bg-warning/10 text-warning"
              emphasize={stats.outstanding > 0}
            />
          </div>

          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
            </TabsList>
          </Tabs>

          {filtered.length === 0 ? (
            <EmptyState
              icon={FileStack}
              title="No bills here"
              description="Generate rent for active tenants or create a one-off bill."
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
                        <TableHead>Type</TableHead>
                        <TableHead className="hidden sm:table-cell">Period</TableHead>
                        <TableHead className="hidden md:table-cell">Due</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((b) => (
                        <BillRowItem key={b.id} bill={b} />
                      ))}
                    </TableBody>
                  </Table>
                </TableWrapper>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <CreateBillModal open={createOpen} onOpenChange={setCreateOpen} />
    </PageContainer>
  )
}

function BillRowItem({
  bill,
}: {
  bill: import('@/features/admin/types').BillRow
}) {
  const queryClient = useQueryClient()
  const status = paymentStatusBadge(bill.status)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: adminKeys.bills() })
    queryClient.invalidateQueries({ queryKey: adminKeys.payments() })
    queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() })
    queryClient.invalidateQueries({ queryKey: adminKeys.tenants() })
  }

  const pay = useMutation({
    mutationFn: () => markBillPaid(bill.id, 'Cash'),
    onSuccess: () => {
      invalidate()
      toast.success('Bill marked as paid.')
    },
    onError: (err: Error) => toast.error(err.message),
  })
  const remove = useMutation({
    mutationFn: () => deleteBill(bill.id),
    onSuccess: () => {
      invalidate()
      toast.success('Bill deleted.')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <TableRow>
      <TableCell className="font-medium">{bill.tenantName}</TableCell>
      <TableCell>
        <Badge variant="secondary">{billTypeLabels[bill.type]}</Badge>
      </TableCell>
      <TableCell className="hidden sm:table-cell">{bill.period}</TableCell>
      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
        {formatDate(bill.dueDate)}
      </TableCell>
      <TableCell className="text-right tabular-nums">{formatCurrency(bill.amount)}</TableCell>
      <TableCell>
        <Badge variant={status.variant}>{status.label}</Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          {bill.status !== 'paid' && (
            <Button variant="outline" size="sm" onClick={() => pay.mutate()} loading={pay.isPending}>
              Mark paid
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:text-destructive"
            aria-label="Delete bill"
            onClick={() => remove.mutate()}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

function CreateBillModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const tenantOptions = useTenantOptions()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BillInput>({
    resolver: zodResolver(billSchema),
    defaultValues: { type: 'rent', period: defaultPeriod(), dueDate: defaultDueDate() },
  })

  const mutation = useMutation({
    mutationFn: createBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.bills() })
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() })
      queryClient.invalidateQueries({ queryKey: adminKeys.tenants() })
      toast.success('Bill created.')
      reset({ type: 'rent', period: defaultPeriod(), dueDate: defaultDueDate() })
      onOpenChange(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const tenants = tenantOptions.data ?? []

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Create bill</ModalTitle>
          <ModalDescription>Raise a charge against a tenant.</ModalDescription>
        </ModalHeader>
        <form className="space-y-4" onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate>
          <FormField label="Tenant" required error={errors.tenantId?.message}>
            <Select value={watch('tenantId') ?? ''} onValueChange={(v) => setValue('tenantId', v, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a tenant" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((t) => (
                  <SelectItem key={t.userId} value={t.userId}>
                    {t.name} — {t.propertyName} · {t.roomNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Type" required error={errors.type?.message}>
              <Select value={watch('type')} onValueChange={(v) => setValue('type', v as BillInput['type'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(billTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Amount (₹)" htmlFor="amount" required error={errors.amount?.message}>
              <Input id="amount" type="number" placeholder="18500" error={!!errors.amount} {...register('amount')} />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Period" htmlFor="period" required error={errors.period?.message}>
              <Input id="period" placeholder="August 2026" error={!!errors.period} {...register('period')} />
            </FormField>
            <FormField label="Due date" htmlFor="dueDate" required error={errors.dueDate?.message}>
              <Input id="dueDate" type="date" error={!!errors.dueDate} {...register('dueDate')} />
            </FormField>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={mutation.isPending} disabled={tenants.length === 0}>
              Create bill
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
function defaultPeriod() {
  const d = new Date()
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}
function defaultDueDate() {
  const d = new Date()
  const due = new Date(d.getFullYear(), d.getMonth(), 5)
  return due.toISOString().slice(0, 10)
}

function BillingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[112px] rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-[360px] rounded-lg" />
    </div>
  )
}
