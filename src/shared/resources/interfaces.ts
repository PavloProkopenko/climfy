import { type Coordinates } from '@/api/types'

export interface GeolocationState {
  coordinates: Coordinates | null
  error: string | null
  isLoading: boolean
}
