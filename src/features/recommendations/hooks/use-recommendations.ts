import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  fetchRecommendations,
  type RecommendationParams,
} from '../api/recommendations'
import type { Coordinates } from '@/features/weather/api/types'
import type { WeatherData } from '@/features/weather/api/types'
import { useAuth } from '@/features/auth/context/auth-context'

interface UseRecommendationsParams {
  coords: Coordinates | null
  weather: WeatherData | null | undefined
  cityName: string
  country?: string
}

export function useRecommendations({
  coords,
  weather,
  cityName,
  country,
}: UseRecommendationsParams) {
  const { i18n } = useTranslation()
  const { user, preferences } = useAuth()
  const lang = i18n.language as string

  const params: RecommendationParams | null =
    coords && weather
      ? {
          lat: coords.lat,
          lon: coords.lon,
          lang,
          temp: weather.main.temp,
          feels_like: weather.main.feels_like,
          humidity: weather.main.humidity,
          wind_speed: weather.wind.speed,
          description: weather.weather[0]?.description ?? '',
          city: cityName,
          country,
        }
      : null

  return useQuery({
    queryKey: ['recommendation', params],
    queryFn: () => fetchRecommendations(params!),
    // Only fetch when logged in AND onboarding is complete
    enabled: !!params && !!user && preferences?.onboarding_completed === true,
    staleTime: 60 * 60 * 1000, // 1 hour — matches backend cache
    retry: false,
  })
}
