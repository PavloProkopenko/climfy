import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/context/auth-context'
import {
  favoritesAPI,
  type FavoriteCity,
  type FavoriteCityInput,
} from '../api/favorites'

export type { FavoriteCity } from '../api/favorites'

export function useFavorites() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['favorites', user?.id]

  const favoritesQuery = useQuery({
    queryKey,
    queryFn: () => favoritesAPI.list(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  const addFavorite = useMutation({
    mutationFn: (city: FavoriteCityInput) => favoritesAPI.add(city),
    onMutate: async (city) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<FavoriteCity[]>(queryKey)

      const optimistic: FavoriteCity = {
        ...city,
        id: favoritesAPI.id(city.lat, city.lon),
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
    mutationFn: (cityId: string) => favoritesAPI.remove(cityId),
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
