import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Briefcase, KeyRound, Phone, User as UserIcon, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { PageContainer } from '@/components/layout/page-container'
import { PasswordInput } from '@/components/ui/password-input'
import { changePassword as changePasswordApi, completeProfile } from '@/features/auth/api'
import { profileSetupSchema, type ProfileSetupInput } from '@/features/auth/schemas'
import { changePasswordSchema, type ChangePasswordInput } from '@/features/admin/schemas'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from '@/hooks/use-toast'

export function TenantSettingsPage() {
  return (
    <PageContainer title="Settings" description="Manage your profile and password." size="narrow">
      <div className="space-y-6">
        <ProfileForm />
        <PasswordForm />
      </div>
    </PageContainer>
  )
}

function ProfileForm() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileSetupInput>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      occupation: user?.occupation ?? '',
      emergencyName: user?.emergencyContact?.name ?? '',
      emergencyPhone: user?.emergencyContact?.phone ?? '',
      emergencyRelation: user?.emergencyContact?.relation ?? '',
    },
  })

  const mutation = useMutation({
    mutationFn: (input: ProfileSetupInput) => completeProfile(input, user?.avatarUrl),
    onSuccess: (updated) => {
      setUser(updated)
      toast.success('Profile updated.')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserIcon className="size-4" /> Profile
        </CardTitle>
        <CardDescription>Your account and emergency contact details.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <ReadOnly label="Name" value={user?.name ?? '—'} />
          <ReadOnly label="Email" value={user?.email ?? '—'} />
          <ReadOnly label="Phone" value={user?.phone ?? '—'} />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate>
          <FormField label="Occupation" htmlFor="occupation" required error={errors.occupation?.message}>
            <Input id="occupation" leadingIcon={<Briefcase />} placeholder="Software Engineer" error={!!errors.occupation} {...register('occupation')} />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Emergency contact" htmlFor="emergencyName" required error={errors.emergencyName?.message}>
              <Input id="emergencyName" leadingIcon={<Users />} placeholder="Contact name" error={!!errors.emergencyName} {...register('emergencyName')} />
            </FormField>
            <FormField label="Emergency phone" htmlFor="emergencyPhone" required error={errors.emergencyPhone?.message}>
              <Input id="emergencyPhone" leadingIcon={<Phone />} placeholder="9876543210" error={!!errors.emergencyPhone} {...register('emergencyPhone')} />
            </FormField>
          </div>

          <FormField label="Relationship" htmlFor="emergencyRelation" error={errors.emergencyRelation?.message}>
            <Input id="emergencyRelation" placeholder="e.g. Parent, Sibling" {...register('emergencyRelation')} />
          </FormField>

          <div className="flex justify-end">
            <Button type="submit" loading={mutation.isPending}>
              Save profile
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function PasswordForm() {
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
        <CardDescription>Choose a strong password you don’t use elsewhere.</CardDescription>
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

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/40 p-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-sm font-medium">{value}</p>
    </div>
  )
}
