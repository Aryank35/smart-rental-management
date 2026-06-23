import * as React from 'react'
import { cn } from '@/lib/utils'

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Page heading. */
  title?: string
  description?: string
  /** Right-aligned actions (buttons, filters). */
  actions?: React.ReactNode
  /** Constrain content width for readability. */
  size?: 'default' | 'narrow' | 'full'
}

const sizeClasses = {
  default: 'max-w-7xl',
  narrow: 'max-w-3xl',
  full: 'max-w-none',
}

/** Standard page wrapper: consistent padding, max-width, and a header row. */
export function PageContainer({
  title,
  description,
  actions,
  size = 'default',
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn('mx-auto w-full px-4 py-5 sm:px-6 lg:py-8', sizeClasses[size], className)}
      {...props}
    >
      {(title || actions) && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {title && (
              <h1 className="truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
