import { apiFetch } from '@/shared/lib/api-client'

export interface SearchHistoryItem {
  id: string
  name: string
  lat: number
  lon: number
  country: string
  state?: string
  searchedAt: number
}

export type SearchHistoryInput = Omit<SearchHistoryItem, 'id' | 'searchedAt'>

interface SearchHistoryRow {
  id: string
  city_name: string
  lat: number
  lon: number
  country: string
  state?: string
  searched_at: string
}

function fromRow(row: SearchHistoryRow): SearchHistoryItem {
  return {
    id: row.id,
    name: row.city_name,
    lat: row.lat,
    lon: row.lon,
    country: row.country,
    state: row.state,
    searchedAt: Date.parse(row.searched_at),
  }
}

export const searchHistoryAPI = {
  async list(): Promise<SearchHistoryItem[]> {
    const rows = await apiFetch<SearchHistoryRow[]>('/history')
    return rows.map(fromRow)
  },

  async add(item: SearchHistoryInput): Promise<void> {
    await apiFetch<void>('/history', {
      method: 'POST',
      body: {
        city_name: item.name,
        lat: item.lat,
        lon: item.lon,
        country: item.country,
        state: item.state,
      },
    })
  },

  async clear(): Promise<void> {
    await apiFetch<void>('/history', { method: 'DELETE' })
  },
}
