import { useEffect, useState } from 'react'
import { structure, transcribe } from './ai/groq'
import { DraftNotice } from './components/DraftNotice'
import { MessagePreview } from './components/MessagePreview'
import { Privacy } from './components/Privacy'
import { Recorder } from './components/Recorder'
import { SettingsForm } from './components/SettingsForm'
import { Welcome } from './components/Welcome'
import { ShareActions } from './components/ShareActions'
import type { Recording } from './components/useRecorder'
import { useWarnBeforeUnload } from './components/useWarnBeforeUnload'
import { I18nProvider, MESSAGES, loadLocale, saveLocale, type Locale } from './i18n'
import { clearDraft, loadDraft, saveDraft, type Draft, type DraftStep } from './lib/draft'
import { deleteDraftAudio, loadDraftAudio, saveDraftAudio } from './lib/draftAudio'
import { describeError } from './lib/errors'
import { formatMessage, formatTitle } from './lib/formatMessage'
import { hasSeenWelcome, markWelcomeSeen } from './lib/onboarding'
import { loadSettings, saveSettings, type Settings } from './lib/settings'

type Step = 'record' | 'transcribing' | 'transcribeFailed' | 'transcript' | 'structuring' | 'message'

// Kept as the cause, not as text, so the message follows the current UI language.
type ErrorState = { cause: unknown } | null

// Where a reload lands: an interrupted API call is shown as "recording kept, try again" or as the
// editable note again, never as a spinner that would wait forever.
function draftStepFor(step: Step, transcript: string): DraftStep | null {
  switch (step) {
    case 'transcribing':
    case 'transcribeFailed':
      return 'recording'
    case 'structuring':
      return 'transcript'
    case 'transcript':
      return transcript.trim() === '' ? null : 'transcript'
    case 'message':
      return 'message'
    case 'record':
      return null
  }
}

