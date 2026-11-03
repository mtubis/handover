import { useEffect, useState } from 'react'
import { structure, transcribe } from './ai/groq'
import { MessagePreview } from './components/MessagePreview'
import { Recorder } from './components/Recorder'
import { SettingsForm } from './components/SettingsForm'
import { Welcome } from './components/Welcome'
import { ShareActions } from './components/ShareActions'
import type { Recording } from './components/useRecorder'
import { I18nProvider, MESSAGES, loadLocale, saveLocale, type Locale } from './i18n'
import { describeError } from './lib/errors'
import { formatMessage, formatTitle } from './lib/formatMessage'
import { hasSeenWelcome, markWelcomeSeen } from './lib/onboarding'
import { loadSettings, saveSettings, type Settings } from './lib/settings'

type Step = 'record' | 'transcribing' | 'transcript' | 'structuring' | 'message'

// Kept as the cause, not as text, so the message follows the current UI language.
type ErrorState = { cause: unknown } | null

export default function App() {
  const [locale, setLocale] = useState<Locale>(loadLocale)
  const t = MESSAGES[locale]
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const personLabel = settings.personLabel || t.handover.defaultPersonLabel
  // Shown on the first visit only; someone who already has a key is not a first-time user.
  const [showWelcome, setShowWelcome] = useState(() => !hasSeenWelcome() && settings.apiKey === '')
  const [editingSettings, setEditingSettings] = useState(() => settings.apiKey === '')
  const [storageWarning, setStorageWarning] = useState(false)
  const [step, setStep] = useState<Step>('record')
  const [transcript, setTranscript] = useState('')
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [error, setError] = useState<ErrorState>(null)

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

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

  async function handleRecorded(recording: Recording) {
    setError(null)
    setStep('transcribing')
    try {
      setTranscript(await transcribe(recording.blob, recording.fileName, locale, settings.apiKey))
      setStep('transcript')
    } catch (cause) {
      showError(cause)
      setStep('record')
    }
  }

  async function handlePrepareMessage() {
    setError(null)
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

  function startOver() {
    setError(null)
    setTranscript('')
    setMessage('')
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
          <SettingsForm
            initial={settings}
            locale={locale}
            onLocaleChange={handleLocaleChange}
            onSave={handleSave}
            onCancel={settings.apiKey ? () => setEditingSettings(false) : undefined}
          />
        ) : (
          <section className="card">
            <h2>{t.app.noteHeading(personLabel)}</h2>

            {error && (
              <p role="alert" className="error">
                {describeError(error.cause, t.errors)}
              </p>
            )}

            {step === 'record' && (
              <>
                <Recorder onRecorded={handleRecorded} onError={showError} />
                <button type="button" className="link" onClick={() => setStep('transcript')}>
                  {t.app.typeInstead}
                </button>
              </>
            )}

            {step === 'transcribing' && <p aria-live="polite">{t.app.transcribing}</p>}

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
