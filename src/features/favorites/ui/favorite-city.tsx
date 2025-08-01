// src/components/weather/favorite-cities.tsx
import { useNavigate } from 'react-router'
import { useWeatherQuery } from '@/features/weather/hooks/use-weather'
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useFavorites } from '@/features/favorites/hooks/use-favorite'
import { toast } from 'sonner'
import { WeatherTestId } from 'tests/resources/enums'
import { useTranslation } from 'react-i18next'
import { textToCamelCase } from '@/shared/resources/helpers'

interface FavoriteCityTabletProps {
  id: string
  name: string
  lat: number
  lon: number
  onRemove: (id: string) => void
}

function FavoriteCityTablet({
  id,
  name,
  lat,
  lon,
  onRemove,
}: FavoriteCityTabletProps) {
  const navigate = useNavigate()
  const { data: weather, isLoading } = useWeatherQuery({ lat, lon })
  const { t } = useTranslation()

  const handleClick = () => {
    navigate(`/city/${name}?lat=${lat}&lon=${lon}`)
  }

  return (
    <div
      onClick={handleClick}
      className="relative flex min-w-[250px] cursor-pointer items-center gap-3 rounded-lg border bg-card p-4 pr-8 shadow-sm transition-all hover:shadow-md"
      role="button"
      tabIndex={0}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1 h-6 w-6 rounded-full p-0  hover:text-destructive-foreground group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation()
          onRemove(id)
          toast.error(t('favorites.remove', { city: name }))
        }}
      >
        <X className="h-4 w-4" />
      </Button>

      {isLoading ? (
        <div className="flex h-8 items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : weather ? (
        <>
          <div className="flex items-center gap-2">
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
              alt={t(
                `weatherDescription.${textToCamelCase(weather.weather[0].description)}`,
              )}
              className="h-8 w-8"
            />
            <div>
              <p className="font-medium">{name}</p>
              <p className="text-xs text-muted-foreground">
                {weather.sys.country}
              </p>
            </div>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xl font-bold">
              {Math.round(weather.main.temp)}°
            </p>
            <p className="text-xs text-muted-foreground">
              {t(
                `weatherDescription.${textToCamelCase(weather.weather[0].description)}`,
              )}
            </p>
          </div>
        </>
      ) : null}
    </div>
  )
}

export function FavoriteCities() {
  const { favorites, removeFavorite } = useFavorites()
  const { t } = useTranslation()

  if (!favorites.length) {
    return null
  }

  return (
    <>
      <h1
        className="text-xl font-bold tracking-tight"
        data-testid={WeatherTestId.FavoritesHeading}
      >
        {t('favorites.title')}
      </h1>
      <ScrollArea className="w-full pb-4">
        <div className="flex gap-4">
          {favorites.map((city) => (
            <FavoriteCityTablet
              key={city.id}
              {...city}
              onRemove={() => removeFavorite.mutate(city.id)}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="mt-2" />
      </ScrollArea>
    </>
  )
}
