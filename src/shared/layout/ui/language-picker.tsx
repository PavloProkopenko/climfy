import { useState } from 'react'
import { Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/context/auth-context'
import { Button } from '@/shared/components/ui/button'

type LanguageCode = 'en' | 'de' | 'ua'

export const LanguagePicker = () => {
  const { i18n } = useTranslation()
  const { user, preferences, updatePreferences } = useAuth()

  const languages: { code: LanguageCode; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'de', label: 'DE' },
    { code: 'ua', label: 'UA' },
  ]
  const [open, setOpen] = useState(false)
  const current =
    languages.find((l) => l.code === i18n.language) || languages[0]

  const selectLanguage = (code: LanguageCode) => {
    i18n.changeLanguage(code)
    setOpen(false)
    // Persist to backend so AI generation uses the right language and the
    // profile dialog stays in sync. Skip the call when it's already set.
    if (user && preferences && preferences.language !== code) {
      updatePreferences({ language: code }).catch((err) => {
        console.error('[LanguagePicker] failed to persist language:', err)
      })
    }
  }

  return (
    <div className="relative inline-block">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden md:inline">{current.label}</span>
        <svg
          className="hidden md:block h-4 w-4"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M6 8l4 4 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>
      {open && (
        <div className="absolute left-0 md:left-auto md:right-0 z-10 mt-1 min-w-[80px] rounded border bg-popover shadow-lg">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className={`w-full px-4 py-2 text-left text-sm transition hover:bg-accent focus:bg-accent ${
                i18n.language === lang.code
                  ? 'font-semibold text-brand'
                  : 'text-foreground'
              }`}
              onClick={() => selectLanguage(lang.code)}
              aria-selected={i18n.language === lang.code}
              role="option"
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
