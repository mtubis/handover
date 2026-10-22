# CLAUDE.md

## Handover — One voice note. Everyone up to date.

Handover is a PWA for families sharing the care of an elderly parent. After a visit, the caregiver records a short voice note, and the app turns it into a structured message for their siblings (how the parent is doing, what was done, what the next person should take over) that can be shared with a single tap.

Scope details: `SPEC.md`. Rationale behind decisions: `DECISIONS.md`. Read both before any significant change.

## Working context
- Recruitment task with a hard limit of ~2 h. Priority: **one flow working end-to-end on a phone**, not completeness.
- If something takes longer than expected, stop and ask instead of expanding. The cut order is defined in `SPEC.md`.
- Work in small steps: one working slice → verification → commit.
- The repository is public and may serve as a code sample. Keep code, commits, and docs clean and readable.

## Stack
- Vite + React + TypeScript (strict), PWA, **no backend**.
- AI calls made directly from the browser with plain `fetch` (no SDK), using an API key entered by the user (`localStorage`).
- AI provider: Groq, OpenAI-compatible API at `https://api.groq.com/openai/v1/`. Browser access (CORS) verified before the session — see `spikes/groq-browser-test.html`.
  - Transcription: `whisper-large-v3-turbo` (`POST audio/transcriptions`, multipart, `language=pl`).
  - Structuring: `openai/gpt-oss-120b` (`POST chat/completions`).
  - Model IDs live in one config module, not scattered across the code.
- Provider code sits behind a thin layer (`src/ai/`) so it can be swapped.
- Tests: Vitest + React Testing Library (`@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`), jsdom environment.
- Deploy: Vercel, auto-deploy from GitHub. **Phone testing happens on the Vercel deployment** (HTTPS is required for microphone and Web Share; the WSL dev server is not reachable from the phone).

## Hard constraints
- **No server and no persistent storage of notes.** Data stays on the device except for the AI API call itself. Do not add a backend, database, or analytics.
- **The app does not diagnose anything.** The LLM organizes what the caregiver said. It must not add medical interpretations, recommendations, urgency assessments, people, or dates that were not in the note.
- The human has the final say: the transcript and the message are editable before sending.
- UI in Polish. Code, identifiers, comments, and docs in English. The product name "Handover" is never translated.
- **Do not add dependencies without asking.** Allowed by default: `vite-plugin-pwa` and the test libraries listed above. No UI libraries, no state managers, no router, no AI SDKs.
- API keys never in code, in the repo, in tests, or in logs. Do not print them to the console. **Never ask the user to paste a key into this session.**

## Conventions
- The LLM prompt lives in a separate file (`src/ai/prompts.ts`) and is versioned like code.
- The LLM response is JSON validated with a simple type-guard function (no extra library unless agreed). A parsing error → a readable message, not a blank screen.
- Pure functions (response parsing, message formatting, building the `mailto:` link) are separated from components.
- Small components, no unnecessary abstraction.

## Repository layout (non-code)
- `fixtures/transcripts/` — sample transcripts (text) used for prompt checks and unit tests.
- `fixtures/audio/` — sample voice notes for manual testing (may be git-ignored).
- `spikes/` — throwaway pre-session experiments, kept for transparency. Not part of the app.

## Testing (limited scope for v1 — see `SPEC.md`)
- Unit tests for pure functions in `src/lib/` and `src/ai/` (parsing, formatting, `mailto:`).
- A small number of React Testing Library tests for the critical UI path, with the AI layer mocked. Query by role and accessible name (`getByRole`), interact via `userEvent`, assert on what the user sees.
- Never call real AI APIs in tests. Do not try to test `MediaRecorder` itself; mock it at the boundary.
- Tests are written together with the step they cover, not at the end.

## Definition of done for each step
1. `npm run typecheck` and `npm run lint` pass.
2. `npm test` passes; new pure logic or critical UI comes with tests.
3. Briefly describe what was done and how to verify it manually.
4. Commit with a descriptive message (Conventional Commits, e.g. `feat: record voice note with MediaRecorder`).

## Don'ts
- Do not start several screens at once.
- Do not implement anything from the "Out of scope" section of `SPEC.md`, even if it seems quick.
- Do not chase test coverage beyond the v1 scope at the expense of the end-to-end flow.
- Do not guess provider API parameters. If you are not sure whether a parameter is supported for a given model, say so and check.
