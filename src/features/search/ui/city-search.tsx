import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { formatDistanceToNow } from 'date-fns'
import { Search, Clock, Star, XCircle, MapPin } from 'lucide-react'
import { useLocationSearch } from '@/features/weather/hooks/use-weather'
import {
  useSearchHistory,
  type SearchHistoryItem,
} from '@/features/search/hooks/use-search-history'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/shared/components/ui/command'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Button } from '@/shared/components/ui/button'
import { useFavorites } from '@/features/favorites/hooks/use-favorite'
import { WeatherTestId } from 'tests/resources/enums'
import { useTranslation } from 'react-i18next'

const isMac =
  typeof navigator !== 'undefined' &&
  navigator.platform.toUpperCase().includes('MAC')

export function CitySearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { data: locations, isFetching } = useLocationSearch(query)
  const { favorites } = useFavorites()
  const { history, clearHistory, addToHistory } = useSearchHistory()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSelect = (cityData: string) => {
    const [lat, lon, name, country] = cityData.split('|')

    addToHistory.mutate({
      name,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      country,
    })

    setOpen(false)
    setQuery('')
    navigate(`/city/${name}?lat=${lat}&lon=${lon}`)
  }

  const hasAboveContent = favorites.length > 0 || history.length > 0
  const hasResultsContent = isFetching || (locations && locations.length > 0)

  return (
    <>
      <Button
        variant="outline"
        className="relative justify-start text-sm text-muted-foreground md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
        data-testid={WeatherTestId.SearchBar}
      >
        <Search className="h-4 w-4 md:mr-2" />
        <span className="hidden md:inline">{t('search.placeholder')}</span>
        <kbd className="hidden lg:inline-flex ml-auto items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono pointer-events-none">
          {isMac ? '⌘' : 'Ctrl'} K
        </kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={() => {
          setOpen(false)
          setQuery('')
        }}
      >
        <Command>
          <CommandInput
            placeholder={t('search.placeholder')}
            value={query}
            onValueChange={setQuery}
            data-testid={WeatherTestId.SearchBarInput}
          />
          <CommandList data-testid={WeatherTestId.SearchBarResultList}>
            {query.length > 2 && !isFetching && Array.isArray(locations) && (
              <CommandEmpty>{t('search.noResults')}</CommandEmpty>
            )}

            {/* Empty state hint — shown only when there's nothing to display */}
            {query === '' && favorites.length === 0 && history.length === 0 && (
              <div className="flex min-h-[200px] w-full items-center justify-center gap-2 text-foreground">
                <Search className="h-5 w-5 shrink-0" />
                <p className="text-base">{t('search.emptyHint')}</p>
              </div>
            )}

            {/* Favorites */}
            {favorites.length > 0 && (
              <CommandGroup heading={t('favorites.title')}>
                {favorites.map((city) => (
                  <CommandItem
                    key={city.id}
                    value={`${city.lat}|${city.lon}|${city.name}|${city.country}`}
                    onSelect={handleSelect}
                    data-testid={WeatherTestId.FavoriteItem}
                  >
                    <Star className="mr-2 h-4 w-4 text-yellow-500" />
                    <span>{city.name}</span>
                    {city.state && (
                      <span className="text-sm text-muted-foreground">
                        , {city.state}
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground">
                      , {city.country}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Search history */}
            {history.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <div className="flex items-center justify-between px-2 my-2">
                    <p className="text-xs text-muted-foreground">
                      {t('search.recent')}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearHistory.mutate()}
                    >
                      <XCircle className="h-4 w-4" />
                      {t('search.clear')}
                    </Button>
                  </div>
                  {history.map((item: SearchHistoryItem) => (
                    <CommandItem
                      key={item.id}
                      value={`${item.lat}|${item.lon}|${item.name}|${item.country}`}
                      onSelect={handleSelect}
                    >
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{item.name}</span>
                      {item.state && (
                        <span className="text-sm text-muted-foreground">
                          , {item.state}
                        </span>
                      )}
                      <span className="text-sm text-muted-foreground">
                        , {item.country}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {formatDistanceToNow(item.searchedAt, {
                          addSuffix: true,
                        })}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {/* Separator — only when there's content on both sides */}
            {hasAboveContent && hasResultsContent && <CommandSeparator />}

            {/* Skeleton while loading */}
            {isFetching && query.length >= 3 && (
              <CommandGroup heading={t('search.suggestions')}>
                {[1, 2, 3].map((i) => (
                  <CommandItem key={i} disabled className="gap-2">
                    <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                    <Skeleton className="h-4 flex-1" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Results */}
            {!isFetching && locations && locations.length > 0 && (
              <CommandGroup heading={t('search.suggestions')}>
                {locations.map((location) => (
                  <CommandItem
                    key={`${location.lat}-${location.lon}`}
                    value={`${location.lat}|${location.lon}|${location.name}|${location.country}`}
                    onSelect={handleSelect}
                    data-testid={WeatherTestId.SearchResultItem}
                  >
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{location.name}</span>
                    {location.state && (
                      <span className="text-sm text-muted-foreground">
                        , {location.state}
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground">
                      , {location.country}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
