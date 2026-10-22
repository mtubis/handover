# DECISIONS — Handover

> **One voice note. Everyone up to date.**

Why this and not something else. Decisions made before implementation started, during problem selection and planning. Further decisions are appended during the work.

## 1. Problem choice: a handover after visiting an elderly parent

**Why this problem**
- Real and common: care for a parent is shared among siblings, and information gets lost between visits.
- Voice is justified here: the note is made on the way back from a visit, when typing is inconvenient and talking is easy.
- **Value from the very first use** — a single note immediately produces a ready message for siblings. No need to wait weeks for data, as with diaries.
- AI does more than transcription: it turns a rambling monologue into a handover — what was observed, what was done, **what the next person takes over**, and what was not checked. That is what separates the app from "Whisper + summary".
- Low medical risk: the app organizes a layperson's observations; it does not assess health.
- A linear flow, realistic to finish in 2 h.

**Name:** "Handover" borrows from the shift handover practiced by nurses and doctors — a structured transfer of what the next person needs to know. Families caring for a parent do the same thing, just informally and without a tool.

## 2. Considered and rejected

| Idea | Why rejected |
|---|---|
| **Voice triage** | Urgency assessment by an LLM carries a risk of hallucinations with real consequences. Doing it responsibly requires clinical validation — not feasible in 2 h. |
| **Medication reminders** | Mostly infrastructure (schedules, background notifications). Voice and AI would be add-ons rather than the core. |
| **Navigating lab results** | Requires document parsing, and interpreting results gets close to medical advice. Results are easier to read than to listen to. |
| **Pre-teleconsultation intake** | A good idea, but in 2 h it would at best be an early version of a multi-turn conversation. |
| **Symptom diary / caregiver diary** | Value only appears after many entries — a demo would have to fake it with sample data. This idea evolved into Handover: an immediate message instead of a history. |
| **Voice Q&A over a medication leaflet** | The most original candidate (photos of the leaflet → vision model → answer with a quote; no OCR/RAG needed since a leaflet fits in the context window). Rejected due to higher technical risk (photo quality of small print) and proximity to medical advice. A good candidate for a next step. |
| **"Did I already take my pill?" for seniors** | A real problem, but STT errors on elderly speech translate directly into dosing risk. |
| **Voice "help" button** | An emergency system that sometimes fails is worse than none — it creates a false sense of safety. Not for a prototype. |
| **Gym workout log** | The strongest case for voice (hands busy), but further from health in the caregiving sense. |

## 3. Delivery channel: Web Share API + `mailto:`, no server-side sending

- **Families already have their channels** (most often a WhatsApp group). The app should not force a new one — Web Share lets the user pick any of them.
- Zero backend, zero providers, trivial testing.
- Considered and rejected:
  - **Server-side email (Resend, SendGrid, Mailgun):** free tiers usually require domain verification to send to arbitrary addresses; adds a backend and spam-filter risk.
  - **SMS (Twilio):** trial accounts only send to verified numbers; beyond that it costs money.
  - **WhatsApp Business API:** Meta setup and message templates — disproportionate for a prototype.
- Cost of this decision: the user has to tap "send" and choose recipients themselves. Acceptable.

## 4. Architecture: PWA without a backend

- Notes about a parent's health are sensitive data. **No server = no storage** — data does not leave the device except for the AI API call. This is a product decision (privacy, GDPR), not just a time shortcut.
- PWA instead of a native app: the caregiver does not need to install anything from an app store; recording (MediaRecorder) and Web Share work in mobile Chrome and Safari over HTTPS.
- A deliberate choice despite the author's backend background (PHP/Symfony, Python): a backend would add nothing here and would increase the risk surface.
- **Known limitation:** the API key is stored in `localStorage` and used from the browser. This matches the brief's requirement (users bring their own keys); in production, calls would go through a backend with a server-side key.

## 5. AI provider: Groq — verified before the session

- One key covers transcription and the LLM for structuring — less configuration for both the user and the reviewer. Free tier, low latency.
- **Verified with a standalone test page** (`spikes/groq-browser-test.html`, plain `fetch`, no SDK, served from `http://localhost:8000` via `python3 -m http.server`):
  - `GET /models`, `POST /chat/completions` and `POST /audio/transcriptions` all work directly from the browser — **no proxy needed**.
  - Transcription: `whisper-large-v3-turbo` produced an accurate Polish transcript of a test recording.
  - Structuring: `openai/gpt-oss-120b` organized a test note correctly. The initially assumed `llama-3.3-70b-versatile` was not available on the account's model list — a reminder not to hard-code model IDs from memory.
- Plain `fetch` instead of an SDK: Groq's API is OpenAI-compatible, two endpoints do not justify a dependency.
- Integration sits behind a thin `src/ai/` layer; model IDs live in one config module so they can be swapped (e.g. for OpenAI).
- To confirm during implementation: support for JSON output mode and reasoning-effort settings for `gpt-oss-120b` on Groq. The response is validated by a type guard regardless.

## 6. Content safety and handover structure

- The LLM organizes only what was said in the note; missing information = an empty field. No invented people or dates.
- **Negations are preserved** and surfaced as "not checked". In a handover, "I didn't check the meds" is as important as what was done — losing a negation would create a false sense that something was handled.
- **The parent's own account is distinguished from the caregiver's observation** ("mom said she slept badly" vs "she was limping").
- No diagnoses, recommendations, or urgency assessments. "Worth noting" contains only what the caregiver themselves described as worrying.
- The human approves: the transcript and the message are editable before sending.

These rules came out of testing the prompt before the session: a simple test note ("I didn't check the meds; Ania will call the clinic tomorrow") showed that the useful output is a handover structure (observed / done / to take over / not checked), not a summary.

## 7. Testing: Vitest + React Testing Library, limited scope in v1

- **Vitest instead of Jest:** native to Vite (no separate Babel/TS transform config), with a Jest-compatible API. React Testing Library works identically with both, so the tests and patterns carry over directly to Jest-based projects.
- **React Testing Library:** tests what the user sees and does (roles, accessible names, `userEvent`) rather than implementation details.
- **Limited scope in v1:** in 2 h, testing competes with the end-to-end flow. v1 covers the logic most likely to break silently (parsing the LLM response, formatting the message, building `mailto:`) plus 1–2 component tests of the critical UI behavior. The fuller test suite (user-flow tests, MSW, accessibility checks, prompt evaluation, E2E) is planned for the next version — see `SPEC.md`.
- Not tested in v1: `MediaRecorder` and real AI calls. These are browser and network boundaries, verified manually on a phone.

## 8. Preparation before the clock started (for transparency)

Done outside the 2 h limit:
- problem selection and the decisions above,
- GitHub repository, Vercel account linked to it, Groq API key,
- the Groq browser test (`spikes/groq-browser-test.html`) and model selection,
- three sample voice notes and their transcripts (`fixtures/`),
- checking Claude Code session export.

All application code was written during the session.

---

## Decisions during implementation
<!-- Append here as you go: what, why, what was rejected. -->
