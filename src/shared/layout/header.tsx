import { Link } from 'react-router'
import { RoutePath } from '../resources/enums'
import { useTheme } from '../context/theme-provider'
import { ThemeToggle } from '@/shared/layout/ui/theme-toggle'
import { CitySearch } from '@/features/search/ui/city-search'
import { WeatherTestId } from 'tests/resources/enums'
import { LanguagePicker } from '@/shared/layout/ui/language-picker'
import { useTranslation } from 'react-i18next'

const Header = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { i18n } = useTranslation()
  console.log(i18n.language)

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
        <div className="flex gap-4">
          <CitySearch />
          <ThemeToggle />
          <LanguagePicker />
        </div>
      </div>
    </header>
  )
}

export default Header
