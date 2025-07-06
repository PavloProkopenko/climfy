// src/components/weather/favorite-button.tsx
import { Star } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import type { WeatherData } from '@/features/weather/api/types'
import { useFavorites } from '@/features/favorites/hooks/use-favorite'
import { toast } from 'sonner'
import { WeatherTestId } from 'tests/resources/enums'
import { useTranslation } from 'react-i18next'

interface FavoriteButtonProps {
  data: WeatherData
}

export function FavoriteButton({ data }: FavoriteButtonProps) {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites()
  const { t } = useTranslation()
  const isCurrentlyFavorite = isFavorite(data.coord.lat, data.coord.lon)

  const handleToggleFavorite = () => {
    if (isCurrentlyFavorite) {
      removeFavorite.mutate(`${data.coord.lat}-${data.coord.lon}`)
      toast.error(t('favorites.remove', { city: data.name }))
    } else {
      addFavorite.mutate({
        name: data.name,
        lat: data.coord.lat,
        lon: data.coord.lon,
        country: data.sys.country,
      })
      toast.success(t('favorites.add', { city: data.name }))
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
