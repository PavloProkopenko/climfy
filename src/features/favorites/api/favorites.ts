import { apiFetch } from '@/shared/lib/api-client'

export interface FavoriteCity {
  id: string
  name: string
  lat: number
  lon: number
  country: string
  state?: string
  addedAt: number
}

export type FavoriteCityInput = Omit<FavoriteCity, 'id' | 'addedAt'>

// Wire-format row as it comes from / goes to climfy-server.
interface FavoriteRow {
  id: string
  city_name: string
  lat: number
  lon: number
  country: string
  state?: string
  added_at: string
}

function fromRow(row: FavoriteRow): FavoriteCity {
  return {
    id: row.id,
    name: row.city_name,
    lat: row.lat,
    lon: row.lon,
    country: row.country,
    state: row.state,
    addedAt: Date.parse(row.added_at),
  }
}

function cityId(lat: number, lon: number): string {
  return `${lat}-${lon}`
}

export const favoritesAPI = {
  async list(): Promise<FavoriteCity[]> {
    const rows = await apiFetch<FavoriteRow[]>('/favorites')
    return rows.map(fromRow)
  },

  async add(city: FavoriteCityInput): Promise<void> {
    await apiFetch<void>('/favorites', {
      method: 'POST',
      body: {
        id: cityId(city.lat, city.lon),
        city_name: city.name,
        lat: city.lat,
        lon: city.lon,
        country: city.country,
        state: city.state,
      },
    })
  },

  async remove(id: string): Promise<void> {
    await apiFetch<void>(`/favorites/${id}`, { method: 'DELETE' })
  },

  id: cityId,
}
