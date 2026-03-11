import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/context/auth-context'
import { supabase } from '@/lib/supabase'

export interface FavoriteCity {
  id: string
  name: string
  lat: number
  lon: number
  country: string
  state?: string
  addedAt: number
}

const API_BASE = import.meta.env.VITE_API_BASE_URL as string

async function getToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

export function useFavorites() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['favorites', user?.id]

  const favoritesQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const token = await getToken()
      if (!token) return []
      const res = await fetch(`${API_BASE}/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return []
      const data = await res.json()
      return data.map(
        (item: {
          id: string
          city_name: string
          lat: number
          lon: number
          country: string
          state?: string
          added_at: string
        }) => ({
          id: item.id,
          name: item.city_name,
          lat: item.lat,
          lon: item.lon,
          country: item.country,
          state: item.state,
          addedAt: Date.parse(item.added_at),
        }),
      ) as FavoriteCity[]
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  const addFavorite = useMutation({
    mutationFn: async (city: Omit<FavoriteCity, 'id' | 'addedAt'>) => {
      const token = await getToken()
      if (!token) return
      await fetch(`${API_BASE}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: `${city.lat}-${city.lon}`,
          city_name: city.name,
          lat: city.lat,
          lon: city.lon,
          country: city.country,
          state: city.state,
        }),
      })
    },
    onMutate: async (city) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<FavoriteCity[]>(queryKey)

      const optimistic: FavoriteCity = {
        ...city,
        id: `${city.lat}-${city.lon}`,
        addedAt: Date.now(),
      }
      queryClient.setQueryData<FavoriteCity[]>(queryKey, (old = []) => [
        ...old,
        optimistic,
      ])

      return { previous }
    },
    onError: (_err, _city, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKey, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const removeFavorite = useMutation({
    mutationFn: async (cityId: string) => {
      const token = await getToken()
      if (!token) return
      await fetch(`${API_BASE}/favorites/${cityId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
    },
    onMutate: async (cityId) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<FavoriteCity[]>(queryKey)

      queryClient.setQueryData<FavoriteCity[]>(queryKey, (old = []) =>
        old.filter((city) => city.id !== cityId),
      )

      return { previous }
    },
    onError: (_err, _cityId, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKey, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const favorites = favoritesQuery.data ?? []

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite: (lat: number, lon: number) =>
      favorites.some((city) => city.lat === lat && city.lon === lon),
  }
}
