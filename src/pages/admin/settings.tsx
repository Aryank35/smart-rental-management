import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Building2, KeyRound, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { PageContainer } from '@/components/layout/page-container'
import { PasswordInput } from '@/components/ui/password-input'
import { Skeleton } from '@/components/ui/skeleton'
import { changePassword as changePasswordApi } from '@/features/auth/api'
import { updateSettings } from '@/features/admin/api'
import { adminKeys, useSettings } from '@/features/admin/queries'
import {
  changePasswordSchema,
  settingsSchema,
  type ChangePasswordInput,
  type SettingsInput,
} from '@/features/admin/schemas'
import { toast } from '@/hooks/use-toast'
import { ErrorState } from './components/admin-ui'

export function AdminSettingsPage() {
  const settings = useSettings()

  return (
    <PageContainer title="Settings" description="Manage your organization and billing defaults." size="narrow">
      {settings.isError ? (
        <ErrorState onRetry={settings.refetch} />
      ) : settings.isLoading || !settings.data ? (
        <div className="space-y-4">
          <Skeleton className="h-[280px] rounded-lg" />
          <Skeleton className="h-[220px] rounded-lg" />
        </div>
      ) : (
        <div className="space-y-6">
          <OrgSettingsForm
            defaults={{
              name: settings.data.name,
              currency: settings.data.settings.currency,
              dueDayOfMonth: settings.data.settings.dueDayOfMonth,
              penaltyPerDay: settings.data.settings.penaltyPerDay,
              graceDays: settings.data.settings.graceDays,
              supportEmail: settings.data.settings.supportEmail,
              supportPhone: settings.data.settings.supportPhone,
            }}
          />
          <ChangePasswordForm />
        </div>
      )}
    </PageContainer>
  )
}

function OrgSettingsForm({ defaults }: { defaults: SettingsInput }) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaults,
  })

  useEffect(() => {
    reset(defaults)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaults.name])

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (org) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.settings() })
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() })
      reset({
        name: org.name,
        currency: org.settings.currency,
        dueDayOfMonth: org.settings.dueDayOfMonth,
        penaltyPerDay: org.settings.penaltyPerDay,
        graceDays: org.settings.graceDays,
        supportEmail: org.settings.supportEmail,
        supportPhone: org.settings.supportPhone,
      })
      toast.success('Settings saved.')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="size-4" /> Organization
        </CardTitle>
        <CardDescription>Your business details and billing defaults.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate>
          <FormField label="Business name" htmlFor="name" required error={errors.name?.message}>
            <Input id="name" error={!!errors.name} {...register('name')} />
          </FormField>

          <div className="flex items-center gap-2 pt-2 text-sm font-medium text-muted-foreground">
            <SlidersHorizontal className="size-4" /> Billing defaults
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Currency" htmlFor="currency" error={errors.currency?.message}>
              <Input id="currency" {...register('currency')} />
            </FormField>
            <FormField label="Rent due day" htmlFor="dueDayOfMonth" error={errors.dueDayOfMonth?.message}>
              <Input id="dueDayOfMonth" type="number" {...register('dueDayOfMonth')} />
            </FormField>
            <FormField label="Penalty / day (₹)" htmlFor="penaltyPerDay" error={errors.penaltyPerDay?.message}>
              <Input id="penaltyPerDay" type="number" {...register('penaltyPerDay')} />
            </FormField>
            <FormField label="Grace days" htmlFor="graceDays" error={errors.graceDays?.message}>
              <Input id="graceDays" type="number" {...register('graceDays')} />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Support email" htmlFor="supportEmail" error={errors.supportEmail?.message}>
              <Input id="supportEmail" placeholder="help@yourco.com" {...register('supportEmail')} />
            </FormField>
            <FormField label="Support phone" htmlFor="supportPhone" error={errors.supportPhone?.message}>
              <Input id="supportPhone" placeholder="080-xxxxxxx" {...register('supportPhone')} />
            </FormField>
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={mutation.isPending} disabled={!isDirty}>
              Save changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  })

  const mutation = useMutation({
    mutationFn: (d: ChangePasswordInput) => changePasswordApi(d.currentPassword, d.newPassword),
    onSuccess: () => {
      toast.success('Password updated.')
      reset()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <KeyRound className="size-4" /> Change password
        </CardTitle>
        <CardDescription>Update the password for your admin login.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate>
          <FormField label="Current password" htmlFor="currentPassword" required error={errors.currentPassword?.message}>
            <PasswordInput id="currentPassword" autoComplete="current-password" error={!!errors.currentPassword} {...register('currentPassword')} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="New password" htmlFor="newPassword" required error={errors.newPassword?.message}>
              <PasswordInput id="newPassword" autoComplete="new-password" error={!!errors.newPassword} {...register('newPassword')} />
            </FormField>
            <FormField label="Confirm" htmlFor="confirmPassword" required error={errors.confirmPassword?.message}>
              <PasswordInput id="confirmPassword" autoComplete="new-password" error={!!errors.confirmPassword} {...register('confirmPassword')} />
            </FormField>
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={mutation.isPending}>
              Update password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
