import { createContext, useContext } from 'react'
import type { Messages } from './messages'
import { pl } from './pl'

export type { Messages } from './messages'

export const MESSAGES = { pl } satisfies Record<string, Messages>

export type Locale = keyof typeof MESSAGES

export const DEFAULT_LOCALE: Locale = 'pl'

// The default value lets components render outside a provider (e.g. in isolated tests).
const I18nContext = createContext<Messages>(MESSAGES[DEFAULT_LOCALE])

export const I18nProvider = I18nContext.Provider

/** The UI strings of the current language. */
export function useT(): Messages {
  return useContext(I18nContext)
}
