import { Bell } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { WidgetCard } from './widget-card'
import { cn, formatDate } from '@/lib/utils'
import { noticeCategoryBadge } from '@/features/tenant/utils'
import type { Notice } from '@/features/tenant/types'

export function RecentNotices({ notices }: { notices: Notice[] }) {
  return (
    <WidgetCard title="Recent Notices" viewAllTo="/app/notices">
      {notices.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notices"
          description="Announcements from your property will appear here."
          className="border-0 py-6"
        />
      ) : (
        <ul className="space-y-3">
          {notices.map((n) => {
            const badge = noticeCategoryBadge(n.category)
            return (
              <li
                key={n.id}
                className="flex gap-3 rounded-md p-2 transition-colors hover:bg-muted/50"
              >
                {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
                <div className={cn('min-w-0 flex-1', n.read && 'pl-5')}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-snug">{n.title}</p>
                    <Badge variant={badge.variant} className="shrink-0">
                      {badge.label}
                    </Badge>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{n.excerpt}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{formatDate(n.date)}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </WidgetCard>
  )
}
