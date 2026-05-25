import { SunIcon, MoonIcon } from 'lucide-react'
import { useTheme } from '@/shared/context/use-theme'
import { Button } from '@/shared/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <SunIcon className="h-5 w-5 text-brand transition-transform duration-500 rotate-0" />
      ) : (
        <MoonIcon className="h-5 w-5 text-brand transition-transform duration-500 rotate-180" />
      )}
    </Button>
  )
}
