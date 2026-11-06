import type { Area } from '../ai/handover'
import type { AppErrorCode } from '../lib/errors'

/**
 * Every UI string, per language. Strings with values are functions, so a translation can place
 * the value wherever its grammar needs it and the compiler checks the arguments.
 */
export interface WelcomeStep {
  title: string
  text: string
}

export interface Messages {
  app: {
    tagline: string
    settingsLink: string
    howItWorksLink: string
    storageWarning: string
    noteHeading: (personLabel: string) => string
    typeInstead: string
    transcribing: string
    structuring: string
  }
  /** First-visit introduction, also reachable from the header. */
  welcome: {
    heading: string
    /** Paragraphs. */
    intro: readonly string[]
    stepsHeading: string
    steps: readonly [record: WelcomeStep, review: WelcomeStep, share: WelcomeStep]
    /** The user stays in control; the app does not diagnose. */
    control: string
    requirementHeading: string
    requirement: string
    privacyHeading: string
    privacy: string
    /** Not a medical device; where to turn when something is worrying. */
    disclaimer: string
    start: string
  }
  /** How to get a Groq API key; opened from the welcome screen and next to the key field. */
  keyHelp: {
    title: string
    intro: string
    steps: readonly [openConsole: string, createKey: string, pasteKey: string]
    consoleLink: string
    cost: string
    safety: string
    close: string
  }
  privacy: {
    heading: string
    points: readonly string[]
    groqPolicyLink: string
  }
  settings: {
    heading: string
    apiKeyLabel: string
    apiKeyHint: string
    languageLabel: string
    personLabelLabel: string
    personLabelHint: string
    recipientsLabel: string
    recipientsPlaceholder: string
    recipientsHint: string
    save: string
    cancel: string
  }
  /** A note restored after a reload or a closed tab. */
  draft: {
    restored: (savedAt: string) => string
    delete: string
  }
  recorder: {
    start: string
    stop: string
    recording: (elapsed: string) => string
    prompt: string
    /** After a failed transcription: the recording is still there. */
    kept: string
    retry: string
    discard: string
  }
  transcript: {
    label: string
    prepareMessage: string
    recordAgain: string
  }
  message: {
    label: string
    backToNote: string
    newNote: string
  }
  share: {
    share: string
    email: string
    copy: string
    copied: string
    shareFailed: string
    copyFailed: string
  }
  /** The message to share, written in the same language as the UI. */
  handover: {
    /** Used when the person label in settings is left empty; also the field's placeholder. */
    defaultPersonLabel: string
    title: (personLabel: string, date: string) => string
    summary: (personLabel: string, summary: string) => string
    observationsHeading: string
    /** Marks the cared-for person's own account, e.g. "Sleep (according to Mom): …". */
    reportedBy: (personLabel: string) => string
    doneHeading: string
    tasksHeading: string
    notCheckedHeading: string
    flagsHeading: string
    areas: Record<Area, string>
  }
  errors: Record<AppErrorCode, string> & {
    invalidApiKey: string
    rateLimited: string
    recordingTooLarge: string
    serviceUnavailable: string
    apiError: (status: number) => string
    microphoneDenied: string
    microphoneNotFound: string
    timeout: string
    offline: string
    unknown: string
  }
}
