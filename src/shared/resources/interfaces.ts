import { type Coordinates } from '@/features/weather/api/types'

export interface GeolocationState {
  coordinates: Coordinates | null
  error: string | null
  isLoading: boolean
}
