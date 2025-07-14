import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export const LanguagePicker = () => {
  const { i18n } = useTranslation()

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'de', label: 'DE' },
    { code: 'ua', label: 'UA' },
  ]
  const [open, setOpen] = useState(false)
  const current =
    languages.find((l) => l.code === i18n.language) || languages[0]
  const selectLanguage = (code: string) => {
    i18n.changeLanguage(code)
    setOpen(false)
  }
  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="flex items-center gap-2 rounded border bg-background px-3 py-1.5 text-sm font-medium transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {current.label}
        <svg className="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="none">
          <path
            d="M6 8l4 4 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full rounded border bg-popover shadow-lg">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className={`w-full px-4 py-2 text-left text-sm transition hover:bg-accent focus:bg-accent ${i18n.language === lang.code ? 'font-semibold text-primary' : 'text-foreground'}`}
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
