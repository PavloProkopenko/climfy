import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog'
import {
  useAuth,
  type ActivityType,
  type ColdSensitivity,
  type Gender,
} from '../context/auth-context'
import { PersonalizationFields } from './personalization-fields'

const ACTIVITIES: { value: ActivityType; emoji: string; key: string }[] = [
  { value: 'sedentary', emoji: '🏢', key: 'sedentary' },
  { value: 'light', emoji: '🚶', key: 'light' },
  { value: 'active', emoji: '🏋️', key: 'active' },
  { value: 'athletic', emoji: '🏃', key: 'athletic' },
]

export function OnboardingDialog() {
  const { t } = useTranslation()
  const { user, preferences, isLoading, updatePreferences } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [age, setAge] = useState('')
  const [activityType, setActivityType] = useState<ActivityType>('light')
  const [gender, setGender] = useState<Gender | ''>('')
  const [coldSensitivity, setColdSensitivity] = useState<ColdSensitivity | ''>(
    '',
  )
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)

  // undefined = still fetching (don't show yet)
  // null      = fetched, no row exists → new user, show onboarding
  // object    = fetched → show only if onboarding_completed is false
  const open =
    !isLoading &&
    !!user &&
    preferences !== undefined &&
    (preferences === null || !preferences.onboarding_completed)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await updatePreferences({
      first_name: firstName.trim(),
      age: parseInt(age),
      activity_type: activityType,
      gender: gender || undefined,
      cold_sensitivity: coldSensitivity || undefined,
      bio: bio.trim() || undefined,
      onboarding_completed: true,
    })
    toast.success(t('onboarding.success'))
    setLoading(false)
  }

  const inputClass =
    'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <Dialog open={open}>
      {/* No onOpenChange — dialog cannot be dismissed */}
      <DialogContent
        className="sm:max-w-md max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>{t('onboarding.title')}</DialogTitle>
          <DialogDescription>{t('onboarding.subtitle')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">
              {t('onboarding.firstName')}
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={t('onboarding.firstNamePlaceholder')}
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('onboarding.age')}</label>
            <input
              type="number"
              required
              min={10}
              max={100}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="25"
              className={inputClass}
            />
          </div>

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
                  className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors text-left ${
                    activityType === value
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-border hover:border-primary/50 hover:bg-muted'
                  }`}
                >
                  <span className="text-xl">{emoji}</span>
                  <span>{t(`onboarding.activities.${key}`)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <p className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
              {t('onboarding.optionalSection')}
            </p>
            <PersonalizationFields
              gender={gender}
              onGenderChange={setGender}
              coldSensitivity={coldSensitivity}
              onColdSensitivityChange={setColdSensitivity}
              bio={bio}
              onBioChange={setBio}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '...' : t('onboarding.submit')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
