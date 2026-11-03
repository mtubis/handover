import type { Messages } from './messages'

export const pl = {
  app: {
    tagline: 'Jedna notatka głosowa. Wszyscy na bieżąco.',
    settingsLink: 'Ustawienia',
    howItWorksLink: 'Jak to działa?',
    storageWarning:
      'Nie udało się zapamiętać ustawień w przeglądarce — będą działać do zamknięcia strony.',
    noteHeading: (personLabel) => `Notatka po wizycie u ${personLabel}`,
    typeInstead: 'Wolę napisać notatkę',
    transcribing: 'Zamieniam nagranie na tekst…',
    structuring: 'Porządkuję notatkę…',
  },
  welcome: {
    heading: 'Wspólna opieka, sprawny przepływ informacji',
    intro: [
      'Handover pomaga bliskim i opiekunom przekazywać sobie informacje o osobie, którą wspólnie się opiekują.',
      'Po wizycie nagraj krótką relację. Aplikacja przygotuje przejrzystą wiadomość: jak czuje się osoba pod opieką, co zostało zrobione, co pozostaje do przejęcia i czego nie sprawdzono. Udostępnij ją rodzinie, bliskim lub innym opiekunom.',
    ],
    stepsHeading: 'Jak to działa',
    steps: [
      {
        title: 'Opowiedz lub napisz.',
        text: 'W minutę lub dwie opowiedz, jak minęła wizyta. Możesz też wpisać notatkę.',
      },
      {
        title: 'Sprawdź i popraw.',
        text: 'Przejrzyj transkrypcję, a potem przygotowaną wiadomość. Obie możesz edytować.',
      },
      {
        title: 'Udostępnij.',
        text: 'Przekaż wiadomość przez dostępną aplikację, np. WhatsApp, SMS lub e-mail, albo skopiuj jej treść.',
      },
    ],
    control:
      'Ty decydujesz, co przekażesz i komu. Handover porządkuje podane informacje — nie stawia diagnoz ani nie udziela porad medycznych.',
    requirementHeading: 'Czego potrzebujesz?',
    requirement:
      'Własnego klucza API Groq, który wpiszesz w ustawieniach. Groq to usługa AI zamieniająca nagranie na tekst i porządkująca notatkę.',
    privacyHeading: 'Co dzieje się z Twoimi danymi?',
    privacy:
      'Nie musisz zakładać konta w Handover. Nagranie i tekst notatki są przesyłane bezpośrednio do Groq w celu transkrypcji i uporządkowania. Handover nie zapisuje ich na swoim serwerze.',
    start: 'Zacznij',
  },
  keyHelp: {
    title: 'Jak uzyskać klucz Groq?',
    intro: 'Klucz API działa jak hasło, dzięki któremu Handover może korzystać z Groq w Twoim imieniu.',
    steps: [
      'Otwórz konsolę Groq i zaloguj się albo załóż konto. Groq ma darmowy plan.',
      'Utwórz nowy klucz API i nadaj mu nazwę, np. „Handover”.',
      'Skopiuj klucz i wklej go w pole „Klucz API Groq” w ustawieniach.',
    ],
    consoleLink: 'Otwórz konsolę Groq',
    cost: 'Darmowy plan ma limity użycia. Gdy je przekroczysz, aplikacja Ci o tym powie — wystarczy chwilę odczekać i spróbować ponownie. Metoda płatności jest potrzebna tylko przy wyborze płatnego planu.',
    safety:
      'Traktuj klucz jak hasło i nikomu go nie przekazuj. Jeśli wycieknie, usuń go w konsoli Groq i utwórz nowy.',
    close: 'Zamknij',
  },
  privacy: {
    heading: 'Prywatność',
    points: [
      'Handover nie ma kont ani własnego serwera. Nic z tego, co nagrasz lub wpiszesz, do nas nie trafia.',
      'Nagranie i notatka trafiają z Twojego urządzenia prosto do Groq, wyłącznie do transkrypcji i uporządkowania. Groq domyślnie nie przechowuje tych danych; może zachować logi do 30 dni w celu diagnozy błędów lub wykrywania nadużyć. Groq przechowuje dane w USA.',
      'Klucz API i ustawienia są zapisane tylko w tej przeglądarce na tym urządzeniu. Każdy, kto ma dostęp do tej przeglądarki, może je zobaczyć — zabezpiecz urządzenie jak zwykle.',
      'Gotowa wiadomość trafia tylko tam, gdzie ją udostępnisz.',
    ],
    groqPolicyLink: 'Jak Groq postępuje z danymi (po angielsku)',
  },
  settings: {
    heading: 'Ustawienia',
    apiKeyLabel: 'Klucz API Groq',
    apiKeyHint: 'Klucz zostaje tylko na tym urządzeniu i jest wysyłany wyłącznie do api.groq.com.',
    languageLabel: 'Język',
    personLabelLabel: 'Wizyta u…',
    personLabelHint: 'Np. „mamy”, „taty”, „babci”, „pana Janka” — tak, jak w zdaniu „wizyta u mamy”.',
    recipientsLabel: 'Domyślni adresaci e-mail (opcjonalnie)',
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
    kept: 'Nagranie zostało zachowane — możesz spróbować ponownie.',
    retry: 'Spróbuj ponownie',
    discard: 'Nagraj nową notatkę',
  },
  transcript: {
    label: 'Twoja notatka (możesz poprawić)',
    prepareMessage: 'Przygotuj wiadomość',
    recordAgain: 'Nagraj od nowa',
  },
  message: {
    label: 'Wiadomość do przekazania (możesz poprawić)',
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
    defaultPersonLabel: 'mamy',
    title: (personLabel, date) => `Handover · wizyta u ${personLabel}, ${date}`,
    summary: (personLabel, summary) => `Co u ${personLabel}: ${summary}`,
    observationsHeading: 'Zauważyłam/em:',
    reportedBy: (personLabel) => `wg ${personLabel}`,
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
