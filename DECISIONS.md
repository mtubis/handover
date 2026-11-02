# DECISIONS — Handover

> **One voice note. Everyone up to date.**

Why the app is built the way it is: the main product and technical decisions, with the alternatives that were considered. The first part was settled before implementation; later decisions are appended as the work goes on.

## 1. The problem: a handover after visiting an elderly parent

**Why this problem**
- Real and common: care for a parent is shared among siblings, and information gets lost between visits.
- Voice is justified here: the note is made on the way back from a visit, when typing is inconvenient and talking is easy.
- **Value from the very first use** — a single note immediately produces a ready message for siblings. No need to collect weeks of data first, as a diary would.
- AI does more than transcription: it turns a rambling monologue into a handover — what was observed, what was done, **what the next person takes over**, and what was not checked. That is what separates the app from "Whisper + summary".
- Low medical risk: the app organizes a layperson's observations; it does not assess health.

**Name:** "Handover" borrows from the shift handover practiced by nurses and doctors — a structured transfer of what the next person needs to know. Families caring for a parent do the same thing, just informally and without a tool.

## 2. Delivery channel: Web Share API + `mailto:`, no server-side sending

- **Families already have their channels** (most often a WhatsApp group). The app should not force a new one — Web Share lets the user pick any of them.
- Zero backend, zero providers, trivial testing.
- Considered and rejected:
  - **Server-side email (Resend, SendGrid, Mailgun):** free tiers usually require domain verification to send to arbitrary addresses; adds a backend and spam-filter risk.
  - **SMS (Twilio):** trial accounts only send to verified numbers; beyond that it costs money.
  - **WhatsApp Business API:** Meta setup and message templates — disproportionate for an app without a backend.
- Cost of this decision: the user has to tap "send" and choose recipients themselves. Acceptable.

## 3. Architecture: PWA without a backend

- Notes about a parent's health are sensitive data. **No server = no storage** — data does not leave the device except for the AI API call. This is a product decision (privacy, GDPR).
- PWA instead of a native app: the caregiver does not need to install anything from an app store; recording (MediaRecorder) and Web Share work in mobile Chrome and Safari over HTTPS.
- A deliberate choice despite the author's backend background (PHP/Symfony, Python): a backend would add nothing here and would increase the risk surface.
- **Known limitation:** the API key is stored in `localStorage` and used from the browser. Users bring their own keys, so no shared key and no user data ever sit on a server; a version with shared access would call the AI through a backend with a server-side key.

## 4. AI provider: Groq — verified before implementation

- One key covers transcription and the LLM for structuring — less configuration for the user. Free tier, low latency.
- **Verified with a standalone test page** (`spikes/groq-browser-test.html`, plain `fetch`, no SDK, served from `http://localhost:8000` via `python3 -m http.server`):
  - `GET /models`, `POST /chat/completions` and `POST /audio/transcriptions` all work directly from the browser — **no proxy needed**.
  - Transcription: `whisper-large-v3-turbo` produced an accurate Polish transcript of a test recording.
  - Structuring: `openai/gpt-oss-120b` organized a test note correctly. The initially assumed `llama-3.3-70b-versatile` was not available on the account's model list — a reminder not to hard-code model IDs from memory.
- Plain `fetch` instead of an SDK: Groq's API is OpenAI-compatible, two endpoints do not justify a dependency.
- Integration sits behind a thin `src/ai/` layer; model IDs live in one config module so they can be swapped (e.g. for OpenAI).
- JSON output mode and reasoning-effort settings for `gpt-oss-120b` were confirmed during implementation (see "Structuring call" below). The response is validated by a type guard regardless.

## 5. Content safety and handover structure

- The LLM organizes only what was said in the note; missing information = an empty field. No invented people or dates.
- **Negations are preserved** and surfaced as "not checked". In a handover, "I didn't check the meds" is as important as what was done — losing a negation would create a false sense that something was handled.
- **The parent's own account is distinguished from the caregiver's observation** ("mom said she slept badly" vs "she was limping").
- No diagnoses, recommendations, or urgency assessments. "Worth noting" contains only what the caregiver themselves described as worrying.
- The human approves: the transcript and the message are editable before sending.

These rules came out of testing the prompt before implementation: a simple test note ("I didn't check the meds; Ania will call the clinic tomorrow") showed that the useful output is a handover structure (observed / done / to take over / not checked), not a summary.

## 6. Testing: Vitest + React Testing Library, focused scope

