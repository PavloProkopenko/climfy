import { Link } from 'react-router'
import { RoutePath } from '../resources/enums'
import { useTheme } from '../context/use-theme'
import { CitySearch } from '@/features/search/ui/city-search'
import { WeatherTestId } from 'tests/resources/enums'
import { LanguagePicker } from '@/shared/layout/ui/language-picker'
import { AuthButton } from '@/features/auth/ui/auth-button'
import { OnboardingDialog } from '@/features/auth/ui/onboarding-dialog'

const Header = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const logo = (
    <img
      src={isDark ? '/logo-dark.svg' : '/logo-light.svg'}
      alt="Climfy logo"
      className="h-14"
    />
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
      <div className="container mx-auto relative flex h-16 items-center justify-between px-4">
        {/* Mobile layout -------------------------------------------------- */}

        {/* Left: language picker (mobile only) */}
        <div className="flex items-center md:hidden">
          <LanguagePicker />
        </div>

        {/* Center: logo absolutely centered (mobile only) */}
        <Link
          to={RoutePath.Root}
          className="md:hidden absolute left-1/2 -translate-x-1/2"
          data-testid={WeatherTestId.HomeButton}
        >
          <img
            src={isDark ? '/logo-dark.svg' : '/logo-light.svg'}
            alt="Climfy logo"
            className="h-12"
          />
        </Link>

        {/* PC layout ------------------------------------------------------- */}

        {/* Left: logo (PC only) */}
        <Link
          to={RoutePath.Root}
          className="hidden md:block"
          data-testid={WeatherTestId.HomeButton}
        >
          {logo}
        </Link>

        {/* Right: search + language (PC only) + auth */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Single CitySearch: in-flow on mobile, absolute-centered on PC */}
          <div className="md:absolute md:left-1/2 md:-translate-x-1/2">
            <CitySearch />
          </div>
          <div className="hidden md:block">
            <LanguagePicker />
          </div>
          <AuthButton />
        </div>
      </div>
      <OnboardingDialog />
    </header>
  )
}

export default Header
