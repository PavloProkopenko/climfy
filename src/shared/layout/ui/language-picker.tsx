import { useTranslation } from 'react-i18next'

export const LanguagePicker = () => {
  const { i18n } = useTranslation()
  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value)
  }

  return (
    <select
      value={i18n.language}
      onChange={changeLanguage}
      className="rounded border px-2 py-1 text-sm bg-background"
      aria-label="Select language"
    >
      <option value="en">EN</option>
      <option value="de">DE</option>
    </select>
  )
}