- **Vitest instead of Jest:** native to Vite (no separate Babel/TS transform config), with a Jest-compatible API. React Testing Library works identically with both, so the tests and patterns carry over directly to Jest-based projects.
- **React Testing Library:** tests what the user sees and does (roles, accessible names, `userEvent`) rather than implementation details.
- **Focused scope:** tests cover the logic most likely to break silently (parsing the LLM response, formatting the message, building `mailto:`) plus component tests of the critical UI behavior, rather than chasing coverage. The fuller test suite (user-flow tests, MSW, accessibility checks, prompt evaluation, E2E) is planned next — see `SPEC.md`.
- Not tested automatically: `MediaRecorder` and real AI calls. These are browser and network boundaries, verified manually on a phone.

---

## Decisions during implementation
<!-- Append here as you go: what, why, what was rejected. -->

### 7. Tooling: the template's oxlint, npm 11 for installs
- `create-vite` 9 ships **oxlint** instead of ESLint in the `react-ts` template. Kept it: `npm run lint`
  works with no extra dependencies. The template's tsconfig had no `"strict": true`, so it was added.
- npm 10.8.2 crashed while resolving peer dependencies (`Cannot read properties of null (reading
  'edgesOut')`, a known arborist bug). Dependencies were installed once with `npx npm@11`, with no global
  install. The lockfile is standard and builds on Vercel.

### 8. Structuring call: strict JSON schema on `gpt-oss-120b`
- Checked in the Groq docs before writing the call, then confirmed with a real request:
  `response_format: json_schema` with `strict: true` works for `openai/gpt-oss-120b`. Strict mode
  requires every property in `required` and `additionalProperties: false`; `owner` is `["string", "null"]`.
- `reasoning_effort: "low"` for latency. `reasoning_format` is not supported for gpt-oss on Groq, so
  `include_reasoning: false` is used instead.
- The docs don't say whether reasoning tokens count towards `max_completion_tokens`, so the limit is
  generous (2000). `finish_reason: "length"` is shown as a readable error.
- The type guard (`src/ai/handover.ts`) validates the response anyway. If strict mode had been
  rejected, the fallback was `json_object`.

### 9. Recording: file name from the recorder's actual MIME type
- Chrome records WebM/Opus and Safari records MP4. Whisper detects the format from the file
  extension, so the name comes from `recorder.mimeType` after recording, not from the requested type.
- `MediaRecorder.start()` is called without a timeslice, which yields a single, complete file.

### 10. UX choices within the spec
- **Parent label entered in the genitive** ("mamy", "taty") and used verbatim in "wizyta u …" and
  "Co u …". No declension logic, which could easily get Polish grammar wrong.
- **Structuring starts on an explicit button** after the transcript has been read and corrected, so
  the human approves the input as well as the output.
- **"Wolę napisać notatkę"**: typing instead of recording. A fallback when speaking isn't possible,
  and the way prompt changes were checked against `fixtures/transcripts/`.
- **Default e-mail recipients**: one optional text field, inserted into the `mailto:` link. It is not
  a recipient list managed in the app, which is out of scope.
- **"Wyślij e-mailem" is always shown, not only as a fallback** (a change from `SPEC.md`). Testing on
  Android showed that with Web Share available, the e-mail option and the default recipients were
  unreachable. Web Share stays the primary action when the browser supports it.
- **Web Share sends only the text.** The title is already the first line, and some apps would show
  `title` and `text` twice.

### 11. Known prompt limitation (accepted for now)
- With the third fixture ("czwartek o 10, a nie, przepraszam o 11"), the model put the visit time
  under "Nie sprawdzono" instead of using the corrected 11, despite a prompt rule about
  self-corrections. Negations, owners and the observed/reported split were correct for all three
  fixtures. Accepted because the message is editable; it is the first case for the planned prompt
  evaluation set.

### 12. Internationalization: in-house typed dictionaries
- The UI is translated through plain TypeScript objects (`src/i18n/`), one per language, each
  checked against a shared `Messages` interface with `satisfies`. A missing or misspelled key is a
  compile error, not a blank label at runtime.
- Strings that take values are functions (`noteHeading: (parentLabel) => ...`), so each language
  can place the value where its grammar needs it and the arguments are type-checked. No
  interpolation syntax to parse.
- Rejected: `i18next` / `react-i18next` and `FormatJS`. With three languages, a few dozen strings
  and no plurals, they add dependencies and runtime lookups by string key without solving a
  problem the type system doesn't already solve.
- Errors carry a code (`AppError`) instead of a ready sentence; the text is chosen when the error
  is shown, so it follows the language the user has selected at that moment.
- **Choosing the language:** the first browser language with a translation wins, matched by base
  language (`de-AT` → `de`), so regional variants need no dictionaries of their own; otherwise
  English. A choice made in Settings is stored separately from the API key settings and applies
  immediately, without "Save" — on the first visit the settings form is the first screen, and it
  should be readable before it is filled in. Language names are shown in their own language.
- The PWA manifest is shared by all languages, so it uses English.
