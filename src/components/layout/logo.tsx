import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  /** Hide the wordmark, showing only the mark (useful for collapsed sidebars). */
  iconOnly?: boolean
}

export function Logo({ className, iconOnly }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <svg viewBox="0 0 32 32" className="size-5" aria-hidden="true">
          <path d="M9 22V13l7-5 7 5v9h-5v-6h-4v6H9z" fill="currentColor" />
        </svg>
      </div>
      {!iconOnly && (
        <span className="text-lg font-bold tracking-tight text-foreground">
          Tenant<span className="text-primary">Flow</span>
        </span>
      )}
    </div>
  )
}
