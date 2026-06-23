import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Bell, ChevronsUpDown, LogOut, Menu, Search, Settings, User } from 'lucide-react'
import type { NavSection } from '@/config/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Logo } from './logo'
import { ThemeToggleButton } from './theme-toggle'
import { cn, getInitials } from '@/lib/utils'

export interface NavbarUser {
  name: string
  email?: string
  avatarUrl?: string
  subtitle?: string
  /** Base path of the portal, used for the Profile/Settings links. */
  basePath?: string
}

interface TopNavbarProps {
  sections: NavSection[]
  user?: NavbarUser
  onSignOut?: () => void
}

/** Sticky top bar: mobile menu trigger, search, theme, notifications, avatar. */
export function TopNavbar({ sections, user, onSignOut }: TopNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const base = user?.basePath ?? '/app'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur lg:px-6">
      {/* Mobile menu */}
      <Drawer open={menuOpen} onOpenChange={setMenuOpen}>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu />
        </Button>
        <DrawerContent side="left" className="w-72 p-0">
          <DrawerHeader className="h-16 justify-center border-b border-border px-5">
            <DrawerTitle className="sr-only">Navigation</DrawerTitle>
            <Logo />
          </DrawerHeader>
          <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
            {sections.map((section, i) => (
              <div key={i}>
                {section.title && (
                  <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {section.title}
                  </p>
                )}
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.to.split('/').length <= 2}
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-accent text-accent-foreground'
                              : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                          )
                        }
                      >
                        <item.icon className="size-5 shrink-0" />
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </DrawerContent>
      </Drawer>

      {/* Search */}
      <div className="hidden max-w-md flex-1 md:block">
        <Input
          placeholder="Search…"
          leadingIcon={<Search />}
          className="h-9 bg-muted/50"
        />
      </div>

      <div className="flex flex-1 items-center justify-end gap-1">
        <ThemeToggleButton />
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive ring-2 ring-background" />
        </Button>
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1 flex items-center gap-2 rounded-full p-0.5 pr-1 transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:pr-2">
                <Avatar className="size-8">
                  {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <span className="hidden text-left sm:block">
                  <span className="block text-sm font-medium leading-tight">{user.name}</span>
                  {user.subtitle && (
                    <span className="block text-xs text-muted-foreground">{user.subtitle}</span>
                  )}
                </span>
                <ChevronsUpDown className="hidden size-4 text-muted-foreground sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-56">
              <DropdownMenuLabel className="flex flex-col">
                <span>{user.name}</span>
                {user.email && (
                  <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`${base}/settings`}>
                  <User /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`${base}/settings`}>
                  <Settings /> Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={() => onSignOut?.()}>
                <LogOut /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
