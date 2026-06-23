import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional leading icon (rendered inside the field). */
  leadingIcon?: React.ReactNode
  /** Optional trailing icon or action (rendered inside the field). */
  trailingIcon?: React.ReactNode
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leadingIcon, trailingIcon, error, ...props }, ref) => {
    const base =
      'flex h-10 w-full rounded-md border border-input bg-background text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50'

    if (leadingIcon || trailingIcon) {
      return (
        <div
          className={cn(
            'flex h-10 w-full items-center rounded-md border border-input bg-background transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 focus-within:ring-offset-background',
            error && 'border-destructive focus-within:ring-destructive',
            className
          )}
        >
          {leadingIcon && (
            <span className="pl-3 text-muted-foreground [&_svg]:size-4">{leadingIcon}</span>
          )}
          <input
            type={type}
            ref={ref}
            className="h-full w-full bg-transparent px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            {...props}
          />
          {trailingIcon && (
            <span className="pr-3 text-muted-foreground [&_svg]:size-4">{trailingIcon}</span>
          )}
        </div>
      )
    }

    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          base,
          'px-3 py-2',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
