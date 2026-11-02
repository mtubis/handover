/** Languages the app is translated into. The first one is the fallback. */
export const LOCALES = ['en', 'pl', 'de'] as const

export type Locale = (typeof LOCALES)[number]

export const FALLBACK_LOCALE: Locale = 'en'

/** Shown in each language's own name, so everyone can find theirs whatever the current UI. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  pl: 'Polski',
  de: 'Deutsch',
}

const STORAGE_KEY = 'handover.locale'

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

/**
 * Picks the first browser language we have a translation for, matched by its base language
 * ("de-AT" → "de"), so regional variants don't need their own dictionaries.
 */
export function resolveLocale(preferred: readonly string[]): Locale {
  for (const tag of preferred) {
    const base = tag.split('-')[0].trim().toLowerCase()
    if (isLocale(base)) return base
  }
  return FALLBACK_LOCALE
}

function browserLanguages(): readonly string[] {
  if (navigator.languages?.length) return navigator.languages
  return navigator.language ? [navigator.language] : []
}

/** The language chosen in settings, or the best match for the browser if none was chosen yet. */
export function loadLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (isLocale(stored)) return stored
  } catch {
    // Storage unavailable: fall through to the browser languages.
  }
  return resolveLocale(browserLanguages())
}

export function saveLocale(locale: Locale): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, locale)
    return true
  } catch {
    return false
  }
}
