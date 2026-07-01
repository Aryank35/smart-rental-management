import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { AlertTriangle, IndianRupee, UserPlus, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
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
import { PasswordInput } from '@/components/ui/password-input'
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
import { createTenant, offboardTenant } from '@/features/admin/api'
import { adminKeys, useTenant, useTenants, useVacantUnits } from '@/features/admin/queries'
import { tenantSchema, type TenantInput } from '@/features/admin/schemas'
import { billTypeLabels } from '@/features/admin/utils'
import { paymentStatusBadge } from '@/features/tenant/utils'
import { toast } from '@/hooks/use-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ErrorState, StatCard } from './components/admin-ui'

export function AdminTenantsPage() {
  const tenants = useTenants()
  const [createOpen, setCreateOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)

  const stats = useMemo(() => {
    const rows = tenants.data ?? []
    return {
      total: rows.length,
      active: rows.filter((t) => t.status === 'active').length,
      withDues: rows.filter((t) => t.outstanding > 0).length,
      outstanding: rows.reduce((s, t) => s + t.outstanding, 0),
    }
  }, [tenants.data])

  return (
    <PageContainer
      title="Tenants"
      description="Onboard tenants and assign them to units."
      actions={
        <Button onClick={() => setCreateOpen(true)}>
          <UserPlus className="size-4" />
          Add tenant
        </Button>
      }
    >
      {tenants.isError ? (
        <ErrorState onRetry={tenants.refetch} />
      ) : tenants.isLoading || !tenants.data ? (
        <TenantsSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Tenants" value={stats.total} icon={Users} />
            <StatCard
              label="Active"
              value={stats.active}
              icon={Users}
              iconClassName="bg-success/10 text-success"
            />
            <StatCard
              label="With dues"
              value={stats.withDues}
              icon={AlertTriangle}
              iconClassName="bg-warning/10 text-warning"
              emphasize={stats.withDues > 0}
            />
            <StatCard
              label="Total outstanding"
              value={formatCurrency(stats.outstanding)}
              icon={IndianRupee}
              iconClassName="bg-destructive/10 text-destructive"
              emphasize={stats.outstanding > 0}
            />
          </div>

          {tenants.data.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No tenants yet"
              description="Add a tenant and assign them to a vacant unit to get started."
              action={<Button onClick={() => setCreateOpen(true)}>Add tenant</Button>}
            />
          ) : (
            <Card>
              <CardContent className="p-0 sm:p-2">
                <TableWrapper>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tenant</TableHead>
                        <TableHead className="hidden md:table-cell">Unit</TableHead>
                        <TableHead className="text-right">Rent</TableHead>
                        <TableHead className="text-right">Dues</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tenants.data.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>
                            <p className="font-medium">{t.name}</p>
                            <p className="text-xs text-muted-foreground">{t.email}</p>
                          </TableCell>
                          <TableCell className="hidden text-sm md:table-cell">
                            {t.propertyName} · {t.roomNumber}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCurrency(t.monthlyRent)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {t.outstanding > 0 ? (
                              <span className="font-medium text-destructive">
                                {formatCurrency(t.outstanding)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={t.status === 'active' ? 'success' : 'secondary'}>
                              {t.status === 'active' ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => setDetailId(t.id)}>
                              View
                            </Button>
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

      <CreateTenantModal open={createOpen} onOpenChange={setCreateOpen} />
      <TenantDetailDrawer id={detailId} onClose={() => setDetailId(null)} />
    </PageContainer>
  )
}

function CreateTenantModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const vacantUnits = useVacantUnits()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TenantInput>({
    resolver: zodResolver(tenantSchema),
    defaultValues: { agreementMonths: 11 },
  })

  const mutation = useMutation({
    mutationFn: createTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.tenants() })
      queryClient.invalidateQueries({ queryKey: adminKeys.vacantUnits() })
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() })
      queryClient.invalidateQueries({ queryKey: adminKeys.properties() })
      toast.success('Tenant onboarded. Share their login credentials with them.')
      reset()
      onOpenChange(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const units = vacantUnits.data ?? []

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-h-[90vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle>Add tenant</ModalTitle>
          <ModalDescription>
            Create a login and assign the tenant to a vacant unit.
          </ModalDescription>
        </ModalHeader>
        <form className="space-y-4" onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate>
          <FormField label="Full name" htmlFor="name" required error={errors.name?.message}>
            <Input id="name" placeholder="Aarav Sharma" error={!!errors.name} {...register('name')} />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Email" htmlFor="email" required error={errors.email?.message}>
              <Input id="email" type="email" placeholder="tenant@email.com" error={!!errors.email} {...register('email')} />
            </FormField>
            <FormField label="Phone" htmlFor="phone" required error={errors.phone?.message}>
              <Input id="phone" placeholder="9876543210" error={!!errors.phone} {...register('phone')} />
            </FormField>
          </div>

          <FormField
            label="Temporary password"
            htmlFor="password"
            required
            error={errors.password?.message}
            hint="Share this with the tenant — they can change it later in Settings."
          >
            <PasswordInput id="password" placeholder="••••••••" error={!!errors.password} {...register('password')} />
          </FormField>

          <FormField label="Assign unit" required error={errors.unitId?.message}>
            <Select value={watch('unitId') ?? ''} onValueChange={(v) => setValue('unitId', v, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder={units.length ? 'Select a vacant unit' : 'No vacant units available'} />
              </SelectTrigger>
              <SelectContent>
                {units.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.propertyName} · {u.label} — {formatCurrency(u.rentAmount)}/mo
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Monthly rent (₹)"
              htmlFor="monthlyRent"
              error={errors.monthlyRent?.message}
              hint="Leave blank to use the unit's rent"
            >
              <Input id="monthlyRent" type="number" placeholder="Unit default" {...register('monthlyRent')} />
            </FormField>
            <FormField label="Agreement (months)" htmlFor="agreementMonths" error={errors.agreementMonths?.message}>
              <Input id="agreementMonths" type="number" {...register('agreementMonths')} />
            </FormField>
          </div>

          <FormField label="Occupation" htmlFor="occupation" error={errors.occupation?.message}>
            <Input id="occupation" placeholder="Software Engineer" {...register('occupation')} />
          </FormField>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={mutation.isPending} disabled={units.length === 0}>
              Add tenant
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

function TenantDetailDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const queryClient = useQueryClient()
  const tenant = useTenant(id)

  const offboard = useMutation({
    mutationFn: () => offboardTenant(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.tenants() })
      queryClient.invalidateQueries({ queryKey: adminKeys.vacantUnits() })
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() })
      queryClient.invalidateQueries({ queryKey: adminKeys.properties() })
      toast.success('Tenant offboarded and unit freed.')
      onClose()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <Drawer open={!!id} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent side="right" className="w-full max-w-md overflow-y-auto sm:max-w-lg">
        {!tenant.data ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <>
            <DrawerHeader>
              <DrawerTitle>{tenant.data.name}</DrawerTitle>
              <DrawerDescription>
                {tenant.data.propertyName} · Unit {tenant.data.roomNumber}
              </DrawerDescription>
            </DrawerHeader>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info label="Email" value={tenant.data.email} />
              <Info label="Phone" value={tenant.data.phone} />
              <Info label="Monthly rent" value={formatCurrency(tenant.data.monthlyRent)} />
              <Info label="Deposit" value={formatCurrency(tenant.data.securityDeposit)} />
              <Info label="Moved in" value={formatDate(tenant.data.movedInAt)} />
              <Info label="Agreement ends" value={formatDate(tenant.data.agreementEndsAt)} />
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold">Bills</h4>
              {tenant.data.bills.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bills yet.</p>
              ) : (
                <div className="space-y-2">
                  {tenant.data.bills.slice(0, 8).map((b) => {
                    const status = paymentStatusBadge(b.status)
                    return (
                      <div
                        key={b.id}
                        className="flex items-center justify-between rounded-md border border-border p-2.5 text-sm"
                      >
                        <div>
                          <p className="font-medium">
                            {billTypeLabels[b.type]} · {b.period}
                          </p>
                          <p className="text-xs text-muted-foreground">Due {formatDate(b.dueDate)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="tabular-nums">{formatCurrency(b.amount)}</span>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {tenant.data.complaints.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold">Complaints</h4>
                <div className="space-y-2">
                  {tenant.data.complaints.map((c) => (
                    <div key={c.id} className="rounded-md border border-border p-2.5 text-sm">
                      <p className="font-medium">{c.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.referenceNo} · {c.status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tenant.data.status === 'active' && (
              <Button
                variant="destructive"
                className="mt-2"
                loading={offboard.isPending}
                onClick={() => {
                  if (confirm('Offboard this tenant? This frees their unit and disables their login.')) {
                    offboard.mutate()
                  }
                }}
              >
                Offboard tenant
              </Button>
            )}
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/40 p-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate font-medium">{value}</p>
    </div>
  )
}

function TenantsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[112px] rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-[320px] rounded-lg" />
    </div>
  )
}
