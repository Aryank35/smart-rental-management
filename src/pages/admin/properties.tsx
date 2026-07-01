import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Building2, DoorOpen, Home, Plus } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { createProperty } from '@/features/admin/api'
import { adminKeys, useProperties } from '@/features/admin/queries'
import { propertySchema, type PropertyInput } from '@/features/admin/schemas'
import { propertyTypeLabels } from '@/features/admin/utils'
import { toast } from '@/hooks/use-toast'
import { ErrorState, StatCard } from './components/admin-ui'

export function AdminPropertiesPage() {
  const properties = useProperties()
  const [modalOpen, setModalOpen] = useState(false)

  const stats = useMemo(() => {
    const rows = properties.data ?? []
    return {
      properties: rows.length,
      units: rows.reduce((s, p) => s + p.unitCount, 0),
      occupied: rows.reduce((s, p) => s + p.occupiedCount, 0),
      vacant: rows.reduce((s, p) => s + p.vacantCount, 0),
    }
  }, [properties.data])

  return (
    <PageContainer
      title="Properties"
      description="Manage your buildings and their units."
      actions={
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="size-4" />
          Add property
        </Button>
      }
    >
      {properties.isError ? (
        <ErrorState onRetry={properties.refetch} />
      ) : properties.isLoading || !properties.data ? (
        <PropertiesSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Properties" value={stats.properties} icon={Building2} />
            <StatCard label="Total units" value={stats.units} icon={Home} />
            <StatCard
              label="Occupied"
              value={stats.occupied}
              icon={DoorOpen}
              iconClassName="bg-success/10 text-success"
            />
            <StatCard
              label="Vacant"
              value={stats.vacant}
              icon={DoorOpen}
              iconClassName="bg-warning/10 text-warning"
            />
          </div>

          {properties.data.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No properties yet"
              description="Add your first building to start assigning units and tenants."
              action={<Button onClick={() => setModalOpen(true)}>Add property</Button>}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {properties.data.map((p) => (
                <Link key={p.id} to={`/admin/properties/${p.id}`}>
                  <Card className="h-full transition-colors hover:border-primary/40 hover:bg-accent/40">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Building2 className="size-5" />
                        </span>
                        <Badge variant="secondary">{propertyTypeLabels[p.type]}</Badge>
                      </div>
                      <h3 className="mt-3 truncate font-semibold">{p.name}</h3>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {p.addressLine}, {p.city}
                      </p>
                      <div className="mt-4 flex items-center gap-4 text-sm">
                        <span className="font-medium">{p.unitCount} units</span>
                        <span className="text-success">{p.occupiedCount} occupied</span>
                        <span className="text-warning">{p.vacantCount} vacant</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <PropertyFormModal open={modalOpen} onOpenChange={setModalOpen} />
    </PageContainer>
  )
}

function PropertyFormModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PropertyInput>({
    resolver: zodResolver(propertySchema),
    defaultValues: { type: 'apartment', name: '', addressLine: '', city: '' },
  })

  const mutation = useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.properties() })
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() })
      toast.success('Property added.')
      reset()
      onOpenChange(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Add property</ModalTitle>
          <ModalDescription>Create a building. You’ll add units to it next.</ModalDescription>
        </ModalHeader>
        <form className="space-y-4" onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate>
          <FormField label="Property name" htmlFor="name" required error={errors.name?.message}>
            <Input id="name" placeholder="Greenwood Residency" error={!!errors.name} {...register('name')} />
          </FormField>

          <FormField label="Type" required error={errors.type?.message}>
            <Select value={watch('type')} onValueChange={(v) => setValue('type', v as PropertyInput['type'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(propertyTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Address" htmlFor="addressLine" required error={errors.addressLine?.message}>
            <Input id="addressLine" placeholder="12 MG Road" error={!!errors.addressLine} {...register('addressLine')} />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="City" htmlFor="city" required error={errors.city?.message}>
              <Input id="city" placeholder="Bengaluru" error={!!errors.city} {...register('city')} />
            </FormField>
            <FormField label="State" htmlFor="state" error={errors.state?.message}>
              <Input id="state" placeholder="Karnataka" {...register('state')} />
            </FormField>
            <FormField label="Pincode" htmlFor="pincode" error={errors.pincode?.message}>
              <Input id="pincode" placeholder="560001" {...register('pincode')} />
            </FormField>
          </div>

          <FormField label="Notes" htmlFor="notes" error={errors.notes?.message}>
            <Textarea id="notes" placeholder="Optional notes about this property" {...register('notes')} />
          </FormField>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              Add property
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

function PropertiesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[112px] rounded-lg" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[168px] rounded-lg" />
        ))}
      </div>
    </div>
  )
}
