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
