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

- Notes about a parent's health are sensitive data. **No server = no storage** — data does not leave the device except for the AI API call. This is a product decision (privacy, GDPR). Relaxed later for a single on-device draft (decision 18).
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
- **Tone:** the UI addresses the user informally in every language (Polish "ty", German "du"):
  the app is used between family members, and the Polish UI already did so.

### 13. Note and message language follow the UI language
- One language setting drives the UI, the Whisper `language` hint and the language of the generated
  message. The common case is a family that talks and writes in one language; a separate "message
  language" setting can be added later without changing the structure.
- The Groq docs describe `language` as optional, in ISO-639-1 format, improving accuracy and
  latency. The app's locale codes are ISO-639-1 codes, so they are passed as they are.
- The prompt itself stays in English; only the output language is a parameter
  (`buildSystemPrompt(language)`). Its rules (negations, reported vs observed, owners) are
  language-independent, so the same prompt is reviewed once for all languages.
- Headings, area labels and the title template of the message live in the UI dictionaries
  (`handover` section), so each language controls its own grammar ("wizyta u mamy" with the Polish
  genitive, "visit to Mom"). The parent label is still used verbatim; left empty, a default for the
  current language is used, so switching the language does not leave a Polish "mamy" in an English
  message.
- The date is spelled out (`Intl.DateTimeFormat`, day + long month): "10/21" means different things
  to American and British readers.

### 14. Welcome screen on the first visit
- Shown once, before the settings: a first-time visitor otherwise lands on a form asking for an API
  key with no idea what the app does. A flag in `localStorage` remembers that it was seen; someone
  who already has a key saved (an existing user) never gets it unasked. "How it works" in the
  header reopens it.
- The language picker is on the welcome screen too: a visitor whose browser language is not the
  one they read should be able to switch before reading the rest.
- The privacy line says only what holds for the whole app: no account, no Handover server, the note
  goes straight to Groq to be processed. It does not claim that nothing is ever stored or that
  there is "no risk": the key and (later) a draft live on the device, and Groq processes the note.

### 15. Audience: anyone sharing someone's care, not only siblings
- The app was designed around adult siblings caring for an aging parent, and that is still the
  most common case. The same handover is useful to grandchildren, partners, friends helping someone
  recover, or paid caregivers, so the UI, the welcome copy and the prompt no longer assume siblings
  or a parent ("message to share", "default email recipients", "the person they help care for").
- The prompt names the parent as the typical case but not the only one; its rules are unchanged
  (`PROMPT_VERSION` 3).
- In code the cared-for person is the "person": `parentLabel` became `personLabel`. Settings saved
  under the old name are still read, so existing users keep their label.
- Defaults stay with the common case ("mamy", "Mom", "Mama"); the hint adds a non-family example.

### 16. API key help and the privacy section
- The help is a native modal `<dialog>` (`showModal()`): focus handling, Escape to close and an
  inert background come from the browser, with no dialog library. It is closed with a button
  rather than `<form method="dialog">`, because it can sit inside the settings form, and nested
  forms are invalid HTML. jsdom has no `showModal()`, so the test setup adds a minimal shim.
- Every factual sentence was checked in the Groq docs before it was written (2026-11-03): where
  keys are created, that a Free tier exists with rate limits, and that a payment method is only
  needed to upgrade. The docs do not say that sign-up needs no card, so the app does not claim it.
- The privacy section says what is true, not what sounds reassuring: no Handover server, the note
  goes straight to Groq, Groq's own retention (none by default, logs for up to 30 days) and storage
  location (USA), and that the key is readable by anyone using this browser. Groq's page is linked
  (in English only) so users can check it themselves.
- Provider URLs live in `AI_CONFIG`, next to the model IDs, so a provider swap touches one module.

### 17. Recovering from a failed transcription
- The most common failures (rate limit, network, timeout) are temporary, and before this change
  each one cost the recording: the app went back to the record step. Now the recording is kept in
  memory and "Try again" sends the same audio; "Record a new note" discards it. A failed
  structuring already returned to the editable transcript, so it needed no change.
- A `beforeunload` warning covers the moments when a reload would lose work that cannot be
  rebuilt: while recording, while waiting for the AI, and while a recording is not transcribed
  yet. It is deliberately not active on the transcript and message screens, where it would fire
  after almost every use; those are covered by the on-device draft (decision 18).
- Browsers show their own text in that prompt and mobile browsers often skip it, so it is a
  safety net on desktop rather than a guarantee.
- In the component test the recorder is replaced by a button that returns a blob: `MediaRecorder`
  is a browser boundary and is mocked there rather than emulated.

### 18. On-device draft instead of "nothing is stored"
- On a phone a note gets lost easily: the browser reloads a backgrounded tab, the screen is
  pulled down, the PWA is closed. The `beforeunload` prompt (decision 17) does not help there.
  So the note in progress is kept on the device: the step, transcript, message and subject in
  `localStorage`, the recording in IndexedDB (`localStorage` holds strings only and is too small).
- This relaxes "no storage" from decision 3 on purpose, within limits: one draft, not a history;
  on the device only; deleted on "New note", "Record again", "Delete draft", or after 24 hours
  without changes. The audio is deleted as soon as it is transcribed, since the transcript is
  what the rest of the flow needs. The in-app privacy text says this.
- A reload during an AI call never restores a spinner that would wait forever: an interrupted
  transcription lands on "recording kept, try again", an interrupted structuring on the editable
  note. A recording interrupted mid-capture is not recovered: chunking audio into storage while
  recording would be much more code for a rare case.
- The visit date is not stored separately: it is already part of the subject and the message,
  which are restored as they were (including the user's edits).
- IndexedDB is wrapped in about 60 lines of plain API code instead of a library. Every call
  swallows errors, so without IndexedDB (some private modes, jsdom) the app works as before and
  only the recording is not restored. In component tests the module is mocked at that boundary.

