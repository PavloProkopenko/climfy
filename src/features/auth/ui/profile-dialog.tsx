import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { useAuth, type ActivityType } from '../context/auth-context'
import { toast } from 'sonner'

const ACTIVITIES: { value: ActivityType; emoji: string; key: string }[] = [
  { value: 'sedentary', emoji: '🏢', key: 'sedentary' },
  { value: 'light', emoji: '🚶', key: 'light' },
  { value: 'active', emoji: '🏋️', key: 'active' },
  { value: 'athletic', emoji: '🏃', key: 'athletic' },
]

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ua', label: 'Українська' },
] as const

interface ProfileDialogProps {
  open: boolean
  onClose: () => void
}

export function ProfileDialog({ open, onClose }: ProfileDialogProps) {
  const { t, i18n } = useTranslation()
  const { preferences, updatePreferences } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [age, setAge] = useState('')
  const [activityType, setActivityType] = useState<ActivityType>('light')
  const [language, setLanguage] = useState<'en' | 'de' | 'ua'>('en')
  const [tempUnit, setTempUnit] = useState<'celsius' | 'fahrenheit'>('celsius')
  const [loading, setLoading] = useState(false)

  // Pre-fill from current preferences whenever the dialog opens
  useEffect(() => {
    if (open && preferences) {
      setFirstName(preferences.first_name ?? '')
      setAge(preferences.age?.toString() ?? '')
      setActivityType(preferences.activity_type ?? 'light')
      setLanguage(preferences.language ?? 'en')
      setTempUnit(preferences.temperature_unit ?? 'celsius')
    }
  }, [open, preferences])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    await updatePreferences({
      first_name: firstName.trim() || undefined,
      age: age ? parseInt(age) : undefined,
      activity_type: activityType,
      language,
      temperature_unit: tempUnit,
    })

    // Immediately apply language change in UI
    if (language !== i18n.language) {
      await i18n.changeLanguage(language)
    }

    toast.success(t('profile.success'))
    setLoading(false)
    onClose()
  }

  const inputClass =
    'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-md max-h-[90vh] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{t('profile.title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Personal info */}
          <div className="space-y-1">
            <label className="text-sm font-medium">
              {t('onboarding.firstName')}
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('onboarding.age')}</label>
            <input
              type="number"
              min={10}
              max={100}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Activity */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('onboarding.activity')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ACTIVITIES.map(({ value, emoji, key }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setActivityType(value)}
                  className={`flex items-center gap-2 rounded-lg border p-2.5 text-sm transition-colors text-left ${
                    activityType === value
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-border hover:border-primary/50 hover:bg-muted'
                  }`}
                >
                  <span className="text-lg">{emoji}</span>
                  <span>{t(`onboarding.activities.${key}`)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="space-y-1">
            <label className="text-sm font-medium">
              {t('profile.language')}
            </label>
            <div className="flex gap-2">
              {LANGUAGES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLanguage(value)}
                  className={`flex-1 rounded-md border py-2 text-sm transition-colors ${
                    language === value
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-border hover:border-primary/50 hover:bg-muted'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Temperature unit */}
          <div className="space-y-1">
            <label className="text-sm font-medium">
              {t('profile.temperatureUnit')}
            </label>
            <div className="flex gap-2">
              {(['celsius', 'fahrenheit'] as const).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => setTempUnit(unit)}
                  className={`flex-1 rounded-md border py-2 text-sm transition-colors ${
                    tempUnit === unit
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-border hover:border-primary/50 hover:bg-muted'
                  }`}
                >
                  {t(`profile.${unit}`)}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '...' : t('profile.save')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
