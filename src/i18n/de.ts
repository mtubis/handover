import type { Messages } from './messages'

// Informal "du", matching the informal tone of the Polish UI.
export const de = {
  app: {
    tagline: 'Eine Sprachnotiz. Alle auf dem neuesten Stand.',
    settingsLink: 'Einstellungen',
    storageWarning:
      'Die Einstellungen konnten in diesem Browser nicht gespeichert werden – sie gelten nur, bis du die Seite schließt.',
    noteHeading: (parentLabel) => `Notiz nach dem Besuch bei ${parentLabel}`,
    typeInstead: 'Lieber tippen',
    transcribing: 'Die Aufnahme wird in Text umgewandelt…',
    structuring: 'Die Notiz wird geordnet…',
  },
  settings: {
    heading: 'Einstellungen',
    apiKeyLabel: 'Groq-API-Schlüssel',
    apiKeyHint:
      'Der Schlüssel bleibt nur auf diesem Gerät und wird ausschließlich an api.groq.com gesendet.',
    languageLabel: 'Sprache',
    parentLabelLabel: 'Besuch bei…',
    parentLabelHint: 'Z. B. „Mama“, „Papa“, „Oma“ – wie in „Besuch bei Mama“.',
    recipientsLabel: 'E-Mail-Adressen der Geschwister (optional)',
    recipientsPlaceholder: 'anna@example.com, markus@example.com',
    recipientsHint: 'Diese Adressen werden beim Senden per E-Mail als Empfänger übernommen.',
    save: 'Speichern',
    cancel: 'Abbrechen',
  },
  recorder: {
    start: 'Notiz aufnehmen',
    stop: 'Aufnahme beenden',
    recording: (elapsed) => `Aufnahme läuft… ${elapsed}`,
    prompt: 'Erzähl, wie der Besuch war.',
  },
  transcript: {
    label: 'Deine Notiz (du kannst sie bearbeiten)',
    prepareMessage: 'Nachricht erstellen',
    recordAgain: 'Neu aufnehmen',
  },
  message: {
    label: 'Nachricht an die Geschwister (du kannst sie bearbeiten)',
    backToNote: 'Zurück zur Notiz',
    newNote: 'Neue Notiz',
  },
  share: {
    share: 'Teilen',
    email: 'Per E-Mail senden',
    copy: 'Kopieren',
    copied: 'In die Zwischenablage kopiert.',
    shareFailed: 'Teilen hat nicht geklappt. Kopiere die Nachricht und füge sie selbst ein.',
    copyFailed: 'Kopieren hat nicht geklappt. Markiere den Text und kopiere ihn selbst.',
  },
  handover: {
    defaultParentLabel: 'Mama',
    title: (parentLabel, date) => `Handover · Besuch bei ${parentLabel}, ${date}`,
    summary: (parentLabel, summary) => `So geht es ${parentLabel}: ${summary}`,
    observationsHeading: 'Mir ist aufgefallen:',
    reportedBy: (parentLabel) => `laut ${parentLabel}`,
    doneHeading: 'Erledigt:',
    tasksHeading: 'Zu übernehmen:',
    notCheckedHeading: 'Nicht geprüft:',
    flagsHeading: 'Im Auge behalten:',
    areas: {
      health: 'Gesundheit',
      sleep: 'Schlaf',
      mood: 'Stimmung',
      food: 'Essen',
      medication: 'Medikamente',
      home: 'Zuhause',
      other: 'Sonstiges',
    },
  },
  errors: {
    recordingUnsupported: 'Dieser Browser unterstützt keine Audioaufnahme.',
    notRecording: 'Es läuft keine Aufnahme.',
    emptyRecording: 'Die Aufnahme ist leer. Nimm die Notiz bitte noch einmal auf.',
    noteTooLong: 'Die Notiz ist zu lang zum Ordnen. Kürze sie und versuche es erneut.',
    invalidResponse:
      'Die Notiz konnte nicht geordnet werden – die Antwort der KI hatte ein unerwartetes Format. Bitte versuche es erneut.',
    invalidApiKey: 'Der API-Schlüssel ist ungültig oder abgelaufen. Prüfe ihn in den Einstellungen.',
    rateLimited: 'Zu viele Anfragen an den KI-Dienst. Warte kurz und versuche es erneut.',
    recordingTooLarge: 'Die Aufnahme ist zu groß. Nimm eine kürzere Notiz auf.',
    serviceUnavailable:
      'Der KI-Dienst ist vorübergehend nicht erreichbar. Versuche es gleich noch einmal.',
    apiError: (status) =>
      `Der KI-Dienst hat einen Fehler gemeldet (Code ${status}). Bitte versuche es erneut.`,
    microphoneDenied:
      'Kein Zugriff auf das Mikrofon. Erlaube das Mikrofon in den Browser-Einstellungen und versuche es erneut.',
    microphoneNotFound: 'Auf diesem Gerät wurde kein Mikrofon gefunden.',
    timeout: 'Der KI-Dienst hat nicht rechtzeitig geantwortet. Bitte versuche es erneut.',
    offline: 'Keine Verbindung zum KI-Dienst. Prüfe deine Internetverbindung und versuche es erneut.',
    unknown: 'Etwas ist schiefgelaufen. Bitte versuche es erneut.',
  },
} satisfies Messages
