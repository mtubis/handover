import { en } from './en'
import type { Locale } from './locale'
import type { Messages } from './messages'
import { pl } from './pl'

// Kept free of React, so pure functions (e.g. message formatting) can use the dictionaries too.
export const MESSAGES: Record<Locale, Messages> = { en, pl }
