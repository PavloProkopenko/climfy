import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles, LogIn } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useRecommendations } from '../hooks/use-recommendations'
import type { RecommendationDetail } from '../api/recommendations'
import { useAuth } from '@/features/auth/context/auth-context'
import { WeatherTestId } from 'tests/resources/enums'
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
  const [detail, setDetail] = useState<RecommendationDetail>('short')

  const { data, isLoading, isError, isFetching } = useRecommendations({
    coords,
    weather,
    cityName,
    country,
    detail,
  })

  if (isError) return null

  const isLong = detail === 'long'
  // Only AI users see a "Show more" — the rule-based long version is not
  // distinct enough to justify the extra round-trip.
  const canExpand = !!user && data?.is_ai === true

  return (
    <Card
      data-testid={WeatherTestId.RecommendationCard}
      className="border-primary/20 bg-primary/10"
    >
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

      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-2" data-testid="RecommendationSkeleton">
            <Skeleton className="h-4 w-full bg-primary/20" />
            <Skeleton className="h-4 w-5/6 bg-primary/20" />
          </div>
        ) : (
          <p className="text-base leading-relaxed text-foreground text-justify">
            {data?.content || t('recommendations.unavailable')}
          </p>
        )}

        {canExpand && (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 text-primary hover:bg-primary/10 hover:text-primary"
            onClick={() => setDetail(isLong ? 'short' : 'long')}
            disabled={isFetching}
          >
            {isLong
              ? t('recommendations.showLess')
              : t('recommendations.showMore')}
          </Button>
        )}

        {!user && data?.content && (
          <p
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
            data-testid={WeatherTestId.RecommendationSignInHint}
          >
            <LogIn className="h-3 w-3 shrink-0" />
            {t('recommendations.signInHint')}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
