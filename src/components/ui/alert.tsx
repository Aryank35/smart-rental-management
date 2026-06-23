import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative flex w-full gap-3 rounded-lg border p-4 text-sm [&>svg]:size-5 [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground border-border [&>svg]:text-foreground',
        info: 'border-info/30 bg-info/10 text-info [&>svg]:text-info',
        success: 'border-success/30 bg-success/10 text-success [&>svg]:text-success',
        warning: 'border-warning/30 bg-warning/10 text-warning [&>svg]:text-warning',
        destructive:
          'border-destructive/30 bg-destructive/10 text-destructive [&>svg]:text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const iconForVariant = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  destructive: XCircle,
} as const

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /** Hide the default leading icon. */
  hideIcon?: boolean
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, hideIcon, children, ...props }, ref) => {
    const Icon = iconForVariant[variant ?? 'default']
    return (
      <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
        {!hideIcon && <Icon />}
        <div className="flex-1">{children}</div>
      </div>
    )
  }
)
Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn('mb-1 font-semibold leading-none tracking-tight', className)} {...props} />
  )
)
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-sm opacity-90', className)} {...props} />
))
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertTitle, AlertDescription }
