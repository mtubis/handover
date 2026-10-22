# Handover

> **One voice note. Everyone up to date.**

Handover is a PWA for families sharing the care of an elderly parent. After a visit, the caregiver
records a short voice note and the app turns it into a structured message for their siblings — how the
parent is doing, what was done, what the next person takes over and what was not checked — ready to
share with a single tap.

The UI is in Polish. Scope: [`SPEC.md`](SPEC.md). Rationale: [`DECISIONS.md`](DECISIONS.md).

## How it works

1. **Settings (once):** a Groq API key, the parent label (e.g. "mamy") and optional e-mail recipients.
2. **Record** a voice note (or type it).
3. **Transcribe** with `whisper-large-v3-turbo` (Polish); the transcript is editable.
4. **Prepare the message:** `openai/gpt-oss-120b` returns JSON (strict schema), which is validated and
   formatted into a Polish handover message; the message is editable.
5. **Share** via the Web Share API (WhatsApp, SMS, …) when available, or send it by e-mail (a `mailto:`
   link with the default recipients from settings), or copy it to the clipboard.

## Privacy

- No backend, no database, no analytics. Notes, transcripts and messages exist only in the page's
  memory and disappear when it is closed.
- The only network traffic with note content is the call to the Groq API.
- The API key is stored in `localStorage` on the device. This fits a bring-your-own-key prototype;
  a production version would call the AI through a backend with a server-side key.
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
src/lib/         pure functions: message formatting, mailto:, audio MIME helpers, error messages, settings
src/components/  settings form, recorder (+ MediaRecorder hook), message preview, share actions
fixtures/        sample transcripts (audio is git-ignored)
spikes/          pre-session Groq browser test, not part of the app
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
