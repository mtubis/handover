import { vi } from 'vitest'
import { FALLBACK_LOCALE, loadLocale, resolveLocale, saveLocale } from './locale'

describe('resolveLocale', () => {
  it.each([
    [['pl'], 'pl'],
    [['pl-PL'], 'pl'],
    [['PL-pl'], 'pl'],
    [['en-GB'], 'en'],
    [['fr-FR', 'pl-PL', 'en-US'], 'pl'],
  ])('matches %j by base language → %s', (preferred, expected) => {
    expect(resolveLocale(preferred)).toBe(expected)
  })

  it('falls back to English when no language matches', () => {
    expect(resolveLocale(['fr-FR', 'es'])).toBe(FALLBACK_LOCALE)
    expect(FALLBACK_LOCALE).toBe('en')
  })

  it('falls back to English when the browser reports no languages', () => {
    expect(resolveLocale([])).toBe('en')
  })
})

describe('loadLocale', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('uses the browser languages when nothing was chosen', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['pl-PL', 'en'])
    expect(loadLocale()).toBe('pl')
  })

  it('prefers the language chosen in settings over the browser', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['pl-PL'])
    saveLocale('en')
    expect(loadLocale()).toBe('en')
  })

  it('ignores an unknown stored value', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['pl'])
    localStorage.setItem('handover.locale', 'xx')
    expect(loadLocale()).toBe('pl')
  })
})
