# PLAN — first public release of Handover

Working plan for turning the current app into a version ready to publish. Read this first when
resuming work; update the checkboxes as steps are merged.

## Branch workflow

- `main` stays **frozen**: it is the original, working version and must remain available as it is
  until the release is approved. No commits, no merges.
- `release` is the integration branch for this plan, developed in the open next to `main`.
- Each step below is developed on its own feature branch created from `release`
  (e.g. `docs/cleanup`, `feat/i18n-core`) and merged back into `release`.
- When the release is approved, `release` is merged into `main` in one go.
- Each step is tracked as a GitHub issue in the "1.0.0" milestone; the issue number is next to the
  step heading.

## Product decisions for this release

- UI language: English, Polish and German. The initial language is resolved from the browser
  (`navigator.languages`, matched by base language, e.g. `de-AT` → `de`), falling back to English.
  A choice made in settings takes precedence and is persisted.
- The language of the note (Whisper hint) and of the generated message follows the app language.
  A separate "message language" setting is a possible later step.
- i18n is implemented in-house (typed dictionaries + React context), no new dependency.
- Privacy wording must stay accurate: the app has no server and stores nothing on our side, but the
  audio and transcript are sent to Groq for processing, and the key lives in `localStorage`.
  Never claim "no risk of data leaks".
- A single draft (step, transcript, message, visit date, audio) may be kept **on the device only**,
  with automatic expiry and an explicit "delete draft" action. This is not visit history.

## Steps

### 0. Documentation cleanup — `docs/cleanup` (#1)
- [x] `CLAUDE.md`: replace the "Working context" section (time-boxed exercise, ~2 h limit) with
      "deliver in small, verified steps", the branch workflow and a pointer to this plan; the
      "UI in Polish" rule now requires a multilingual UI. The "no persistent storage" constraint and
      `language=pl` still describe the current code and change in steps 8 and 3.
- [x] `SPEC.md`: remove the time plan and the cut order; "v1 (within the 2 h limit)" is now the
      current testing scope and "Later" is "Next".
- [x] `DECISIONS.md`: remove "Considered and rejected" and "Preparation before the clock started";
      rephrase rationales that relied on the time limit or the brief; renumber sections.
- [x] `README.md`: "The UI is in Polish" now says EN/DE are in progress; drop "prototype" wording.
- [x] Check `spikes/` and remaining docs for time-limit / session wording.
- [x] Untracked files: the session log was moved out of the repo; `ONBOARDING.md` is an internal
      file, kept untracked (ignored locally via `.git/info/exclude`).

### 1. i18n infrastructure, no behaviour change — `feat/i18n-core` (#2)
- [x] A language-neutral `Messages` interface (`src/i18n/messages.ts`); each dictionary is typed
      with `satisfies Messages`, so a missing key fails the typecheck. Strings with values are
      functions. React context + `useT()` hook. `en.ts` and `de.ts` come in steps 2 and 4.
- [x] Move all Polish UI strings to `pl.ts`. `UserFacingError` is replaced by `AppError(code)`;
      `describeError` translates codes at render time and the app keeps the error cause, not text.
- [x] Existing tests still pass; the app looks exactly the same. Message content
      (`formatMessage`, prompt) stays Polish until step 3.

### 2. Locale detection, language picker, English — `feat/i18n-locale` (#3)
- [x] Pure `resolveLocale(languages)` with unit tests; `loadLocale` / `saveLocale` (own storage key).
- [x] Language selector in settings, applied immediately and persisted; `<html lang>` kept in sync.
      `index.html` and the PWA manifest default to English.
- [x] `en.ts` translation; RTL tests for detection, fallback and switching.

### 3. Note and message language — `feat/i18n-message` (#4)
- [x] Whisper language from the UI locale instead of `AI_CONFIG.transcriptionLanguage: 'pl'`
      (Groq docs: optional, ISO-639-1; verified for Polish only so far).
