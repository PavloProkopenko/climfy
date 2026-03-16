import { Link } from 'react-router'
import { RoutePath } from '../resources/enums'
import { useTheme } from '../context/use-theme'
import { ThemeToggle } from '@/shared/layout/ui/theme-toggle'
import { CitySearch } from '@/features/search/ui/city-search'
import { WeatherTestId } from 'tests/resources/enums'
import { LanguagePicker } from '@/shared/layout/ui/language-picker'
import { AuthButton } from '@/features/auth/ui/auth-button'
import { OnboardingDialog } from '@/features/auth/ui/onboarding-dialog'

const Header = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to={RoutePath.Root} data-testid={WeatherTestId.HomeButton}>
          <img
            src={isDark ? '/logo-dark.svg' : '/logo-light.svg'}
            alt="Climfy logo"
            className="h-14"
          />
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <CitySearch />
          <ThemeToggle />
          <LanguagePicker />
          <AuthButton />
        </div>
      </div>
      <OnboardingDialog />
    </header>
  )
}

export default Header
