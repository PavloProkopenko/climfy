import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Sunrise, Sunset, Compass, Gauge } from 'lucide-react'
import { format } from 'date-fns'
import type { WeatherData } from '@/features/weather/api/types'
import { WeatherTestId } from 'tests/resources/enums'
import { useTranslation } from 'react-i18next'

interface WeatherDetailsProps {
  data: WeatherData
}

export function WeatherDetails({ data }: WeatherDetailsProps) {
  const { t } = useTranslation()
  const { wind, main, sys } = data

  // Format time using date-fns
  const formatTime = (timestamp: number) => {
    return format(new Date(timestamp * 1000), 'h:mm a')
  }

  // Convert wind degree to direction
  const getWindDirection = (degree: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    const index =
      Math.round(((degree %= 360) < 0 ? degree + 360 : degree) / 45) % 8
    return directions[index]
  }

  const details = [
    {
      title: t('weather.sunrise'),
      value: formatTime(sys.sunrise),
      icon: Sunrise,
      color: 'text-green-300',
    },
    {
      title: t('weather.sunset'),
      value: formatTime(sys.sunset),
      icon: Sunset,
      color: 'text-green-300',
    },
    {
      title: t('weather.windDirection'),
      value: `${getWindDirection(wind.deg)} (${wind.deg}°)`,
      icon: Compass,
      color: 'text-green-300',
    },
    {
      title: t('weather.pressure'),
      value: `${main.pressure} hPa`,
      icon: Gauge,
      color: 'text-green-300',
    },
  ]

  return (
    <Card data-testid={WeatherTestId.WeatherDetailsContainer}>
      <CardHeader>
        <CardTitle>{t('weather.details')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2">
          {details.map((detail) => (
            <div
              key={detail.title}
              className="flex items-center gap-3 rounded-lg border p-4"
            >
              <detail.icon className={`h-5 w-5 ${detail.color}`} />
              <div>
                <p className="text-sm font-medium leading-none">
                  {detail.title}
                </p>
                <p className="text-sm text-muted-foreground">{detail.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
