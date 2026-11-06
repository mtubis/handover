# CLAUDE.md

## Handover — One voice note. Everyone up to date.

Handover is a PWA for people who share someone's care: family members, friends, paid caregivers (the original and most common case: adult siblings caring for an aging parent). After a visit, the caregiver records a short voice note, and the app turns it into a structured message for the others involved (how the person is doing, what was done, what the next person should take over) that can be shared with a single tap. In code the cared-for person is the "person" (`personLabel`).

Scope details: `SPEC.md`. Rationale behind decisions: `DECISIONS.md`. Read both before any significant change.

## Working context
- Deliver in small, verified steps: one working slice → verification → commit. Keep the end-to-end flow working on a phone after every step.
- If something turns out much bigger than expected, stop and ask instead of expanding the scope.
- Current work: the first public release (1.0.0). Its steps were tracked as GitHub issues (milestone "1.0.0"); check the open issues when resuming work.
- Branches: `main` is the original version and stays frozen until the release is approved. Each step is a feature branch from `release`, merged back into `release`; `release` is merged into `main` at the end.
- The repository is public and may serve as a code sample. Keep code, commits, and docs clean and readable.

## Stack
- Vite + React + TypeScript (strict), PWA, **no backend**.
- AI calls made directly from the browser with plain `fetch` (no SDK), using an API key entered by the user (`localStorage`).
- AI provider: Groq, OpenAI-compatible API at `https://api.groq.com/openai/v1/`. Browser access (CORS) verified with a standalone test page — see `spikes/groq-browser-test.html`.
  - Transcription: `whisper-large-v3-turbo` (`POST audio/transcriptions`, multipart, `language` = the UI language as an ISO-639-1 code).
  - Structuring: `openai/gpt-oss-120b` (`POST chat/completions`).
  - Model IDs live in one config module, not scattered across the code.
- Provider code sits behind a thin layer (`src/ai/`) so it can be swapped.
- Tests: Vitest + React Testing Library (`@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`), jsdom environment.
- Deploy: Vercel, auto-deploy from GitHub. **Phone testing happens on the Vercel deployment** (HTTPS is required for microphone and Web Share; the WSL dev server is not reachable from the phone).

## Hard constraints
- **No server and no history of notes.** Data stays on the device except for the AI API call itself. Do not add a backend, database, or analytics. The only stored note is a single unfinished draft (`src/lib/draft.ts`, audio in IndexedDB via `src/lib/draftAudio.ts`), kept on the device until the user starts a new note, deletes it, or 24 hours pass; the audio is deleted as soon as it is transcribed.
- **The app does not diagnose anything.** The LLM organizes what the caregiver said. It must not add medical interpretations, recommendations, urgency assessments, people, or dates that were not in the note.
- The human has the final say: the transcript and the message are editable before sending.
- The UI is multilingual (English, Polish, German): no user-facing string is hard-coded in one language. Code, identifiers, comments, and docs in English. The product name "Handover" is never translated.
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
- `spikes/` — throwaway experiments done before implementation, kept for transparency. Not part of the app.

## Testing (current scope — see `SPEC.md`)
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
- Do not chase test coverage for its own sake at the expense of the end-to-end flow.
- Do not guess provider API parameters. If you are not sure whether a parameter is supported for a given model, say so and check.
