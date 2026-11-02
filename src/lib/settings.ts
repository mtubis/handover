export interface Settings {
  apiKey: string
  /**
   * How the family refers to the parent, used verbatim in the message (in Polish in the genitive:
   * "wizyta u mamy"). Empty means the default for the UI language.
   */
  parentLabel: string
  /** Optional default recipients for the mailto: fallback. */
  recipients: string
}

const STORAGE_KEY = 'handover.settings'

export const DEFAULT_SETTINGS: Settings = { apiKey: '', parentLabel: '', recipients: '' }

// Storage can be unavailable (private mode, blocked site data), so every access is guarded.
export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_SETTINGS
    const { apiKey, parentLabel, recipients } = parsed as Record<string, unknown>
    return {
      apiKey: typeof apiKey === 'string' ? apiKey : '',
      parentLabel: typeof parentLabel === 'string' ? parentLabel.trim() : '',
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
