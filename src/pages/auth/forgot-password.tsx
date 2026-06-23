import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { useAuth } from '@/features/auth/use-auth'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/features/auth/schemas'

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  if (forgotPassword.isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
          <MailCheck className="size-7" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            If an account exists for{' '}
            <span className="font-medium text-foreground">{getValues('email')}</span>, you'll
            receive a password reset link shortly.
          </p>
        </div>
        <Button variant="outline" className="w-full" asChild>
          <Link to="/login">
            <ArrowLeft /> Back to sign in
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Forgot password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={handleSubmit((d) => forgotPassword.mutate(d))}
        noValidate
      >
        <FormField label="Email" htmlFor="email" required error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            leadingIcon={<Mail />}
            autoComplete="email"
            error={!!errors.email}
            {...register('email')}
          />
        </FormField>
        <Button type="submit" className="w-full" size="lg" loading={forgotPassword.isPending}>
          Send reset link
        </Button>
      </form>

      <Link
        to="/login"
        className="flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to sign in
      </Link>
    </div>
  )
}
