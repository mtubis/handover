# Handover

> **One voice note. Everyone up to date.**

Handover is a PWA for people who share someone's care — family members, friends and caregivers.
After a visit, the caregiver records a short voice note and the app turns it into a structured message
for everyone else involved — how the person is doing, what was done, what the next person takes over
and what was not checked — ready to share with a single tap.

It started with adult siblings taking turns looking after an aging parent, where news from each visit
easily gets lost between them — still the case Handover is designed around first.

The UI is available in English, Polish and German: it follows the browser's language,
falls back to English, and can be changed in Settings. The note is transcribed and the message is
written in the same language. Scope: [`SPEC.md`](SPEC.md). Rationale: [`DECISIONS.md`](DECISIONS.md).

## How it works

0. **Welcome (first visit):** what the app is for and how to use it; reopened via "How it works".
1. **Settings (once):** the language, a Groq API key, how you refer to the person you care for (e.g. "Mom";
   left empty, a default for the language is used) and optional email recipients.
2. **Record** a voice note (or type it).
3. **Transcribe** with `whisper-large-v3-turbo` in the selected language; the transcript is editable.
4. **Prepare the message:** `openai/gpt-oss-120b` returns JSON (strict schema), which is validated and
   formatted into a handover message in the selected language; the message is editable.
5. **Share** via the Web Share API (WhatsApp, SMS, …) when available, or send it by email (a `mailto:`
   link with the default recipients from settings), or copy it to the clipboard.

## Privacy

- No backend, no database, no analytics. Notes, transcripts and messages exist only in the page's
  memory and disappear when it is closed.
- The only network traffic with note content is the call to the Groq API. According to
  [Groq's data policy](https://console.groq.com/docs/your-data), inference data is not retained by
  default, but may be logged for up to 30 days to troubleshoot errors or investigate abuse; Groq
  stores data in the USA. The in-app "Privacy" section in Settings says the same to users.
- The API key is stored in `localStorage` on the device. This fits the bring-your-own-key model;
  a version with shared access would call the AI through a backend with a server-side key.
- The app does not diagnose anything: the prompt forbids medical interpretation, recommendations,
  urgency assessment and invented people or dates.

## Running locally

Requires Node.js 20.19+.

```bash
npm install
npm run dev        # http://localhost:5173 — the microphone works on localhost
```

Phone testing needs HTTPS (microphone, Web Share), so it is done on the Vercel deployment, which
auto-deploys from `main`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check and production build (with the PWA service worker) |
| `npm run typecheck` | TypeScript (strict) |
| `npm run lint` | oxlint |
| `npm test` | Vitest + React Testing Library (jsdom) |

## Project layout

```
src/ai/          provider layer: config (model IDs), Groq calls, prompt + JSON schema, response type guard
src/i18n/        UI strings per language, typed against one Messages interface; useT() hook
src/lib/         pure functions: message formatting, mailto:, audio MIME helpers, error mapping, settings
src/components/  settings form, recorder (+ MediaRecorder hook), message preview, share actions
fixtures/        sample transcripts in PL/EN/DE (audio is git-ignored)
spikes/          Groq browser test done before implementation, not part of the app
```

## Tests

- Unit tests for pure logic: LLM response parsing, message formatting (empty sections omitted,
  owners, negations under "Nie sprawdzono"), `mailto:` encoding, audio file naming, error messages.
- React Testing Library tests with the AI layer mocked: settings, sharing the edited message,
  and the `mailto:` / copy fallback.
- Not covered automatically: `MediaRecorder`, real AI calls, cross-browser behavior — verified
  manually on phones. Planned next steps are listed in `SPEC.md` ("Later").

## Known limitations

- Self-corrections in speech are not always resolved: for "Thursday at 10, no, at 11" the model put
  the visit time under "Nie sprawdzono" instead of using 11. The message is editable before sending.
- Long notes may exceed the response limit; the user gets a readable error.