- [x] Prompt output language parameterised (`buildSystemPrompt(language)`); `PROMPT_VERSION` = 2.
- [x] `formatMessage` localised: headings, "reported by" label, spelled-out date via
      `Intl.DateTimeFormat`, per-language title template; empty parent label → per-language default.
- [x] EN and DE fixtures in `fixtures/transcripts/`.
- [x] Manual check with a real key (by the user): EN fixtures as typed notes (negations,
      observed/reported, owners) and one English voice note — as expected. DE in step 4.

### 4. German — `feat/i18n-de` (#5)
- [x] `de.ts` (informal "du", like the Polish UI) and German message formatting; `de` registered
      for locale detection and the prompt.
- [x] Manual check with a real key (by the user): DE fixtures as typed notes and one German
      voice note. — as expected.
- [x] German wording reviewed by the author (fluent, not native); two strings simplified.

### 5. Welcome screen — `feat/onboarding` (#6)
- [x] First-visit screen: what Handover is, three steps (record → review → share), "does not
      diagnose", the Groq key requirement, a short privacy line and the language picker; button
      leading to settings. Flag in `localStorage`; skipped for users who already have a key.
- [x] "How it works" link in the header to reopen it.
- [x] Welcome copy rewritten by the author for a broader audience (family members, friends,
      paid caregivers), with headings for the requirement and the privacy note.
- [x] Step 6: the welcome screen opens the key help ("How do I get a Groq API key?").

### 5a. Broader audience — `feat/broader-audience` (#11)
- [x] UI strings: "message to share", "default email recipients"; person label hint with a
      non-family example.
- [x] Prompt: "the person they help care for" / "others involved in the care"; `PROMPT_VERSION` 3.
- [x] Rename `parentLabel` → `personLabel`, reading the old stored key.
- [x] English: "email" instead of "e-mail".
- [x] Docs: README (general audience + the original sibling story), CLAUDE.md, SPEC, DECISIONS.
- [x] Manual check with a real key (by the user): fixtures in all three languages after the
      prompt change. — as expected.

### 6. API key help and privacy — `feat/settings-help` (#7)
- [x] "?" next to the API key field (and a link on the welcome screen) opens a native `<dialog>`
      (`showModal()`): how to create a Groq account and key, link to the console, free plan limits,
      keeping the key safe. Verified in the Groq docs on 2026-11-03: keys at
      `console.groq.com/keys`; a Free tier exists with rate limits, a payment method is needed only
      to upgrade (no claim about sign-up without a card).
- [x] "Privacy" section in settings, with Groq's retention (none by default, logs up to 30 days,
      opt-out in Data Controls) and storage location (USA) from "Your Data in GroqCloud", and a
      link to that page.

### 7. Resilience without persistence — `feat/retry` (#8)
- [x] Keep the recording in memory when transcription fails; offer "Try again" (same audio) or
      "Record a new note". A failed structuring already kept the transcript.
- [x] `beforeunload` warning while recording, waiting for the AI, or holding an untranscribed
      recording. Mobile browsers often skip the prompt; step 8 is the real protection.

### 8. On-device draft — `feat/draft` (#9)
- [ ] Persist step, transcript, message and visit date in `localStorage`; audio blob in IndexedDB
      (no dependency).
- [ ] After a reload during an API call, restore to "recording ready, try again".
      A recording interrupted mid-capture is not recovered.
- [ ] Delete the draft on "New note", via "Delete draft", and after a TTL (e.g. 24 h).
- [ ] Update `CLAUDE.md`, `SPEC.md`, `README.md` and the in-app privacy text accordingly;
      add a decision to `DECISIONS.md`.

### 9. Release preparation — `docs/release` (#10)
- [ ] README for a public audience: live link, screenshots/GIF, "what I'd do next".
- [ ] License, version `1.0.0`, "not a medical device" disclaimer.
- [ ] Manual test on Android and iOS in all three languages.
- [ ] Decide whether this `PLAN.md` stays in the repo or is removed before merging into `main`.

## Open questions

- Demo mode without an API key (sample transcript and message from fixtures, no API calls) in this
  release?
- License (MIT or none)?
