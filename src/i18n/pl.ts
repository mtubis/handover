import type { Messages } from './messages'

export const pl = {
  app: {
    tagline: 'Jedna notatka głosowa. Wszyscy na bieżąco.',
    settingsLink: 'Ustawienia',
    storageWarning:
      'Nie udało się zapamiętać ustawień w przeglądarce — będą działać do zamknięcia strony.',
    noteHeading: (parentLabel) => `Notatka po wizycie u ${parentLabel}`,
    typeInstead: 'Wolę napisać notatkę',
    transcribing: 'Zamieniam nagranie na tekst…',
    structuring: 'Porządkuję notatkę…',
  },
  settings: {
    heading: 'Ustawienia',
    apiKeyLabel: 'Klucz API Groq',
    apiKeyHint: 'Klucz zostaje tylko na tym urządzeniu i jest wysyłany wyłącznie do api.groq.com.',
    languageLabel: 'Język',
    parentLabelLabel: 'Wizyta u…',
    parentLabelPlaceholder: 'mamy',
    parentLabelHint: 'Np. „mamy”, „taty”, „babci” — tak, jak w zdaniu „wizyta u mamy”.',
    recipientsLabel: 'Adresy e-mail rodzeństwa (opcjonalnie)',
    recipientsPlaceholder: 'ania@example.com, maciej@example.com',
    recipientsHint: 'Wstawiane jako adresaci po wybraniu „Wyślij e-mailem”.',
    save: 'Zapisz',
    cancel: 'Anuluj',
  },
  recorder: {
    start: 'Nagraj notatkę',
    stop: 'Zakończ nagrywanie',
    recording: (elapsed) => `Nagrywam… ${elapsed}`,
    prompt: 'Opowiedz, jak minęła wizyta.',
  },
  transcript: {
    label: 'Twoja notatka (możesz poprawić)',
    prepareMessage: 'Przygotuj wiadomość',
    recordAgain: 'Nagraj od nowa',
  },
  message: {
    label: 'Wiadomość dla rodzeństwa (możesz poprawić)',
    backToNote: 'Wróć do notatki',
    newNote: 'Nowa notatka',
  },
  share: {
    share: 'Udostępnij',
    email: 'Wyślij e-mailem',
    copy: 'Kopiuj',
    copied: 'Skopiowano do schowka.',
    shareFailed: 'Nie udało się udostępnić. Skopiuj wiadomość i wklej ją ręcznie.',
    copyFailed: 'Nie udało się skopiować. Zaznacz tekst i skopiuj go ręcznie.',
  },
  errors: {
    recordingUnsupported: 'Ta przeglądarka nie obsługuje nagrywania dźwięku.',
    notRecording: 'Nagrywanie nie jest aktywne.',
    emptyRecording: 'Nagranie jest puste. Spróbuj nagrać notatkę jeszcze raz.',
    noteTooLong: 'Notatka jest za długa do uporządkowania. Skróć ją i spróbuj ponownie.',
    invalidResponse:
      'Nie udało się uporządkować notatki — odpowiedź AI miała nieoczekiwany format. Spróbuj ponownie.',
    invalidApiKey: 'Klucz API jest nieprawidłowy lub wygasł. Sprawdź go w Ustawieniach.',
    rateLimited: 'Przekroczono limit zapytań do usługi AI. Odczekaj chwilę i spróbuj ponownie.',
    recordingTooLarge: 'Nagranie jest za duże. Nagraj krótszą notatkę.',
    serviceUnavailable: 'Usługa AI jest chwilowo niedostępna. Spróbuj ponownie za chwilę.',
    apiError: (status) => `Usługa AI zwróciła błąd (kod ${status}). Spróbuj ponownie.`,
    microphoneDenied:
      'Brak dostępu do mikrofonu. Zezwól na mikrofon w ustawieniach przeglądarki i spróbuj ponownie.',
    microphoneNotFound: 'Nie znaleziono mikrofonu w tym urządzeniu.',
    timeout: 'Usługa AI nie odpowiedziała na czas. Spróbuj ponownie.',
    offline: 'Brak połączenia z usługą AI. Sprawdź internet i spróbuj ponownie.',
    unknown: 'Coś poszło nie tak. Spróbuj ponownie.',
  },
} satisfies Messages
