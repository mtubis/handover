export interface Settings {
  apiKey: string
  /** Parent label in the genitive case, used verbatim: "wizyta u {parentLabel}". */
  parentLabel: string
}

const STORAGE_KEY = 'handover.settings'

export const DEFAULT_SETTINGS: Settings = { apiKey: '', parentLabel: 'mamy' }

// Storage can be unavailable (private mode, blocked site data), so every access is guarded.
export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_SETTINGS
    const { apiKey, parentLabel } = parsed as Record<string, unknown>
    return {
      apiKey: typeof apiKey === 'string' ? apiKey : '',
      parentLabel:
        typeof parentLabel === 'string' && parentLabel.trim() !== ''
          ? parentLabel
          : DEFAULT_SETTINGS.parentLabel,
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
