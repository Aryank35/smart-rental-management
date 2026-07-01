import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { ArrowLeft, MapPin, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { createUnit, deleteProperty, deleteUnit } from '@/features/admin/api'
import { adminKeys, useProperty } from '@/features/admin/queries'
import { unitSchema, type UnitInput } from '@/features/admin/schemas'
import { propertyTypeLabels, unitStatusBadge } from '@/features/admin/utils'
import { toast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import { ErrorState } from './components/admin-ui'

export function AdminPropertyDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const property = useProperty(id)
  const [unitModal, setUnitModal] = useState(false)

  const removeProperty = useMutation({
    mutationFn: () => deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.properties() })
      toast.success('Property deleted.')
      navigate('/admin/properties')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const removeUnit = useMutation({
    mutationFn: (unitId: string) => deleteUnit(unitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.property(id) })
      queryClient.invalidateQueries({ queryKey: adminKeys.properties() })
      toast.success('Unit removed.')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <PageContainer
      title={property.data?.name ?? 'Property'}
      description={property.data ? propertyTypeLabels[property.data.type] : undefined}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/properties">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
          <Button onClick={() => setUnitModal(true)}>
            <Plus className="size-4" />
            Add unit
          </Button>
        </div>
      }
    >
      {property.isError ? (
        <ErrorState onRetry={property.refetch} message="Couldn’t load this property." />
      ) : property.isLoading || !property.data ? (
        <div className="space-y-4">
          <Skeleton className="h-[96px] rounded-lg" />
          <Skeleton className="h-[320px] rounded-lg" />
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>
                  {property.data.addressLine}, {property.data.city}
                  {property.data.state ? `, ${property.data.state}` : ''}{' '}
                  {property.data.pincode}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  if (confirm('Delete this property and all its (vacant) units?')) {
                    removeProperty.mutate()
                  }
                }}
                loading={removeProperty.isPending}
              >
                <Trash2 className="size-4" />
                Delete property
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Units ({property.data.units.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {property.data.units.length === 0 ? (
                <EmptyState
                  icon={Plus}
                  title="No units yet"
                  description="Add units so you can assign tenants to them."
                  action={<Button onClick={() => setUnitModal(true)}>Add unit</Button>}
                  className="py-10"
                />
              ) : (
                <TableWrapper>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Unit</TableHead>
                        <TableHead className="hidden sm:table-cell">Floor</TableHead>
                        <TableHead className="hidden md:table-cell">Config</TableHead>
                        <TableHead className="text-right">Rent</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tenant</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {property.data.units.map((u) => {
                        const status = unitStatusBadge(u.status)
                        return (
                          <TableRow key={u.id}>
                            <TableCell className="font-medium">{u.label}</TableCell>
                            <TableCell className="hidden sm:table-cell">{u.floor}</TableCell>
                            <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                              {u.bedrooms}BHK · {u.bathrooms} bath
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatCurrency(u.rentAmount)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={status.variant}>{status.label}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {u.tenantName ?? '—'}
                            </TableCell>
                            <TableCell className="text-right">
                              {u.status !== 'occupied' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-destructive hover:text-destructive"
                                  onClick={() => removeUnit.mutate(u.id)}
                                  aria-label="Delete unit"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              )}
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
        </div>
      )}

      <UnitFormModal propertyId={id} open={unitModal} onOpenChange={setUnitModal} />
    </PageContainer>
  )
}

function UnitFormModal({
  propertyId,
  open,
  onOpenChange,
}: {
  propertyId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UnitInput>({
    resolver: zodResolver(unitSchema),
    defaultValues: { label: '', floor: 1, bedrooms: 2, bathrooms: 1, sizeSqft: 0, rentAmount: 0, depositAmount: 0 },
  })

  const mutation = useMutation({
    mutationFn: (input: UnitInput) => createUnit(propertyId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.property(propertyId) })
      queryClient.invalidateQueries({ queryKey: adminKeys.properties() })
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() })
      toast.success('Unit added.')
      reset()
      onOpenChange(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Add unit</ModalTitle>
          <ModalDescription>Define a rentable unit inside this property.</ModalDescription>
        </ModalHeader>
        <form className="space-y-4" onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Unit label" htmlFor="label" required error={errors.label?.message}>
              <Input id="label" placeholder="101" error={!!errors.label} {...register('label')} />
            </FormField>
            <FormField label="Floor" htmlFor="floor" error={errors.floor?.message}>
              <Input id="floor" type="number" {...register('floor')} />
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Bedrooms" htmlFor="bedrooms" error={errors.bedrooms?.message}>
              <Input id="bedrooms" type="number" {...register('bedrooms')} />
            </FormField>
            <FormField label="Bathrooms" htmlFor="bathrooms" error={errors.bathrooms?.message}>
              <Input id="bathrooms" type="number" {...register('bathrooms')} />
            </FormField>
            <FormField label="Size (sqft)" htmlFor="sizeSqft" error={errors.sizeSqft?.message}>
              <Input id="sizeSqft" type="number" {...register('sizeSqft')} />
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Monthly rent (₹)" htmlFor="rentAmount" required error={errors.rentAmount?.message}>
              <Input id="rentAmount" type="number" placeholder="16000" error={!!errors.rentAmount} {...register('rentAmount')} />
            </FormField>
            <FormField label="Deposit (₹)" htmlFor="depositAmount" error={errors.depositAmount?.message}>
              <Input id="depositAmount" type="number" placeholder="32000" {...register('depositAmount')} />
            </FormField>
          </div>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              Add unit
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
