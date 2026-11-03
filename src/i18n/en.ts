import type { Messages } from './messages'

export const en = {
  app: {
    tagline: 'One voice note. Everyone up to date.',
    settingsLink: 'Settings',
    howItWorksLink: 'How it works',
    storageWarning:
      "Your settings couldn't be saved in this browser — they will work until you close the page.",
    noteHeading: (parentLabel) => `Note after the visit to ${parentLabel}`,
    typeInstead: "I'd rather type the note",
    transcribing: 'Turning the recording into text…',
    structuring: 'Organizing the note…',
  },
  welcome: {
    heading: 'What is Handover?',
    intro:
      "Handover helps siblings who share the care of an elderly parent. After a visit, record a short voice note and the app turns it into a clear message for the rest of the family: how the parent is doing, what was done, what the next person should take over and what wasn't checked.",
    stepsHeading: 'How it works',
    steps: [
      'Record: in a minute or two, say how the visit went — or type it.',
      'Review: the app organizes the note into a message. Read it and correct anything you like.',
      'Share: send it to your siblings via WhatsApp, SMS or e-mail with one tap.',
    ],
    noDiagnosis:
      "Handover doesn't diagnose or assess anything — it only organizes your note. You always see the message before you send it.",
    requirement:
      "To start, you need your own Groq API key (Groq is the AI service that turns the recording into text and organizes the note). You'll enter it in Settings.",
    privacy:
      'No account and no Handover server: your note goes from your device directly to Groq, only to be processed.',
    start: 'Get started',
  },
  settings: {
    heading: 'Settings',
    apiKeyLabel: 'Groq API key',
    apiKeyHint: 'The key stays on this device and is sent only to api.groq.com.',
    languageLabel: 'Language',
    parentLabelLabel: 'Visit to…',
    parentLabelHint: 'E.g. “Mom”, “Dad”, “Grandma” — as in “visit to Mom”.',
    recipientsLabel: "Siblings' e-mail addresses (optional)",
    recipientsPlaceholder: 'anna@example.com, mark@example.com',
    recipientsHint: 'Added as recipients when you choose “Send by e-mail”.',
    save: 'Save',
    cancel: 'Cancel',
  },
  recorder: {
    start: 'Record a note',
    stop: 'Stop recording',
    recording: (elapsed) => `Recording… ${elapsed}`,
    prompt: 'Say how the visit went.',
  },
  transcript: {
    label: 'Your note (you can edit it)',
    prepareMessage: 'Prepare the message',
    recordAgain: 'Record again',
  },
  message: {
    label: 'Message for your siblings (you can edit it)',
    backToNote: 'Back to the note',
    newNote: 'New note',
  },
  share: {
    share: 'Share',
    email: 'Send by e-mail',
    copy: 'Copy',
    copied: 'Copied to the clipboard.',
    shareFailed: "Couldn't share. Copy the message and paste it yourself.",
    copyFailed: "Couldn't copy. Select the text and copy it yourself.",
  },
  handover: {
    defaultParentLabel: 'Mom',
    title: (parentLabel, date) => `Handover · visit to ${parentLabel}, ${date}`,
    summary: (parentLabel, summary) => `How ${parentLabel} is doing: ${summary}`,
    observationsHeading: 'What I noticed:',
    reportedBy: (parentLabel) => `according to ${parentLabel}`,
    doneHeading: 'Done:',
    tasksHeading: 'To take over:',
    notCheckedHeading: 'Not checked:',
    flagsHeading: 'Worth keeping an eye on:',
    areas: {
      health: 'Health',
      sleep: 'Sleep',
      mood: 'Mood',
      food: 'Food',
      medication: 'Medication',
      home: 'Home',
      other: 'Other',
    },
  },
  errors: {
    recordingUnsupported: "This browser doesn't support audio recording.",
    notRecording: 'Recording is not active.',
    emptyRecording: 'The recording is empty. Try recording the note again.',
    noteTooLong: 'The note is too long to organize. Shorten it and try again.',
    invalidResponse:
      "Couldn't organize the note — the AI response had an unexpected format. Please try again.",
    invalidApiKey: 'The API key is invalid or has expired. Check it in Settings.',
    rateLimited: 'Too many requests to the AI service. Wait a moment and try again.',
    recordingTooLarge: 'The recording is too large. Record a shorter note.',
    serviceUnavailable: 'The AI service is temporarily unavailable. Try again in a moment.',
    apiError: (status) => `The AI service returned an error (code ${status}). Please try again.`,
    microphoneDenied:
      'No access to the microphone. Allow it in your browser settings and try again.',
    microphoneNotFound: 'No microphone was found on this device.',
    timeout: "The AI service didn't respond in time. Please try again.",
    offline: "Can't reach the AI service. Check your internet connection and try again.",
    unknown: 'Something went wrong. Please try again.',
  },
} satisfies Messages
