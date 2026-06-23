import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Mail, Phone, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { FormField } from '@/components/ui/form-field'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/use-auth'
import { registerSchema, type RegisterInput } from '@/features/auth/schemas'

export function RegisterPage() {
  const { register: registerAction } = useAuth()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  })

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">Join TenantFlow in under a minute.</p>
      </div>

      <form
        className="space-y-4"
        onSubmit={handleSubmit((d) => registerAction.mutate(d))}
        noValidate
      >
        <FormField label="Full name" htmlFor="name" required error={errors.name?.message}>
          <Input
            id="name"
            placeholder="Aarav Sharma"
            leadingIcon={<User />}
            autoComplete="name"
            error={!!errors.name}
            {...register('name')}
          />
        </FormField>

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

        <FormField
          label="Phone"
          htmlFor="phone"
          required
          error={errors.phone?.message}
          hint="10-digit Indian mobile number"
        >
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            placeholder="9876543210"
            leadingIcon={<Phone />}
            autoComplete="tel"
            error={!!errors.phone}
            {...register('phone')}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Password"
            htmlFor="password"
            required
            error={errors.password?.message}
          >
            <PasswordInput
              id="password"
              placeholder="••••••••"
              autoComplete="new-password"
              error={!!errors.password}
              {...register('password')}
            />
          </FormField>
          <FormField
            label="Confirm"
            htmlFor="confirmPassword"
            required
            error={errors.confirmPassword?.message}
          >
            <PasswordInput
              id="confirmPassword"
              placeholder="••••••••"
              autoComplete="new-password"
              error={!!errors.confirmPassword}
              {...register('confirmPassword')}
            />
          </FormField>
        </div>

        <div className="space-y-1">
          <Label className="flex cursor-pointer items-start gap-2 font-normal text-muted-foreground">
            <Checkbox
              className="mt-0.5"
              checked={watch('acceptTerms') ?? false}
              onCheckedChange={(v) => setValue('acceptTerms', v === true, { shouldValidate: true })}
            />
            <span>
              I agree to the{' '}
              <Link to="#" className="font-medium text-primary hover:underline">
                Terms
              </Link>{' '}
              and{' '}
              <Link to="#" className="font-medium text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </Label>
          {errors.acceptTerms && (
            <p className="text-xs font-medium text-destructive">{errors.acceptTerms.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" size="lg" loading={registerAction.isPending}>
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
