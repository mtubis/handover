import { createContext, useContext } from 'react'
import { MESSAGES } from './dictionaries'
import { FALLBACK_LOCALE } from './locale'
import type { Messages } from './messages'

export type { Messages } from './messages'
export { MESSAGES } from './dictionaries'
export * from './locale'

// The default value lets components render outside a provider (e.g. in isolated tests).
const I18nContext = createContext<Messages>(MESSAGES[FALLBACK_LOCALE])

export const I18nProvider = I18nContext.Provider

/** The UI strings of the current language. */
export function useT(): Messages {
  return useContext(I18nContext)
}
