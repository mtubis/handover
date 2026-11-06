/**
 * The unfinished note, kept on this device so a reload or a closed tab doesn't lose it.
 * Only one draft exists at a time; this is not a history of visits. The recording itself lives in
 * IndexedDB (`draftAudio.ts`), because localStorage holds strings only and is too small for audio.
 */

/** "recording": a recording that has not been transcribed yet (or the request was interrupted). */
export type DraftStep = 'recording' | 'transcript' | 'message'

export interface Draft {
  step: DraftStep
  transcript: string
  message: string
  /** The share/email subject, which carries the visit date. */
  subject: string
  /** Last change, in milliseconds since the epoch. */
  savedAt: number
}

const STORAGE_KEY = 'handover.draft'
const DRAFT_STEPS: readonly DraftStep[] = ['recording', 'transcript', 'message']

/** A draft untouched for this long is deleted: a note about a visit goes stale quickly. */
export const DRAFT_TTL_MS = 24 * 60 * 60 * 1000

export function parseDraft(raw: string, now: number): Draft | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (typeof parsed !== 'object' || parsed === null) return null
  const { step, transcript, message, subject, savedAt } = parsed as Record<string, unknown>
  if (
    !DRAFT_STEPS.includes(step as DraftStep) ||
    typeof transcript !== 'string' ||
    typeof message !== 'string' ||
    typeof subject !== 'string' ||
    typeof savedAt !== 'number'
  ) {
    return null
  }
  if (now - savedAt > DRAFT_TTL_MS || savedAt > now) return null
  return { step: step as DraftStep, transcript, message, subject, savedAt }
}

// Storage can be unavailable (private mode, blocked site data), so every access is guarded.
/** Returns the current draft; an expired or unreadable one is removed. */
export function loadDraft(now: number = Date.now()): Draft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null
    const draft = parseDraft(raw, now)
    if (draft === null) localStorage.removeItem(STORAGE_KEY)
    return draft
  } catch {
    return null
  }
}

export function saveDraft(draft: Omit<Draft, 'savedAt'>, now: number = Date.now()): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...draft, savedAt: now }))
    return true
  } catch {
    return false
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to do: storage is unavailable, so there is no draft either.
  }
}
