import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  fetchRecommendations,
  type RecommendationDetail,
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
  detail?: RecommendationDetail
}

export function useRecommendations({
  coords,
  weather,
  cityName,
  country,
  detail = 'short',
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
          detail,
        }
      : null

  return useQuery({
    queryKey: ['recommendation', params],
    queryFn: ({ signal }) => fetchRecommendations(params!, signal),
    // The backend serves rule-based content to anonymous users and
    // AI content to fully-onboarded users. The only path that 403s is
    // logged-in-but-onboarding-incomplete, so skip just that case.
    enabled: !!params && (!user || preferences?.onboarding_completed === true),
    // Keep showing the previous detail level while the other level is fetching
    // so toggling Show more / Show less doesn't flash a skeleton.
    placeholderData: (prev) => prev,
    staleTime: 60 * 60 * 1000, // 1 hour — matches backend cache
    retry: false,
  })
}
