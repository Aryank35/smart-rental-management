import { CalendarDays, DoorOpen, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import type { OccupancyStatus, Tenancy } from '@/features/tenant/types'

const occupancyBadge: Record<OccupancyStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-success/20 text-success' },
  'notice-period': { label: 'Notice period', className: 'bg-warning/20 text-warning' },
  vacated: { label: 'Vacated', className: 'bg-muted text-muted-foreground' },
}

export function WelcomeCard({ tenancy }: { tenancy: Tenancy }) {
  const greeting = getGreeting()
  const firstName = tenancy.tenantName.split(' ')[0]
  const badge = occupancyBadge[tenancy.occupancy]

  return (
    <Card className="relative overflow-hidden border-0 bg-primary text-primary-foreground">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 85% 15%, white 0, transparent 45%), radial-gradient(circle at 10% 90%, white 0, transparent 40%)',
        }}
      />
      <div className="relative flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-primary-foreground/80">{greeting},</p>
          <h2 className="text-2xl font-bold tracking-tight">{firstName} 👋</h2>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-primary-foreground/90">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" /> {tenancy.propertyName}
            </span>
            <span className="flex items-center gap-1.5">
              <DoorOpen className="size-4" /> Room {tenancy.roomNumber} · Floor {tenancy.floor}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" /> Lease till {formatDate(tenancy.agreementEndsAt)}
            </span>
          </div>
        </div>
        <Badge className={`border-0 ${badge.className}`}>
          <span className="size-1.5 rounded-full bg-current" />
          {badge.label}
        </Badge>
      </div>
    </Card>
  )
}

export function WelcomeCardSkeleton() {
  return <Skeleton className="h-[148px] w-full rounded-lg" />
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
