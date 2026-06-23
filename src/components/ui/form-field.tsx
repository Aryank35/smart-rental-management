import * as React from 'react'
import { Label } from './label'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  label?: string
  htmlFor?: string
  required?: boolean
  error?: string
  hint?: string
  className?: string
  children: React.ReactNode
}

/** Label + control + (error|hint) layout used across all forms. */
export function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
