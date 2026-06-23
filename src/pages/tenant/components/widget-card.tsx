import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface WidgetCardProps {
  title: string
  viewAllTo?: string
  children: React.ReactNode
}

/** Consistent framed widget with a title row and optional "View all" link. */
export function WidgetCard({ title, viewAllTo, children }: WidgetCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {viewAllTo && (
          <Link
            to={viewAllTo}
            className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
          >
            View all <ChevronRight className="size-3.5" />
          </Link>
        )}
      </CardHeader>
      <CardContent className="flex-1">{children}</CardContent>
    </Card>
  )
}

export function WidgetSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card>
      <div className="space-y-4 p-5">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-4 w-14" />
          </div>
        ))}
      </div>
    </Card>
  )
}
