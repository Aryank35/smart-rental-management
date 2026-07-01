import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Clock3, MessageSquareWarning, ShieldAlert } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { updateComplaint } from '@/features/admin/api'
import { adminKeys, useAdminComplaints } from '@/features/admin/queries'
import type { AdminComplaint, ComplaintStatus } from '@/features/admin/types'
import { complaintPriorityBadge, complaintStatusBadge } from '@/features/tenant/utils'
import { toast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import { ErrorState, StatCard } from './components/admin-ui'

type Filter = 'all' | 'open' | 'in-progress' | 'resolved' | 'closed'

const statusLabels: Record<ComplaintStatus, string> = {
  open: 'Open',
  'in-progress': 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

export function AdminComplaintsPage() {
  const complaints = useAdminComplaints()
  const [filter, setFilter] = useState<Filter>('all')
  const [manage, setManage] = useState<AdminComplaint | null>(null)

  const stats = useMemo(() => {
    const rows = complaints.data ?? []
    return {
      total: rows.length,
      active: rows.filter((c) => c.status === 'open' || c.status === 'in-progress').length,
      urgent: rows.filter((c) => c.priority === 'urgent' && c.status !== 'closed').length,
      resolved: rows.filter((c) => c.status === 'resolved' || c.status === 'closed').length,
    }
  }, [complaints.data])

  const filtered = useMemo(
    () => (complaints.data ?? []).filter((c) => (filter === 'all' ? true : c.status === filter)),
    [complaints.data, filter]
  )

  return (
    <PageContainer title="Complaints" description="Triage and resolve tenant maintenance requests.">
      {complaints.isError ? (
        <ErrorState onRetry={complaints.refetch} />
      ) : complaints.isLoading || !complaints.data ? (
        <ComplaintsSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total" value={stats.total} icon={MessageSquareWarning} />
            <StatCard
              label="Active"
              value={stats.active}
              icon={Clock3}
              iconClassName="bg-warning/10 text-warning"
              emphasize={stats.active > 0}
            />
            <StatCard
              label="Urgent"
              value={stats.urgent}
              icon={ShieldAlert}
              iconClassName="bg-destructive/10 text-destructive"
              emphasize={stats.urgent > 0}
            />
            <StatCard
              label="Resolved"
              value={stats.resolved}
              icon={CheckCircle2}
              iconClassName="bg-success/10 text-success"
            />
          </div>

          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="in-progress">In progress</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
          </Tabs>

          {filtered.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Nothing here"
              description="No complaints match this filter."
              className="py-12"
            />
          ) : (
            <Card>
              <CardContent className="p-0 sm:p-2">
                <TableWrapper>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Issue</TableHead>
                        <TableHead className="hidden md:table-cell">Tenant</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Assigned</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((c) => {
                        const status = complaintStatusBadge(c.status)
                        const priority = complaintPriorityBadge(c.priority)
                        return (
                          <TableRow key={c.id}>
                            <TableCell>
                              <p className="font-medium">{c.title}</p>
                              <p className="font-mono text-xs text-muted-foreground">
                                {c.referenceNo}
                              </p>
                            </TableCell>
                            <TableCell className="hidden text-sm md:table-cell">
                              {c.tenantName}
                            </TableCell>
                            <TableCell>
                              <Badge variant={priority.variant}>{priority.label}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={status.variant} dot>
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                              {c.assignedTo ?? 'Unassigned'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" onClick={() => setManage(c)}>
                                Manage
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableWrapper>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <ManageComplaintModal complaint={manage} onClose={() => setManage(null)} />
    </PageContainer>
  )
}

function ManageComplaintModal({
  complaint,
  onClose,
}: {
  complaint: AdminComplaint | null
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<ComplaintStatus>('open')
  const [assignedTo, setAssignedTo] = useState('')
  const [note, setNote] = useState('')

  // Sync local state whenever a new complaint is opened.
  const [lastId, setLastId] = useState<string | null>(null)
  if (complaint && complaint.id !== lastId) {
    setLastId(complaint.id)
    setStatus(complaint.status)
    setAssignedTo(complaint.assignedTo ?? '')
    setNote(complaint.resolutionNote ?? '')
  }

  const mutation = useMutation({
    mutationFn: () =>
      updateComplaint(complaint!.id, {
        status,
        assignedTo: assignedTo.trim() || null,
        resolutionNote: note.trim() || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.complaints() })
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() })
      toast.success('Complaint updated.')
      onClose()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <Modal open={!!complaint} onOpenChange={(o) => !o && onClose()}>
      <ModalContent>
        {complaint && (
          <>
            <ModalHeader>
              <ModalTitle>{complaint.title}</ModalTitle>
              <ModalDescription>
                {complaint.tenantName} · {complaint.location} · Raised{' '}
                {formatDate(complaint.raisedAt)}
              </ModalDescription>
            </ModalHeader>

            <p className="rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
              {complaint.description}
            </p>

            <FormField label="Status">
              <Select value={status} onValueChange={(v) => setStatus(v as ComplaintStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Assigned to" htmlFor="assignedTo">
              <Input
                id="assignedTo"
                placeholder="e.g. Maintenance team"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              />
            </FormField>

            <FormField label="Resolution note" htmlFor="note">
              <Textarea
                id="note"
                placeholder="Add an internal note about the resolution"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </FormField>

            <ModalFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
                Cancel
              </Button>
              <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>
                Save changes
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

function ComplaintsSkeleton() {
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
