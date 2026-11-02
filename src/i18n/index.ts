import { createContext, useContext } from 'react'
import { en } from './en'
import { FALLBACK_LOCALE, type Locale } from './locale'
import type { Messages } from './messages'
import { pl } from './pl'

export type { Messages } from './messages'
export * from './locale'

export const MESSAGES: Record<Locale, Messages> = { en, pl }

// The default value lets components render outside a provider (e.g. in isolated tests).
const I18nContext = createContext<Messages>(MESSAGES[FALLBACK_LOCALE])

export const I18nProvider = I18nContext.Provider

/** The UI strings of the current language. */
export function useT(): Messages {
  return useContext(I18nContext)
}
