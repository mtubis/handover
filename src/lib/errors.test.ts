import { ApiError, UserFacingError, describeError } from './errors'

describe('describeError', () => {
  it.each([
    [401, 'Klucz API jest nieprawidłowy'],
    [429, 'Przekroczono limit'],
    [503, 'chwilowo niedostępna'],
    [400, 'kod 400'],
  ])('explains API status %i in plain words', (status, expected) => {
    expect(describeError(new ApiError(status, 'raw provider message'))).toContain(expected)
  })

  it('explains a denied microphone permission', () => {
    expect(describeError(new DOMException('denied', 'NotAllowedError'))).toContain(
      'Brak dostępu do mikrofonu',
    )
  })

  it('explains a network failure', () => {
    expect(describeError(new TypeError('Failed to fetch'))).toContain('Brak połączenia')
  })

  it('passes user-facing messages through', () => {
    expect(describeError(new UserFacingError('Nagranie jest puste.'))).toBe('Nagranie jest puste.')
  })

  it('never shows raw provider messages', () => {
    expect(describeError(new ApiError(400, 'raw provider message'))).not.toContain('raw')
  })
})
