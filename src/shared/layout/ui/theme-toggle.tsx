import { SunIcon, MoonIcon } from 'lucide-react'
import { useTheme } from '@/shared/context/theme-provider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`flex items-center cursor-pointer transition-transform duration-500 ${
        isDark ? 'rotate-180' : 'rotate-0'
      }`}
    >
      {isDark ? (
        <SunIcon className="h-6 w-6 text-green-300 rotate-0 transition-all" />
      ) : (
        <MoonIcon className="h-6 w-6 text-green-300 rotate-0 transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </div>
  )
}
