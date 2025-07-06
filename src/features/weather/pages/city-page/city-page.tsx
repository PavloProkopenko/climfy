import { useParams, useSearchParams } from 'react-router'
import {
  useWeatherQuery,
  useForecastQuery,
} from '@/features/weather/hooks/use-weather'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { CurrentWeather } from '@/features/weather/ui/current-weather'
import { HourlyTemperature } from '@/features/weather/ui/hourly-temprature'
import { WeatherDetails } from '@/features/weather/ui/weather-details'
import { WeatherForecast } from '@/features/weather/ui/weather-forecast'
import WeatherSkeleton from '@/shared/layout/ui/loading-skeleton'
import { FavoriteButton } from '@/features/favorites/ui/favorite-button'
import { WeatherTestId } from 'tests/resources/enums'

export function CityPage() {
  const [searchParams] = useSearchParams()
  const params = useParams()
  const lat = parseFloat(searchParams.get('lat') || '0')
  const lon = parseFloat(searchParams.get('lon') || '0')

  const coordinates = { lat, lon }

  const weatherQuery = useWeatherQuery(coordinates)
  const forecastQuery = useForecastQuery(coordinates)

  if (weatherQuery.error || forecastQuery.error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load weather data. Please try again.
        </AlertDescription>
      </Alert>
    )
  }

  if (!weatherQuery.data || !forecastQuery.data || !params.cityName) {
    return <WeatherSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-3xl font-bold tracking-tight"
          data-testid={WeatherTestId.FindedLocation}
        >
          {params.cityName}, {weatherQuery.data.sys.country}
        </h1>
        <div className="flex gap-2">
          <FavoriteButton
            data={{ ...weatherQuery.data, name: params.cityName }}
          />
        </div>
      </div>

      <div className="grid gap-6">
        <CurrentWeather data={weatherQuery.data} />
        <HourlyTemperature data={forecastQuery.data} />
        <div className="grid gap-6 md:grid-cols-2 items-start">
          <WeatherDetails data={weatherQuery.data} />
          <WeatherForecast data={forecastQuery.data} />
        </div>
      </div>
    </div>
  )
}

export default CityPage
