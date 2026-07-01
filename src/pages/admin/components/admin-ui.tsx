import type { LucideIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/** Compact KPI card used across the admin pages. */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  iconClassName = 'bg-primary/10 text-primary',
  emphasize,
}: {
  label: string
  value: string | number
  hint?: string
  icon: LucideIcon
  iconClassName?: string
  emphasize?: boolean
}) {
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
        {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  )
}

/** Consistent error card with a retry action. */
export function ErrorState({ onRetry, message }: { onRetry: () => void; message?: string }) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription className="flex items-center justify-between gap-4">
        {message ?? 'We couldn’t load this data.'}
        <Button size="sm" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  )
}
