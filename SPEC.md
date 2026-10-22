# SPEC — Handover

> **One voice note. Everyone up to date.**

## Problem
When siblings take turns visiting an aging parent, information gets lost between visits: who noticed that mom is eating less, who was supposed to buy the medication, whether anyone checked the pill organizer. The person coming back from a visit usually tells the same story several times, or not at all because they are tired. Typing a longer message in the car or on the way home is inconvenient; saying it out loud is easy.

## User
An adult child (caregiver) returning from a visit to their parent. Uses a phone, has 1–2 minutes, does not want to install yet another app or create accounts. The recipients (siblings) already have their own communication channels (WhatsApp, SMS, email).

## Flow (the single end-to-end path)
1. **Settings (one-time):** the user enters a Groq API key. Optionally a name/label for the parent (e.g. "mama").
2. **Recording:** a large start/stop button with a visible recording timer.
3. **Transcription:** audio → `whisper-large-v3-turbo` (`language=pl`). The text is shown so it can be read and corrected.
4. **Structuring:** transcript → `openai/gpt-oss-120b` → JSON (schema below).
5. **Message preview:** a ready-made, editable text.
6. **Sharing:** a "Share" button → Web Share API. Fallback when Web Share is unavailable: a `mailto:` link with pre-filled subject and body, plus "Copy to clipboard".

## LLM response schema
A handover answers four questions: how is the parent, what was done, what does the next person take over, and what is still unknown.

```json
{
  "summary": "2–3 sentences: how the parent is doing and what happened during the visit",
  "observations": [
    {
      "area": "health | sleep | mood | food | medication | home | other",
      "note": "observation in the note's own words",
      "source": "observed | reported"
    }
  ],
  "done_during_visit": ["something the caregiver did, e.g. groceries"],
  "tasks_for_next_visit": [
    { "task": "a concrete task", "owner": "a person named in the note, or null" }
  ],
  "not_checked": ["something explicitly not checked or left unclear, e.g. medication"],
  "flags": ["something the caregiver themselves described as worrying — only if said in the note"]
}
```

Prompt rules:
- Only facts from the note. Missing information → an empty array, never invented content. No invented people or dates.
- **Preserve negations.** "I didn't check the meds" goes to `not_checked`, never becomes "meds checked".
- **Distinguish who said what.** "Mom said she slept badly" is `reported` (the parent's account); "she was limping" is `observed` (the caregiver's observation).
- An `owner` is set only if the note names who will do it ("Ania will call the clinic").
- No diagnoses, medical recommendations, or urgency assessments.
- Output language: Polish. Tone: factual and warm, no dramatizing.

## Message format (example)
The message is user-facing, so its content is in Polish; the product name stays "Handover". Empty sections are omitted.
```
Handover · wizyta u mamy, 21.10

Co u mamy: ...

Zauważyłam/em:
- Sen (wg mamy): słabo spała
- Nastrój: ...

Zrobione:
- zakupy

Do przejęcia:
- [ ] Ania: zadzwonić do przychodni
- [ ] ...

Nie sprawdzono:
- leki

Warto zwrócić uwagę: ...
```

## Non-functional requirements
- Works in mobile Chrome (Android) and Safari (iOS) over HTTPS.
- No backend, no persistent storage of notes or transcripts.
- Readable error messages: missing key, microphone permission denied, API error (401/429 explained in plain words), invalid JSON from the LLM.
- Recording format depends on the browser (WebM/Opus in Chrome, MP4/AAC in Safari); both are sent to Whisper as-is, with a correct file extension.

## Testing strategy

### v1 (within the 2 h limit)
Goal: prove the critical logic and the most important UI behavior, not coverage.

- **Unit tests (Vitest)** for pure functions:
  - parsing and validating the LLM JSON response (valid, missing fields, invalid JSON),
  - formatting the final message from the structured data (empty sections are omitted, owners rendered, negations kept in "Nie sprawdzono"),
  - building the `mailto:` link (encoding of subject and body).
- **Component tests (React Testing Library)**, 1–2 tests with the AI layer mocked:
  - the message preview is editable and "Share" sends the edited text,
  - when `navigator.share` is unavailable, the `mailto:` / copy fallback is shown.
- Not tested in v1: `MediaRecorder`, real AI calls, cross-browser behavior (verified manually on a phone).

### Later (after the recruitment task)
- Full user-flow tests with the AI layer mocked (record → transcript → message → share), including error states.
- Mock Service Worker (MSW) for the HTTP layer instead of module mocks.
- Accessibility checks (e.g. `vitest-axe`).
- A small prompt evaluation set run against fixtures (negations, reported vs observed, no invented owners).
- Optional E2E (Playwright) for the happy path.

## Time plan (~2 h, highest risk first)
| Time | Step |
|---|---|
| 0–10 min | Review the plan in plan mode, correct it |
| 10–25 | Vite + React + TS skeleton with Vitest + RTL, first push → Vercel deploy, settings screen with the API key |
| 25–55 | Recording → transcription, **verified on a phone via the Vercel deployment** |
| 55–80 | Prompt + structuring + editable preview, unit tests for parsing and formatting |
| 80–95 | Web Share + `mailto:` + copy, RTL tests for preview and fallback |
| 95–110 | Final deploy, test on a phone, screenshots |
| 110–120 | README, submission note, log export |

**Checkpoint at minute 60:** if transcription does not work on a phone, cut according to the list below.

## Cut order (first to go → last to go)
1. PWA manifest / install to home screen.
2. Remembered parent name and default `mailto:` recipients.
3. RTL component tests (unit tests for pure functions stay).
4. Transcript editing (editing the final message stays).
5. `source` (observed/reported) and `owner` fields, and splitting observations into areas.

Core that is never cut: recording → transcription → message with "done / to take over / not checked" → sharing, plus unit tests for response parsing.

## Out of scope (deliberately)
- Server-side sending (email, SMS, WhatsApp API).
- User accounts, sync, visit history, and trend charts.
- A recipient list managed in the app.
- Reading the message aloud (TTS), multi-turn conversation.
- Choosing the AI provider or models in the UI.
- Any assessment of health status or urgency.

## Test data
- `fixtures/audio/` — 3 sample voice notes recorded before the session (short; rambling with digressions; containing something worrying). May be git-ignored if the repository is public.
- `fixtures/transcripts/` — their transcripts, used for checking the prompt and as inputs for unit tests.
