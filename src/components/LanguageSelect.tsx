import { LOCALES, LOCALE_NAMES, isLocale, useT, type Locale } from '../i18n'

interface Props {
  locale: Locale
  onChange: (locale: Locale) => void
}

export function LanguageSelect({ locale, onChange }: Props) {
  const t = useT()
  return (
    <>
      <label htmlFor="locale">{t.settings.languageLabel}</label>
      <select
        id="locale"
        value={locale}
        onChange={(event) => {
          if (isLocale(event.target.value)) onChange(event.target.value)
        }}
      >
        {LOCALES.map((option) => (
          <option key={option} value={option} lang={option}>
            {LOCALE_NAMES[option]}
          </option>
        ))}
      </select>
    </>
  )
}
