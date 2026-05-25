import TextareaAutosize from 'react-textarea-autosize'
import { useTranslation } from 'react-i18next'
import {
  BIO_MAX_LENGTH,
  type ColdSensitivity,
  type Gender,
} from '../context/auth-context'

const GENDERS: Gender[] = ['male', 'female', 'other', 'prefer_not_to_say']
const COLD_SENSITIVITIES: ColdSensitivity[] = [
  'cold_sensitive',
  'neutral',
  'warm_tolerant',
]

interface PersonalizationFieldsProps {
  gender: Gender | ''
  onGenderChange: (g: Gender | '') => void
  coldSensitivity: ColdSensitivity | ''
  onColdSensitivityChange: (c: ColdSensitivity | '') => void
  bio: string
  onBioChange: (b: string) => void
}

const pillBase =
  'rounded-md border px-3 py-1.5 text-sm transition-colors text-left'
const pillSelected = 'border-brand bg-brand/10 text-brand font-medium'
const pillUnselected = 'border-border hover:border-brand/50 hover:bg-muted'

export function PersonalizationFields({
  gender,
  onGenderChange,
  coldSensitivity,
  onColdSensitivityChange,
  bio,
  onBioChange,
}: PersonalizationFieldsProps) {
  const { t } = useTranslation()
  const remaining = BIO_MAX_LENGTH - bio.length

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">{t('onboarding.gender')}</label>
        <div className="grid grid-cols-2 gap-2">
          {GENDERS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onGenderChange(gender === value ? '' : value)}
              className={`${pillBase} ${
                gender === value ? pillSelected : pillUnselected
              }`}
            >
              {t(`onboarding.genders.${value}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          {t('onboarding.coldSensitivity')}
        </label>
        <div className="flex flex-col gap-2">
          {COLD_SENSITIVITIES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                onColdSensitivityChange(coldSensitivity === value ? '' : value)
              }
              className={`${pillBase} ${
                coldSensitivity === value ? pillSelected : pillUnselected
              }`}
            >
              {t(`onboarding.coldSensitivities.${value}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">{t('onboarding.bio')}</label>
        <TextareaAutosize
          value={bio}
          onChange={(e) => onBioChange(e.target.value.slice(0, BIO_MAX_LENGTH))}
          minRows={3}
          maxRows={8}
          maxLength={BIO_MAX_LENGTH}
          placeholder={t('onboarding.bioPlaceholder')}
          className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-right text-xs text-muted-foreground">
          {t('onboarding.bioRemaining', { n: remaining })}
        </p>
      </div>
    </div>
  )
}
