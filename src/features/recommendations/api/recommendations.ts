import { apiFetch } from '@/shared/lib/api-client'

export type RecommendationDetail = 'short' | 'long'

export interface RecommendationResponse {
  content: string
  is_ai: boolean
  detail: RecommendationDetail
  generated_at: string
  expires_at: string
  cached: boolean
}

export interface RecommendationParams {
  lat: number
  lon: number
  lang: string
  temp: number
  feels_like: number
  humidity: number
  wind_speed: number
  description: string
  city: string
  country?: string
  detail: RecommendationDetail
}

export async function fetchRecommendations(
  params: RecommendationParams,
): Promise<RecommendationResponse> {
  return apiFetch<RecommendationResponse>('/recommendations', {
    query: { ...params },
  })
}
