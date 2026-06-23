import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { AtSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { FormField } from '@/components/ui/form-field'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/use-auth'
import { loginSchema, type LoginInput } from '@/features/auth/schemas'

export function LoginPage() {
  const { login } = useAuth()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '', remember: true },
  })

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your TenantFlow account.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit((d) => login.mutate(d))} noValidate>
        <FormField
          label="Email or phone"
          htmlFor="identifier"
          required
          error={errors.identifier?.message}
        >
          <Input
            id="identifier"
            placeholder="you@example.com or 9876543210"
            leadingIcon={<AtSign />}
            autoComplete="username"
            error={!!errors.identifier}
            {...register('identifier')}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" required error={errors.password?.message}>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            autoComplete="current-password"
            error={!!errors.password}
            {...register('password')}
          />
        </FormField>

        <div className="flex items-center justify-between">
          <Label className="flex cursor-pointer items-center gap-2 font-normal text-muted-foreground">
            <Checkbox
              checked={watch('remember')}
              onCheckedChange={(v) => setValue('remember', v === true)}
            />
            Remember me
          </Label>
          <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={login.isPending}>
          Sign in
        </Button>
      </form>

      <div className="rounded-md border border-dashed border-border bg-muted/40 p-3 text-center text-xs text-muted-foreground">
        Demo: <span className="font-medium text-foreground">tenant@tenantflow.app</span> or{' '}
        <span className="font-medium text-foreground">admin@tenantflow.app</span> ·{' '}
        <span className="font-medium text-foreground">password1</span>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </div>
  )
}
