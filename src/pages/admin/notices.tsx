import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Bell, Eye, Plus, Trash2 } from 'lucide-react'
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
import { createNotice, deleteNotice } from '@/features/admin/api'
import { adminKeys, useAdminNotices } from '@/features/admin/queries'
import { noticeSchema, type NoticeInput } from '@/features/admin/schemas'
import type { NoticeCategory } from '@/features/admin/types'
import { noticeCategoryBadge } from '@/features/tenant/utils'
import { toast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import { ErrorState } from './components/admin-ui'

const categoryLabels: Record<NoticeCategory, string> = {
  maintenance: 'Maintenance',
  rent: 'Rent',
  community: 'Community',
  emergency: 'Emergency',
}

export function AdminNoticesPage() {
  const notices = useAdminNotices()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const remove = useMutation({
    mutationFn: (id: string) => deleteNotice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.notices() })
      toast.success('Notice deleted.')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <PageContainer
      title="Notices"
      description="Broadcast announcements to all your tenants."
      actions={
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          New notice
        </Button>
      }
    >
      {notices.isError ? (
        <ErrorState onRetry={notices.refetch} />
      ) : notices.isLoading || !notices.data ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-lg" />
          ))}
        </div>
      ) : notices.data.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notices yet"
          description="Post your first announcement — tenants will see it in their portal."
          action={<Button onClick={() => setOpen(true)}>New notice</Button>}
        />
      ) : (
        <div className="space-y-3">
          {notices.data.map((n) => {
            const cat = noticeCategoryBadge(n.category)
            return (
              <Card key={n.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{n.title}</h3>
                        <Badge variant={cat.variant}>{cat.label}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{n.excerpt}</p>
                      {n.body && (
                        <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground/90">
                          {n.body}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatDate(n.date)}</span>
                        <span className="inline-flex items-center gap-1">
                          <Eye className="size-3.5" /> {n.readCount} read
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive"
                      aria-label="Delete notice"
                      onClick={() => remove.mutate(n.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <NoticeFormModal open={open} onOpenChange={setOpen} />
    </PageContainer>
  )
}

function NoticeFormModal({
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
  } = useForm<NoticeInput>({
    resolver: zodResolver(noticeSchema),
    defaultValues: { category: 'community', title: '', excerpt: '', body: '' },
  })

  const mutation = useMutation({
    mutationFn: createNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.notices() })
      toast.success('Notice published.')
      reset()
      onOpenChange(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>New notice</ModalTitle>
          <ModalDescription>Publish an announcement to all tenants.</ModalDescription>
        </ModalHeader>
        <form className="space-y-4" onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate>
          <FormField label="Title" htmlFor="title" required error={errors.title?.message}>
            <Input id="title" placeholder="Water supply interruption" error={!!errors.title} {...register('title')} />
          </FormField>

          <FormField label="Category" required error={errors.category?.message}>
            <Select value={watch('category')} onValueChange={(v) => setValue('category', v as NoticeCategory)}>
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

          <FormField label="Summary" htmlFor="excerpt" required error={errors.excerpt?.message}>
            <Input id="excerpt" placeholder="One-line summary shown in the list" error={!!errors.excerpt} {...register('excerpt')} />
          </FormField>

          <FormField label="Details" htmlFor="body" error={errors.body?.message}>
            <Textarea id="body" placeholder="Full announcement text (optional)" className="min-h-[120px]" {...register('body')} />
          </FormField>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              Publish
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
