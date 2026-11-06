import { DRAFT_TTL_MS, clearDraft, loadDraft, parseDraft, saveDraft } from './draft'

const content = { step: 'message', transcript: 'I did the shopping.', message: 'Hi all', subject: 'Visit' } as const
const now = Date.UTC(2026, 10, 6, 12, 0)

describe('parseDraft', () => {
  it('reads a saved draft', () => {
    const raw = JSON.stringify({ ...content, savedAt: now - 1000 })
    expect(parseDraft(raw, now)).toEqual({ ...content, savedAt: now - 1000 })
  })

  it('rejects malformed data', () => {
    expect(parseDraft('not json', now)).toBeNull()
    expect(parseDraft('null', now)).toBeNull()
    expect(parseDraft(JSON.stringify({ ...content, step: 'structuring', savedAt: now }), now)).toBeNull()
    expect(parseDraft(JSON.stringify({ ...content, transcript: 42, savedAt: now }), now)).toBeNull()
    expect(parseDraft(JSON.stringify(content), now)).toBeNull()
  })

  it('treats a draft older than the TTL, or from the future, as gone', () => {
    expect(parseDraft(JSON.stringify({ ...content, savedAt: now - DRAFT_TTL_MS }), now)).not.toBeNull()
    expect(parseDraft(JSON.stringify({ ...content, savedAt: now - DRAFT_TTL_MS - 1 }), now)).toBeNull()
    expect(parseDraft(JSON.stringify({ ...content, savedAt: now + 60_000 }), now)).toBeNull()
  })
})

describe('draft storage', () => {
  it('saves, loads and clears the draft', () => {
    expect(saveDraft(content, now)).toBe(true)
    expect(loadDraft(now + 1000)).toEqual({ ...content, savedAt: now })

    clearDraft()
    expect(loadDraft(now)).toBeNull()
  })

  it('removes an expired draft from storage', () => {
    saveDraft(content, now)
    expect(loadDraft(now + DRAFT_TTL_MS + 1)).toBeNull()
    expect(localStorage.getItem('handover.draft')).toBeNull()
  })
})
