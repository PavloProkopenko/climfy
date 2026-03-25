import { useTranslation } from 'react-i18next'
import { Sparkles, LogIn } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useRecommendations } from '../hooks/use-recommendations'
import { useAuth } from '@/features/auth/context/auth-context'
import type { Coordinates, WeatherData } from '@/features/weather/api/types'

interface RecommendationCardProps {
  coords: Coordinates | null
  weather: WeatherData | null | undefined
  cityName: string
  country?: string
}

export function RecommendationCard({
  coords,
  weather,
  cityName,
  country,
}: RecommendationCardProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { data, isLoading, isError } = useRecommendations({
    coords,
    weather,
    cityName,
    country,
  })

  if (isError) return null

  return (
    <Card data-testid="RecommendationCard">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          {t('recommendations.title')}
        </CardTitle>
        {data?.is_ai && (
          <CardAction>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {t('recommendations.aiPowered')}
            </span>
          </CardAction>
        )}
      </CardHeader>

      <CardContent>
        {!user ? (
          <p
            className="flex items-center gap-2 text-sm text-muted-foreground"
            data-testid="RecommendationLoginPrompt"
          >
            <LogIn className="h-4 w-4 shrink-0" />
            {t('recommendations.loginPrompt')}
          </p>
        ) : isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {data?.content || t('recommendations.unavailable')}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