function initialStep(draft: Draft | null): Step {
  if (draft === null) return 'record'
  // The recording itself is loaded from IndexedDB after the first render.
  return draft.step === 'recording' ? 'transcribeFailed' : draft.step
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(loadLocale)
  const t = MESSAGES[locale]
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const personLabel = settings.personLabel || t.handover.defaultPersonLabel
  // Shown on the first visit only; someone who already has a key is not a first-time user.
  const [showWelcome, setShowWelcome] = useState(() => !hasSeenWelcome() && settings.apiKey === '')
  const [editingSettings, setEditingSettings] = useState(() => settings.apiKey === '')
  const [storageWarning, setStorageWarning] = useState(false)
  const [initialDraft] = useState(loadDraft)
  // While set, a notice says the note was restored and offers to delete it.
  const [restoredAt, setRestoredAt] = useState(initialDraft?.savedAt ?? null)
  const [step, setStep] = useState<Step>(() => initialStep(initialDraft))
  const [transcript, setTranscript] = useState(initialDraft?.transcript ?? '')
  const [message, setMessage] = useState(initialDraft?.message ?? '')
  const [subject, setSubject] = useState(initialDraft?.subject ?? '')
  const [error, setError] = useState<ErrorState>(null)
  // Kept after a failed transcription, so a network hiccup or a rate limit doesn't cost the note.
  const [pendingRecording, setPendingRecording] = useState<Recording | null>(null)

  useWarnBeforeUnload(
    step === 'transcribing' || step === 'transcribeFailed' || step === 'structuring',
  )

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  useEffect(() => {
    if (initialDraft?.step !== 'recording') {
      // Also removes a recording left behind by an expired or deleted draft.
      void deleteDraftAudio()
      return
    }
    let cancelled = false
    void loadDraftAudio().then((recording) => {
      if (cancelled) return
      if (recording) {
        setPendingRecording(recording)
      } else {
        setRestoredAt(null)
        setStep('record')
      }
    })
    return () => {
      cancelled = true
    }
  }, [initialDraft])

  useEffect(() => {
    const draftStep = draftStepFor(step, transcript)
    if (draftStep === null) clearDraft()
    else saveDraft({ step: draftStep, transcript, message, subject })
  }, [step, transcript, message, subject])

  function handleLocaleChange(next: Locale) {
    setStorageWarning(!saveLocale(next))
    setLocale(next)
  }

  function handleStart() {
    markWelcomeSeen()
    setShowWelcome(false)
  }

  function handleSave(next: Settings) {
    setStorageWarning(!saveSettings(next))
    setSettings(next)
    setEditingSettings(false)
  }

  function showError(cause: unknown) {
    setError({ cause })
  }

  async function transcribeRecording(recording: Recording) {
    setError(null)
    setRestoredAt(null)
    setStep('transcribing')
    void saveDraftAudio(recording)
    try {
      setTranscript(await transcribe(recording.blob, recording.fileName, locale, settings.apiKey))
      setPendingRecording(null)
      setStep('transcript')
      // The transcript is what the draft needs from now on; the audio is not kept longer than that.
      void deleteDraftAudio()
    } catch (cause) {
      showError(cause)
      setPendingRecording(recording)
      setStep('transcribeFailed')
    }
  }

  function discardRecording() {
    setError(null)
    setRestoredAt(null)
    setPendingRecording(null)
    void deleteDraftAudio()
    setStep('record')
  }

  async function handlePrepareMessage() {
    setError(null)
    setRestoredAt(null)
    setStep('structuring')
    try {
      const handover = await structure(transcript, personLabel, locale, settings.apiKey)
      const visitDate = new Date()
      setSubject(formatTitle(personLabel, visitDate, locale))
      setMessage(formatMessage(handover, personLabel, visitDate, locale))
      setStep('message')
    } catch (cause) {
      showError(cause)
      setStep('transcript')
    }
  }

  // Also "Delete draft": the draft is exactly the note in progress.
  function startOver() {
    setError(null)
    setRestoredAt(null)
    setPendingRecording(null)
    void deleteDraftAudio()
    setTranscript('')
    setMessage('')
    setSubject('')
    setStep('record')
  }

  return (
    <I18nProvider value={t}>
      <main className="app">
        <header className="app-header">
          <h1>Handover</h1>
          {!showWelcome && (
            <nav className="header-links">
              <button type="button" className="link" onClick={() => setShowWelcome(true)}>
                {t.app.howItWorksLink}
              </button>
              {!editingSettings && (
                <button type="button" className="link" onClick={() => setEditingSettings(true)}>
                  {t.app.settingsLink}
                </button>
              )}
            </nav>
          )}
        </header>
        <p className="tagline">{t.app.tagline}</p>

        {storageWarning && (
          <p role="alert" className="error">
            {t.app.storageWarning}
          </p>
        )}

        {showWelcome ? (
          <Welcome locale={locale} onLocaleChange={handleLocaleChange} onStart={handleStart} />
        ) : editingSettings ? (
          <>
            <SettingsForm
              initial={settings}
              locale={locale}
              onLocaleChange={handleLocaleChange}
              onSave={handleSave}
              onCancel={settings.apiKey ? () => setEditingSettings(false) : undefined}
            />
            <Privacy />
          </>
        ) : (
          <section className="card">
            <h2>{t.app.noteHeading(personLabel)}</h2>

            {restoredAt !== null && (
              <DraftNotice savedAt={restoredAt} locale={locale} onDelete={startOver} />
            )}

            {error && (
              <p role="alert" className="error">
                {describeError(error.cause, t.errors)}
              </p>
            )}

            {step === 'record' && (
              <>
                <Recorder onRecorded={transcribeRecording} onError={showError} />
                <button type="button" className="link" onClick={() => setStep('transcript')}>
                  {t.app.typeInstead}
                </button>
              </>
            )}

            {step === 'transcribing' && <p aria-live="polite">{t.app.transcribing}</p>}

            {step === 'transcribeFailed' && pendingRecording && (
              <>
                <p>{t.recorder.kept}</p>
                <div className="actions">
                  <button
                    type="button"
                    className="primary"
                    onClick={() => transcribeRecording(pendingRecording)}
                  >
                    {t.recorder.retry}
                  </button>
                  <button type="button" onClick={discardRecording}>
                    {t.recorder.discard}
                  </button>
                </div>
              </>
            )}

            {step === 'transcript' && (
              <>
                <label htmlFor="transcript">{t.transcript.label}</label>
                <textarea
                  id="transcript"
                  rows={8}
                  value={transcript}
                  onChange={(event) => setTranscript(event.target.value)}
                />
                <div className="actions">
                  <button
                    type="button"
                    className="primary"
                    onClick={handlePrepareMessage}
                    disabled={transcript.trim() === ''}
                  >
                    {t.transcript.prepareMessage}
                  </button>
                  <button type="button" onClick={startOver}>
                    {t.transcript.recordAgain}
                  </button>
                </div>
              </>
            )}

            {step === 'structuring' && <p aria-live="polite">{t.app.structuring}</p>}

            {step === 'message' && (
              <>
                <MessagePreview message={message} onChange={setMessage} />
                <ShareActions
                  subject={subject}
                  message={message}
                  recipients={settings.recipients}
                />
                <div className="actions">
                  <button type="button" onClick={() => setStep('transcript')}>
                    {t.message.backToNote}
                  </button>
                  <button type="button" onClick={startOver}>
                    {t.message.newNote}
                  </button>
                </div>
              </>
            )}
          </section>
        )}
      </main>
    </I18nProvider>
  )
}
