import { Link } from 'react-router'
import { RoutePath } from '../resources/enums'
import { useTheme } from '../context/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import { CitySearch } from '@/components/city-search'

const Header = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to={RoutePath.Root}>
          <img
            src={isDark ? '/logo-dark.svg' : '/logo-light.svg'}
            alt="Climfy logo"
            className="h-14"
          />
        </Link>
        <div className="flex gap-4">
          <CitySearch />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

export default Header
