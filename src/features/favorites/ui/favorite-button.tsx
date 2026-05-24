import { Star } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/button'
import type { WeatherData } from '@/features/weather/api/types'
import { useFavorites } from '@/features/favorites/hooks/use-favorite'
import { favoritesAPI } from '@/features/favorites/api/favorites'
import { useAuth } from '@/features/auth/context/auth-context'
import { WeatherTestId } from 'tests/resources/enums'

interface FavoriteButtonProps {
  data: WeatherData
}

export function FavoriteButton({ data }: FavoriteButtonProps) {
  const { user } = useAuth()
  const { addFavorite, removeFavorite, isFavorite } = useFavorites()
  const { t } = useTranslation()
  const isCurrentlyFavorite = isFavorite(data.coord.lat, data.coord.lon)

  if (!user) return null

  const cityName = data.name
  const onError = () => toast.error(t('common.error'))

  const handleToggleFavorite = () => {
    if (isCurrentlyFavorite) {
      removeFavorite.mutate(favoritesAPI.id(data.coord.lat, data.coord.lon), {
        onSuccess: () =>
          toast.success(t('favorites.remove', { city: cityName })),
        onError,
      })
    } else {
      addFavorite.mutate(
        {
          name: cityName,
          lat: data.coord.lat,
          lon: data.coord.lon,
          country: data.sys.country,
        },
        {
          onSuccess: () =>
            toast.success(t('favorites.add', { city: cityName })),
          onError,
        },
      )
    }
  }

  return (
    <Button
      variant={isCurrentlyFavorite ? 'default' : 'outline'}
      size="icon"
      onClick={handleToggleFavorite}
      className={isCurrentlyFavorite ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
      data-testid={WeatherTestId.FavoriteButton}
    >
      <Star
        className={`h-4 w-4 ${isCurrentlyFavorite ? 'fill-current' : ''}`}
      />
    </Button>
  )
}
