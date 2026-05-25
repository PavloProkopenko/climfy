import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SunIcon, MoonIcon } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useTheme } from '@/shared/context/use-theme'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/shared/components/ui/tabs'
import {
  useAuth,
  type ActivityType,
  type ColdSensitivity,
  type Gender,
  type UserPreferences,
} from '../context/auth-context'
import { PersonalizationFields } from './personalization-fields'

const ACTIVITIES: { value: ActivityType; emoji: string; key: string }[] = [
  { value: 'sedentary', emoji: '💤', key: 'sedentary' },
  { value: 'light', emoji: '🚶', key: 'light' },
  { value: 'active', emoji: '🏋️', key: 'active' },
  { value: 'athletic', emoji: '🏃', key: 'athletic' },
]

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ua', label: 'Українська' },
] as const

const AI_RELEVANT_KEYS = [
  'first_name',
  'age',
  'activity_type',
  'bio',
  'gender',
  'cold_sensitivity',
] as const satisfies readonly (keyof UserPreferences)[]

interface ProfileDialogProps {
  open: boolean
  onClose: () => void
}

export function ProfileDialog({ open, onClose }: ProfileDialogProps) {
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { preferences, updatePreferences } = useAuth()
  const queryClient = useQueryClient()

  const [firstName, setFirstName] = useState('')
  const [age, setAge] = useState('')
  const [activityType, setActivityType] = useState<ActivityType>('light')
  const [gender, setGender] = useState<Gender | ''>('')
  const [coldSensitivity, setColdSensitivity] = useState<ColdSensitivity | ''>(
    '',
  )
  const [bio, setBio] = useState('')
  const [language, setLanguage] = useState<'en' | 'de' | 'ua'>('en')
  const [tempUnit, setTempUnit] = useState<'celsius' | 'fahrenheit'>('celsius')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && preferences) {
      setFirstName(preferences.first_name ?? '')
      setAge(preferences.age?.toString() ?? '')
      setActivityType(preferences.activity_type ?? 'light')
      setGender(preferences.gender ?? '')
      setColdSensitivity(preferences.cold_sensitivity ?? '')
      setBio(preferences.bio ?? '')
      const currentLang = i18n.language as 'en' | 'de' | 'ua'
      setLanguage(
        ['en', 'de', 'ua'].includes(currentLang)
          ? currentLang
          : (preferences.language ?? 'en'),
      )
      setTempUnit(preferences.temperature_unit ?? 'celsius')
    }
  }, [open, preferences, i18n.language])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const updates: Partial<UserPreferences> = {
      first_name: firstName.trim() || undefined,
      age: age ? parseInt(age) : undefined,
      activity_type: activityType,
      gender: gender || undefined,
      cold_sensitivity: coldSensitivity || undefined,
      bio: bio.trim() || undefined,
      language,
      temperature_unit: tempUnit,
    }

    await updatePreferences(updates)

    const aiChanged = AI_RELEVANT_KEYS.some(
      (key) =>
        (preferences?.[key] ?? undefined) !== (updates[key] ?? undefined),
    )
    if (aiChanged) {
      queryClient.invalidateQueries({ queryKey: ['recommendation'] })
    }

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
        className="max-h-[90vh] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{t('profile.title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave}>
          <Tabs defaultValue="profile" className="mt-2">
            <TabsList className="w-full">
              <TabsTrigger value="profile" className="flex-1">
                {t('profile.tabs.profile')}
              </TabsTrigger>
              <TabsTrigger value="personalization" className="flex-1">
                {t('profile.tabs.personalization')}
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex-1">
                {t('profile.tabs.preferences')}
              </TabsTrigger>
            </TabsList>

            {/* Tab 1 — required fields */}
            <TabsContent value="profile" className="space-y-4 mt-4">
              <div className="space-y-2">
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

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('onboarding.age')}
                </label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
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
                      className={`flex items-center gap-2 rounded-lg border p-2.5 text-sm transition-colors text-left ${
                        activityType === value
                          ? 'border-brand bg-brand/10 text-brand font-medium'
                          : 'border-border hover:border-brand/50 hover:bg-muted'
                      }`}
                    >
                      <span className="text-lg">{emoji}</span>
                      <span>{t(`onboarding.activities.${key}`)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Tab 2 — optional personalization */}
            <TabsContent value="personalization" className="space-y-4 mt-4">
              <p className="text-xs text-muted-foreground">
                {t('profile.personalizationHint')}
              </p>
              <PersonalizationFields
                gender={gender}
                onGenderChange={setGender}
                coldSensitivity={coldSensitivity}
                onColdSensitivityChange={setColdSensitivity}
                bio={bio}
                onBioChange={setBio}
              />
            </TabsContent>

            {/* Tab 3 — app preferences */}
            <TabsContent value="preferences" className="space-y-4 mt-4">
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
                          ? 'border-brand bg-brand/10 text-brand font-medium'
                          : 'border-border hover:border-brand/50 hover:bg-muted'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

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
                          ? 'border-brand bg-brand/10 text-brand font-medium'
                          : 'border-border hover:border-brand/50 hover:bg-muted'
                      }`}
                    >
                      {t(`profile.${unit}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">
                  {t('profile.theme')}
                </label>
                <div className="flex gap-2">
                  {(['light', 'dark'] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTheme(value)}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-md border py-2 text-sm transition-colors ${
                        theme === value
                          ? 'border-brand bg-brand/10 text-brand font-medium'
                          : 'border-border hover:border-brand/50 hover:bg-muted'
                      }`}
                    >
                      {value === 'light' ? (
                        <SunIcon className="h-4 w-4" />
                      ) : (
                        <MoonIcon className="h-4 w-4" />
                      )}
                      {t(
                        `profile.theme${value === 'light' ? 'Light' : 'Dark'}`,
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? '...' : t('profile.save')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
