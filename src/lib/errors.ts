import type { Messages } from '../i18n/messages'

/** An HTTP error returned by the AI provider. */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export type AppErrorCode =
  | 'recordingUnsupported'
  | 'notRecording'
  | 'emptyRecording'
  | 'noteTooLong'
  | 'invalidResponse'

/** An expected failure with a known explanation; the text comes from the UI language. */
export class AppError extends Error {
  readonly code: AppErrorCode

  constructor(code: AppErrorCode) {
    super(code)
    this.name = 'AppError'
    this.code = code
  }
}

export function describeError(error: unknown, t: Messages['errors']): string {
  if (error instanceof AppError) return t[error.code]

  if (error instanceof ApiError) {
    if (error.status === 401) return t.invalidApiKey
    if (error.status === 429) return t.rateLimited
    if (error.status === 413) return t.recordingTooLarge
    if (error.status >= 500) return t.serviceUnavailable
    return t.apiError(error.status)
  }

  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
      return t.microphoneDenied
    }
    if (error.name === 'NotFoundError') return t.microphoneNotFound
    if (error.name === 'TimeoutError' || error.name === 'AbortError') return t.timeout
  }

  // fetch() rejects with a TypeError when the network or CORS fails.
  if (error instanceof TypeError) return t.offline

  return t.unknown
}
