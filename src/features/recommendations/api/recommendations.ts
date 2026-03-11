import { supabase } from '@/lib/supabase'

const API_BASE = import.meta.env.VITE_API_BASE_URL as string

export interface RecommendationResponse {
  content: string
  is_ai: boolean
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
}

export async function fetchRecommendations(
  params: RecommendationParams,
): Promise<RecommendationResponse> {
  const query = new URLSearchParams({
    lat: params.lat.toString(),
    lon: params.lon.toString(),
    lang: params.lang,
    temp: params.temp.toString(),
    feels_like: params.feels_like.toString(),
    humidity: params.humidity.toString(),
    wind_speed: params.wind_speed.toString(),
    description: params.description,
    city: params.city,
    ...(params.country ? { country: params.country } : {}),
  })

  const headers: HeadersInit = {}

  // Attach auth token if user is logged in
  const { data } = await supabase.auth.getSession()
  if (data.session?.access_token) {
    headers['Authorization'] = `Bearer ${data.session.access_token}`
  }

  const res = await fetch(`${API_BASE}/recommendations?${query.toString()}`, {
    headers,
  })

  if (!res.ok) {
    throw new Error(`Recommendations request failed: ${res.status}`)
  }

  return res.json()
}
