import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'
import type { ForecastData } from '@/features/weather/api/types'
import { WeatherTestId } from 'tests/resources/enums'
import { useTranslation } from 'react-i18next'

interface HourlyTemperatureProps {
  data: ForecastData
}

interface ChartData {
  time: string
  temp: number
  feels_like: number
}

export function HourlyTemperature({ data }: HourlyTemperatureProps) {
  const { t } = useTranslation()

  // Get today's forecast data and format for chart

  const chartData: ChartData[] = data.list
    .slice(0, 8) // Get next 24 hours (3-hour intervals)
    .map((item) => ({
      time: format(new Date(item.dt * 1000), 'ha'),
      temp: Math.round(item.main.temp),
      feels_like: Math.round(item.main.feels_like),
    }))

  return (
    <Card
      className="flex-1"
      data-testid={WeatherTestId.HourlyTemperatureContainer}
    >
      <CardHeader>
        <CardTitle>{t('weather.todayTemperature')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="time"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}°`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {t('weather.temperature')}
                            </span>
                            <span className="font-bold">
                              {payload[0].value}°
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {t('weather.feelsLike')}
                            </span>
                            <span className="font-bold">
                              {payload[1].value}°
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line
                type="monotone"
                dataKey="temp"
                stroke="#5db28e"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="feels_like"
                stroke="#5db28e"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
