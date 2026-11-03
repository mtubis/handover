const STORAGE_KEY = 'handover.welcomeSeen'

// Storage can be unavailable (private mode, blocked site data); then the welcome shows each visit.
export function hasSeenWelcome(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function markWelcomeSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, 'true')
  } catch {
    // Nothing to do: the welcome will simply be shown again next time.
  }
}
