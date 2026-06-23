import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Briefcase, Camera, Phone, User as UserIcon, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { completeProfile } from '@/features/auth/mock-auth'
import { profileSetupSchema, type ProfileSetupInput } from '@/features/auth/schemas'
import { homePathForRole, useAuthStore } from '@/stores/auth-store'
import { toast } from '@/hooks/use-toast'
import { getInitials } from '@/lib/utils'

const MAX_AVATAR_BYTES = 2 * 1024 * 1024 // 2 MB

export function ProfileSetupPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatarUrl)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileSetupInput>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: { occupation: user?.occupation ?? '' },
  })

  const mutation = useMutation({
    mutationFn: (input: ProfileSetupInput) => completeProfile(user!.id, input, avatar),
    onSuccess: (updated) => {
      setUser(updated)
      toast.success('Profile completed. Welcome to TenantFlow!')
      navigate(homePathForRole(updated.role), { replace: true })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.')
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error('Image must be under 2 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setAvatar(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Set up your profile</h1>
        <p className="text-sm text-muted-foreground">
          A few details so we can personalize your experience.
        </p>
      </div>

      {/* Avatar uploader */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Avatar className="size-24">
            {avatar && <AvatarImage src={avatar} alt="Profile" />}
            <AvatarFallback className="text-xl">
              {getInitials(user?.name ?? 'U')}
            </AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background transition-transform group-hover:scale-105">
            <Camera className="size-4" />
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPickImage}
        />
        <p className="text-xs text-muted-foreground">Tap to upload a photo (optional)</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate>
        <FormField label="Occupation" htmlFor="occupation" required error={errors.occupation?.message}>
          <Input
            id="occupation"
            placeholder="e.g. Software Engineer"
            leadingIcon={<Briefcase />}
            error={!!errors.occupation}
            {...register('occupation')}
          />
        </FormField>

        <div className="pt-1">
          <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Users className="size-4 text-muted-foreground" /> Emergency contact
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Contact name"
            htmlFor="emergencyName"
            required
            error={errors.emergencyName?.message}
          >
            <Input
              id="emergencyName"
              placeholder="Full name"
              leadingIcon={<UserIcon />}
              error={!!errors.emergencyName}
              {...register('emergencyName')}
            />
          </FormField>
          <FormField label="Relation" htmlFor="emergencyRelation" error={errors.emergencyRelation?.message}>
            <Input
              id="emergencyRelation"
              placeholder="e.g. Parent, Spouse"
              {...register('emergencyRelation')}
            />
          </FormField>
        </div>

        <FormField
          label="Contact phone"
          htmlFor="emergencyPhone"
          required
          error={errors.emergencyPhone?.message}
        >
          <Input
            id="emergencyPhone"
            type="tel"
            inputMode="numeric"
            placeholder="9876543210"
            leadingIcon={<Phone />}
            error={!!errors.emergencyPhone}
            {...register('emergencyPhone')}
          />
        </FormField>

        <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>
          Finish setup
        </Button>
      </form>
    </div>
  )
}
