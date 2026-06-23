import { Outlet } from 'react-router-dom'
import { Building2, ShieldCheck, Sparkles } from 'lucide-react'
import { Logo } from './logo'
import { ThemeToggleButton } from './theme-toggle'

/**
 * Split auth layout: branded marketing panel (desktop) + form panel.
 * On mobile the marketing panel collapses and only the form shows.
 */
export function AuthLayout() {
  return (
    <div className="flex min-h-dvh">
      {/* Brand / marketing panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex xl:w-3/5">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 0, transparent 40%), radial-gradient(circle at 80% 70%, white 0, transparent 35%)',
          }}
        />
        <div className="relative">
          <Logo className="[&_span]:text-primary-foreground [&_.bg-primary]:bg-white [&_.bg-primary]:text-primary [&_.text-primary]:text-white" />
        </div>
        <div className="relative max-w-md space-y-6">
          <h2 className="text-3xl font-bold leading-tight">
            Property management, simplified for everyone.
          </h2>
          <ul className="space-y-4 text-primary-foreground/90">
            <li className="flex items-start gap-3">
              <Sparkles className="mt-0.5 size-5 shrink-0" />
              <span>Pay rent, track bills, and raise complaints in a few taps.</span>
            </li>
            <li className="flex items-start gap-3">
              <Building2 className="mt-0.5 size-5 shrink-0" />
              <span>Owners get a full overview of properties, tenants, and revenue.</span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0" />
              <span>Secure agreements and documents, available anytime.</span>
            </li>
          </ul>
        </div>
        <p className="relative text-sm text-primary-foreground/70">
          © {2026} TenantFlow. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col lg:w-1/2 xl:w-2/5">
        <div className="flex items-center justify-between p-4">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="ml-auto">
            <ThemeToggleButton />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-8">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
