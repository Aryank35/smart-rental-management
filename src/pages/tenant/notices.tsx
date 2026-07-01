import { useMemo, useState } from 'react'
import { Bell } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { PageContainer } from '@/components/layout/page-container'
import { Skeleton } from '@/components/ui/skeleton'
import { useMarkNoticeRead, useNotices } from '@/features/tenant/queries'
import { noticeCategoryBadge } from '@/features/tenant/utils'
import { cn, formatDate } from '@/lib/utils'

export function TenantNoticesPage() {
  const notices = useNotices()
  const markRead = useMarkNoticeRead()
  const [expanded, setExpanded] = useState<string | null>(null)

  const unread = useMemo(
    () => (notices.data ?? []).filter((n) => !n.read).length,
    [notices.data]
  )

  const toggle = (id: string, read: boolean) => {
    setExpanded((cur) => (cur === id ? null : id))
    if (!read) markRead.mutate(id)
  }

  return (
    <PageContainer
      title="Notices"
      description={unread > 0 ? `${unread} unread announcement${unread > 1 ? 's' : ''}` : 'Announcements from your property manager.'}
    >
      {notices.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn't load notices</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            Please try again in a moment.
            <Button size="sm" variant="outline" onClick={() => notices.refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : notices.isLoading || !notices.data ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[92px] rounded-lg" />
          ))}
        </div>
      ) : notices.data.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notices yet"
          description="Announcements from your property manager will show up here."
        />
      ) : (
        <div className="space-y-3">
          {notices.data.map((n) => {
            const cat = noticeCategoryBadge(n.category)
            const isOpen = expanded === n.id
            return (
              <Card
                key={n.id}
                className={cn(
                  'cursor-pointer transition-colors hover:border-primary/40',
                  !n.read && 'border-primary/30 bg-primary/[0.03]'
                )}
                onClick={() => toggle(n.id, n.read)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {!n.read && <span className="size-2 rounded-full bg-primary" />}
                        <h3 className="font-semibold">{n.title}</h3>
                        <Badge variant={cat.variant}>{cat.label}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{n.excerpt}</p>
                      {isOpen && n.body && (
                        <p className="mt-3 whitespace-pre-line text-sm text-foreground/90">
                          {n.body}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(n.date)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </PageContainer>
  )
}
