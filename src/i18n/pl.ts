import type { Messages } from './messages'

export const pl = {
  app: {
    tagline: 'Jedna notatka głosowa. Wszyscy na bieżąco.',
    settingsLink: 'Ustawienia',
    howItWorksLink: 'Jak to działa?',
    storageWarning:
      'Nie udało się zapamiętać ustawień w przeglądarce — będą działać do zamknięcia strony.',
    noteHeading: (parentLabel) => `Notatka po wizycie u ${parentLabel}`,
    typeInstead: 'Wolę napisać notatkę',
    transcribing: 'Zamieniam nagranie na tekst…',
    structuring: 'Porządkuję notatkę…',
  },
  welcome: {
    heading: 'Czym jest Handover?',
    intro:
      'Handover pomaga rodzeństwu, które wspólnie opiekuje się starszym rodzicem. Po wizycie nagrywasz krótką notatkę głosową, a aplikacja zamienia ją w przejrzystą wiadomość dla reszty rodziny: jak czuje się rodzic, co zostało zrobione, co przejmuje następna osoba i czego nie sprawdzono.',
    stepsHeading: 'Jak to działa',
    steps: [
      'Nagraj: w minutę lub dwie opowiedz, jak minęła wizyta — albo ją napisz.',
      'Sprawdź: aplikacja porządkuje notatkę w wiadomość. Przeczytaj ją i popraw, co chcesz.',
      'Wyślij: jednym dotknięciem przez WhatsApp, SMS albo e-mail.',
    ],
    noDiagnosis:
      'Handover niczego nie diagnozuje ani nie ocenia — tylko porządkuje Twoją notatkę. Zanim wyślesz wiadomość, zawsze ją widzisz.',
    requirement:
      'Na start potrzebujesz własnego klucza API Groq (Groq to usługa AI, która zamienia nagranie na tekst i porządkuje notatkę). Wpiszesz go w Ustawieniach.',
    privacy:
      'Bez konta i bez serwera Handover: notatka trafia z Twojego urządzenia prosto do Groq, wyłącznie do przetworzenia.',
    start: 'Zaczynamy',
  },
  settings: {
    heading: 'Ustawienia',
    apiKeyLabel: 'Klucz API Groq',
    apiKeyHint: 'Klucz zostaje tylko na tym urządzeniu i jest wysyłany wyłącznie do api.groq.com.',
    languageLabel: 'Język',
    parentLabelLabel: 'Wizyta u…',
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
  handover: {
    defaultParentLabel: 'mamy',
    title: (parentLabel, date) => `Handover · wizyta u ${parentLabel}, ${date}`,
    summary: (parentLabel, summary) => `Co u ${parentLabel}: ${summary}`,
    observationsHeading: 'Zauważyłam/em:',
    reportedBy: (parentLabel) => `wg ${parentLabel}`,
    doneHeading: 'Zrobione:',
    tasksHeading: 'Do przejęcia:',
    notCheckedHeading: 'Nie sprawdzono:',
    flagsHeading: 'Warto zwrócić uwagę:',
    areas: {
      health: 'Zdrowie',
      sleep: 'Sen',
      mood: 'Nastrój',
      food: 'Jedzenie',
      medication: 'Leki',
      home: 'Dom',
      other: 'Inne',
    },
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
