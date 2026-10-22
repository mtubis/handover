/** An HTTP error returned by the AI provider. */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** An error whose message is already written for the user (in Polish). */
export class UserFacingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UserFacingError'
  }
}

export function describeError(error: unknown): string {
  if (error instanceof UserFacingError) return error.message

  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Klucz API jest nieprawidłowy lub wygasł. Sprawdź go w Ustawieniach.'
    }
    if (error.status === 429) {
      return 'Przekroczono limit zapytań do usługi AI. Odczekaj chwilę i spróbuj ponownie.'
    }
    if (error.status === 413) {
      return 'Nagranie jest za duże. Nagraj krótszą notatkę.'
    }
    if (error.status >= 500) {
      return 'Usługa AI jest chwilowo niedostępna. Spróbuj ponownie za chwilę.'
    }
    return `Usługa AI zwróciła błąd (kod ${error.status}). Spróbuj ponownie.`
  }

  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
      return 'Brak dostępu do mikrofonu. Zezwól na mikrofon w ustawieniach przeglądarki i spróbuj ponownie.'
    }
    if (error.name === 'NotFoundError') {
      return 'Nie znaleziono mikrofonu w tym urządzeniu.'
    }
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return 'Usługa AI nie odpowiedziała na czas. Spróbuj ponownie.'
    }
  }

  // fetch() rejects with a TypeError when the network or CORS fails.
  if (error instanceof TypeError) {
    return 'Brak połączenia z usługą AI. Sprawdź internet i spróbuj ponownie.'
  }

  return 'Coś poszło nie tak. Spróbuj ponownie.'
}
