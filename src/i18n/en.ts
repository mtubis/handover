import type { Messages } from './messages'

export const en = {
  app: {
    tagline: 'One voice note. Everyone up to date.',
    settingsLink: 'Settings',
    howItWorksLink: 'How it works',
    storageWarning:
      "Your settings couldn't be saved in this browser — they will work until you close the page.",
    noteHeading: (personLabel) => `Note after the visit to ${personLabel}`,
    typeInstead: "I'd rather type the note",
    transcribing: 'Turning the recording into text…',
    structuring: 'Organizing the note…',
  },
  welcome: {
    heading: 'Shared care. Clear communication.',
    intro: [
      'Handover helps family members, friends and caregivers keep each other informed about someone they care for together.',
      'After a visit, record a short update. The app turns it into a clear message: how the person is doing, what was done, what needs to be taken over and what wasn’t checked. Share it with everyone involved in their care.',
    ],
    stepsHeading: 'How it works',
    steps: [
      {
        title: 'Speak or type.',
        text: 'Take a minute or two to describe the visit, or type your note.',
      },
      {
        title: 'Review and edit.',
        text: 'Check the transcript, then the prepared message. You can edit both.',
      },
      {
        title: 'Share.',
        text: 'Share the message through an available app, such as WhatsApp, SMS or email, or copy the text.',
      },
    ],
    control:
      'You decide what to share and who receives it. Handover organizes the information you provide — it doesn’t diagnose conditions or offer medical advice.',
    requirementHeading: 'What do you need?',
    requirement:
      'Your own Groq API key, which you enter in Settings. Groq is the AI service that transcribes your recording and organizes your note.',
    privacyHeading: 'What happens to your data?',
    privacy:
      'You don’t need a Handover account. Your recording and note text are sent directly to Groq for transcription and structuring. Handover does not store them on its own server.',
    start: 'Get started',
  },
  keyHelp: {
    title: 'How do I get a Groq API key?',
    intro: 'An API key works like a password that lets Handover use Groq on your behalf.',
    steps: [
      'Open the Groq console and sign in or create an account. Groq has a free plan.',
      'Create a new API key and give it a name, e.g. “Handover”.',
      'Copy the key and paste it into the “Groq API key” field in Settings.',
    ],
    consoleLink: 'Open the Groq console',
    cost: 'The free plan has usage limits. If you reach them, the app will tell you — just wait a moment and try again. A payment method is only needed if you choose a paid plan.',
    safety:
      'Treat the key like a password and don’t share it. If it ever leaks, delete it in the Groq console and create a new one.',
    close: 'Close',
  },
  privacy: {
    heading: 'Privacy',
    points: [
      'Handover has no accounts and no server of its own. Nothing you record or type reaches us.',
      'Your recording and note go directly from your device to Groq, only to be transcribed and organized. By default, Groq does not retain this data; it may keep logs for up to 30 days to troubleshoot errors or investigate abuse. Groq stores data in the USA.',
      'Your API key and settings are kept only in this browser on this device. Anyone who can use this browser can see them, so protect your device as usual.',
      'The finished message goes only where you choose to share it.',
    ],
    groqPolicyLink: 'How Groq handles your data',
  },
  settings: {
    heading: 'Settings',
    apiKeyLabel: 'Groq API key',
    apiKeyHint: 'The key stays on this device and is sent only to api.groq.com.',
    languageLabel: 'Language',
    personLabelLabel: 'Visit to…',
    personLabelHint: 'E.g. “Mom”, “Dad”, “Grandma”, “John” — as in “visit to Mom”.',
    recipientsLabel: 'Default email recipients (optional)',
    recipientsPlaceholder: 'anna@example.com, mark@example.com',
    recipientsHint: 'Added as recipients when you choose “Send by email”.',
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
    label: 'Message to share (you can edit it)',
    backToNote: 'Back to the note',
    newNote: 'New note',
  },
  share: {
    share: 'Share',
    email: 'Send by email',
    copy: 'Copy',
    copied: 'Copied to the clipboard.',
    shareFailed: "Couldn't share. Copy the message and paste it yourself.",
    copyFailed: "Couldn't copy. Select the text and copy it yourself.",
  },
  handover: {
    defaultPersonLabel: 'Mom',
    title: (personLabel, date) => `Handover · visit to ${personLabel}, ${date}`,
    summary: (personLabel, summary) => `How ${personLabel} is doing: ${summary}`,
    observationsHeading: 'What I noticed:',
    reportedBy: (personLabel) => `according to ${personLabel}`,
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
