import { Card, CardContent } from '@/shared/components/ui/card'
import { ArrowDown, ArrowUp, Droplets, Wind } from 'lucide-react'
import type {
  WeatherData,
  GeocodingResponse,
} from '@/features/weather/api/types'
import { WeatherTestId } from 'tests/resources/enums'
import { useTranslation } from 'react-i18next'

interface CurrentWeatherProps {
  data: WeatherData
  locationName?: GeocodingResponse
}

export function CurrentWeather({ data, locationName }: CurrentWeatherProps) {
  const { t } = useTranslation()
  const {
    weather: [currentWeather],
    main: { temp, feels_like, temp_min, temp_max, humidity },
    wind: { speed },
  } = data

  // Format temperature
  const formatTemp = (temp: number) => `${Math.round(temp)}°`

  return (
    <Card
      className="overflow-hidden"
      data-testid={WeatherTestId.CurrentWeatherContainer}
    >
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold tracking-tight">
                  {locationName?.name}
                </h2>
                {locationName?.state && (
                  <span className="text-muted-foreground">
                    , {locationName.state}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {locationName?.country}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-7xl font-bold tracking-tighter">
                {formatTemp(temp)}
              </p>
              <div className="space-y-1 pl-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {t('weather.feelsLike') || 'Feels like'}{' '}
                  {formatTemp(feels_like)}
                </p>
                <div className="flex gap-2 text-sm font-medium">
                  <span className="flex items-center gap-1 text-green-300">
                    <ArrowDown className="h-3 w-3" />
                    {formatTemp(temp_min)}
                  </span>
                  <span className="flex items-center gap-1 text-red-500">
                    <ArrowUp className="h-3 w-3" />
                    {formatTemp(temp_max)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-green-300" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{t('weather.humidity')}</p>
                  <p className="text-sm text-muted-foreground">{humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-green-300" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">
                    {t('weather.windSpeed') || 'Wind Speed'}
                  </p>
                  <p className="text-sm text-muted-foreground">{speed} m/s</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="relative flex aspect-square w-full max-w-[200px] items-center justify-center">
              <img
                src={`https://openweathermap.org/img/wn/${currentWeather.icon}@4x.png`}
                alt={currentWeather.description}
                className="h-full w-full object-contain"
              />
              <div className="absolute bottom-0 text-center">
                <p className="text-sm font-medium capitalize">
                  {currentWeather.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
