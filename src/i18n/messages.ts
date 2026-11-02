import type { Area } from '../ai/handover'
import type { AppErrorCode } from '../lib/errors'

/**
 * Every UI string, per language. Strings with values are functions, so a translation can place
 * the value wherever its grammar needs it and the compiler checks the arguments.
 */
export interface Messages {
  app: {
    tagline: string
    settingsLink: string
    storageWarning: string
    noteHeading: (parentLabel: string) => string
    typeInstead: string
    transcribing: string
    structuring: string
  }
  settings: {
    heading: string
    apiKeyLabel: string
    apiKeyHint: string
    languageLabel: string
    parentLabelLabel: string
    parentLabelHint: string
    recipientsLabel: string
    recipientsPlaceholder: string
    recipientsHint: string
    save: string
    cancel: string
  }
  recorder: {
    start: string
    stop: string
    recording: (elapsed: string) => string
    prompt: string
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
  /** The message for the siblings, written in the same language as the UI. */
  handover: {
    /** Used when the parent label in settings is left empty; also the field's placeholder. */
    defaultParentLabel: string
    title: (parentLabel: string, date: string) => string
    summary: (parentLabel: string, summary: string) => string
    observationsHeading: string
    /** Marks the parent's own account, e.g. "Sleep (according to Mom): …". */
    reportedBy: (parentLabel: string) => string
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
