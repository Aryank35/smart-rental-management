import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { CheckCircle2, Clock3, MessageSquarePlus, ShieldAlert, Wrench } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Textarea } from '@/components/ui/textarea'
import { createComplaint } from '@/features/tenant/api'
import { complaintSchema, type ComplaintInput } from '@/features/tenant/schemas'
import { tenantKeys, useComplaints } from '@/features/tenant/queries'
import {
  complaintPriorityBadge,
  complaintStatusBadge,
} from '@/features/tenant/utils'
import type { Complaint, ComplaintCategory, ComplaintPriority } from '@/features/tenant/types'
import { toast } from '@/hooks/use-toast'
import { cn, formatDate } from '@/lib/utils'

const categoryLabels: Record<ComplaintCategory, string> = {
  maintenance: 'Maintenance',
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  cleaning: 'Cleaning',
  security: 'Security',
  other: 'Other',
}

const priorityLabels: Record<ComplaintPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export function ComplaintsPage() {
  const complaints = useComplaints()
  const [modalOpen, setModalOpen] = useState(false)

  const stats = useMemo(() => {
    const rows = complaints.data ?? []
    return {
      total: rows.length,
      active: rows.filter((c) => c.status === 'open' || c.status === 'in-progress').length,
      urgent: rows.filter((c) => c.priority === 'urgent' && c.status !== 'closed').length,
      resolved: rows.filter((c) => c.status === 'resolved' || c.status === 'closed').length,
    }
  }, [complaints.data])

  const activeComplaints = useMemo(
    () =>
      (complaints.data ?? []).filter(
        (complaint) => complaint.status === 'open' || complaint.status === 'in-progress'
      ),
    [complaints.data]
  )

  return (
    <PageContainer
      title="Complaints"
      description="Raise maintenance requests and track resolution progress."
      actions={
        <Button onClick={() => setModalOpen(true)}>
          <MessageSquarePlus className="size-4" />
          Raise complaint
        </Button>
      }
    >
      {complaints.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn't load complaints</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            Please try again in a moment.
            <Button size="sm" variant="outline" onClick={() => complaints.refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : complaints.isLoading || !complaints.data ? (
        <ComplaintsSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ComplaintStatCard
              label="Total"
              value={stats.total}
              hint="All requests"
              icon={Wrench}
              iconClassName="bg-primary/10 text-primary"
            />
            <ComplaintStatCard
              label="Active"
              value={stats.active}
              hint="Open or in progress"
              icon={Clock3}
              iconClassName="bg-warning/10 text-warning"
              emphasize={stats.active > 0}
            />
            <ComplaintStatCard
              label="Urgent"
              value={stats.urgent}
              hint="High attention"
              icon={ShieldAlert}
              iconClassName="bg-destructive/10 text-destructive"
              emphasize={stats.urgent > 0}
            />
            <ComplaintStatCard
              label="Resolved"
              value={stats.resolved}
              hint="Completed requests"
              icon={CheckCircle2}
              iconClassName="bg-success/10 text-success"
            />
          </div>

          <ActiveComplaints complaints={activeComplaints} onRaise={() => setModalOpen(true)} />
          <ComplaintsTable complaints={complaints.data} />
        </div>
      )}

      <RaiseComplaintModal open={modalOpen} onOpenChange={setModalOpen} />
    </PageContainer>
  )
}

interface ComplaintStatCardProps {
  label: string
  value: number
  hint: string
  icon: typeof Wrench
  iconClassName: string
  emphasize?: boolean
}

function ComplaintStatCard({
  label,
  value,
  hint,
  icon: Icon,
  iconClassName,
  emphasize,
}: ComplaintStatCardProps) {
  return (
    <Card className={cn(emphasize && 'border-destructive/40')}>
      <CardContent className="p-4">
        <span className={cn('flex size-9 items-center justify-center rounded-lg', iconClassName)}>
          <Icon className="size-5" />
        </span>
        <p className="mt-3 text-xs text-muted-foreground">{label}</p>
        <p
          className={cn(
            'mt-0.5 text-lg font-bold tracking-tight tabular-nums sm:text-xl',
            emphasize && 'text-destructive'
          )}
        >
          {value}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

function ActiveComplaints({
  complaints,
  onRaise,
}: {
  complaints: Complaint[]
  onRaise: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Active Requests</CardTitle>
        <CardDescription>Issues currently awaiting action or completion.</CardDescription>
      </CardHeader>
      <CardContent>
        {complaints.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No active complaints"
            description="Everything looks settled right now."
            action={
              <Button variant="outline" onClick={onRaise}>
                Raise complaint
              </Button>
            }
            className="py-10"
          />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {complaints.map((complaint) => {
              const status = complaintStatusBadge(complaint.status)
              const priority = complaintPriorityBadge(complaint.priority)
              return (
                <div
                  key={complaint.id}
                  className="rounded-lg border border-border bg-muted/30 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{complaint.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {categoryLabels[complaint.category]} - {complaint.location}
                      </p>
                    </div>
                    <Badge variant={status.variant} dot>
                      {status.label}
                    </Badge>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                    {complaint.description}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={priority.variant}>{priority.label}</Badge>
                      <span className="font-mono text-xs text-muted-foreground">
                        {complaint.referenceNo}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Updated {formatDate(complaint.updatedAt)}
                    </span>
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

function ComplaintsTable({ complaints }: { complaints: Complaint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Complaint History</CardTitle>
      </CardHeader>
      <CardContent>
        {complaints.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No complaints yet"
            description="Requests you raise will appear here with their latest status."
            className="py-10"
          />
        ) : (
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Issue</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden lg:table-cell">Raised</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden xl:table-cell">Assigned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.map((complaint) => {
                  const status = complaintStatusBadge(complaint.status)
                  const priority = complaintPriorityBadge(complaint.priority)
                  return (
                    <TableRow key={complaint.id}>
                      <TableCell>
                        <p className="font-medium">{complaint.title}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {complaint.referenceNo}
                        </p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {categoryLabels[complaint.category]}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                        {formatDate(complaint.raisedAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={priority.variant}>{priority.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant} dot>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground xl:table-cell">
                        {complaint.assignedTo ?? 'Unassigned'}
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

function RaiseComplaintModal({
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
  } = useForm<ComplaintInput>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      title: '',
      category: 'maintenance',
      priority: 'medium',
      location: '',
      description: '',
    },
  })

  const mutation = useMutation({
    mutationFn: createComplaint,
    onSuccess: (complaint) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.complaints() })
      toast.success(`Complaint ${complaint.referenceNo} submitted.`)
      reset()
      onOpenChange(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Raise complaint</ModalTitle>
          <ModalDescription>Share the issue details so the team can route it.</ModalDescription>
        </ModalHeader>

        <form
          className="space-y-4"
          onSubmit={handleSubmit((input) => mutation.mutate(input))}
          noValidate
        >
          <FormField label="Issue title" htmlFor="title" required error={errors.title?.message}>
            <Input
              id="title"
              placeholder="e.g. Bathroom tap leakage"
              error={!!errors.title}
              {...register('title')}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Category" required error={errors.category?.message}>
              <Select
                value={watch('category')}
                onValueChange={(value) =>
                  setValue('category', value as ComplaintCategory, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Priority" required error={errors.priority?.message}>
              <Select
                value={watch('priority')}
                onValueChange={(value) =>
                  setValue('priority', value as ComplaintPriority, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(priorityLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <FormField
            label="Location"
            htmlFor="location"
            required
            error={errors.location?.message}
          >
            <Input
              id="location"
              placeholder="Room, floor, or common area"
              error={!!errors.location}
              {...register('location')}
            />
          </FormField>

          <FormField
            label="Description"
            htmlFor="description"
            required
            error={errors.description?.message}
          >
            <Textarea
              id="description"
              placeholder="Describe what happened and when you noticed it."
              className="min-h-[120px]"
              error={!!errors.description}
              {...register('description')}
            />
          </FormField>

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              Submit complaint
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

function ComplaintsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-[260px] rounded-lg" />
      <Skeleton className="h-[320px] rounded-lg" />
    </div>
  )
}
