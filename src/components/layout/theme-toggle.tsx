import { Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useThemeStore, type Theme } from '@/stores/theme-store'

/** Compact icon button that cycles light/dark — good for top bars. */
export function ThemeToggleButton() {
  const theme = useThemeStore((s) => s.theme)
  const toggle = useThemeStore((s) => s.toggleTheme)
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
      {isDark ? <Moon /> : <Sun />}
    </Button>
  )
}

/** Full light/dark/system selector — good for settings screens. */
export function ThemeSelect() {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  return (
    <Select value={theme} onValueChange={(v) => setTheme(v as Theme)}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">
          <span className="flex items-center gap-2">
            <Sun className="size-4" /> Light
          </span>
        </SelectItem>
        <SelectItem value="dark">
          <span className="flex items-center gap-2">
            <Moon className="size-4" /> Dark
          </span>
        </SelectItem>
        <SelectItem value="system">
          <span className="flex items-center gap-2">
            <Monitor className="size-4" /> System
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
