import { pl } from '../i18n/pl'
import { ApiError, AppError, describeError } from './errors'

const t = pl.errors

describe('describeError', () => {
  it.each([
    [401, 'Klucz API jest nieprawidłowy'],
    [429, 'Przekroczono limit'],
    [503, 'chwilowo niedostępna'],
    [400, 'kod 400'],
  ])('explains API status %i in plain words', (status, expected) => {
    expect(describeError(new ApiError(status, 'raw provider message'), t)).toContain(expected)
  })

  it('explains a denied microphone permission', () => {
    expect(describeError(new DOMException('denied', 'NotAllowedError'), t)).toContain(
      'Brak dostępu do mikrofonu',
    )
  })

  it('explains a network failure', () => {
    expect(describeError(new TypeError('Failed to fetch'), t)).toContain('Brak połączenia')
  })

  it('translates application errors by their code', () => {
    expect(describeError(new AppError('emptyRecording'), t)).toBe(t.emptyRecording)
  })

  it('never shows raw provider messages', () => {
    expect(describeError(new ApiError(400, 'raw provider message'), t)).not.toContain('raw')
  })

  it('falls back to a generic message for unknown errors', () => {
    expect(describeError(new Error('boom'), t)).toBe(t.unknown)
  })
})
