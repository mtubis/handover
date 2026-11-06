export interface Settings {
  apiKey: string
  /**
   * How the caregiver refers to the person they care for, used verbatim in the message (in Polish
   * in the genitive: "wizyta u mamy"). Empty means the default for the UI language.
   */
  personLabel: string
  /** Optional default recipients for the mailto: fallback. */
  recipients: string
}

const STORAGE_KEY = 'handover.settings'

export const DEFAULT_SETTINGS: Settings = { apiKey: '', personLabel: '', recipients: '' }

// Storage can be unavailable (private mode, blocked site data), so every access is guarded.
export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_SETTINGS
    // `parentLabel` is the name used before the app was opened up beyond caring for a parent.
    const { apiKey, personLabel, parentLabel, recipients } = parsed as Record<string, unknown>
    const label = personLabel ?? parentLabel
    return {
      apiKey: typeof apiKey === 'string' ? apiKey : '',
      personLabel: typeof label === 'string' ? label.trim() : '',
      recipients: typeof recipients === 'string' ? recipients : '',
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Settings): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    return true
  } catch {
    return false
  }
}
