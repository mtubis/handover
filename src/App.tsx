import { useState } from 'react'
import { structure, transcribe } from './ai/groq'
import { MessagePreview } from './components/MessagePreview'
import { Recorder } from './components/Recorder'
import { SettingsForm } from './components/SettingsForm'
import { ShareActions } from './components/ShareActions'
import type { Recording } from './components/useRecorder'
import { describeError } from './lib/errors'
import { formatMessage, formatTitle } from './lib/formatMessage'
import { loadSettings, saveSettings, type Settings } from './lib/settings'

type Step = 'record' | 'transcribing' | 'transcript' | 'structuring' | 'message'

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [editingSettings, setEditingSettings] = useState(() => settings.apiKey === '')
  const [storageWarning, setStorageWarning] = useState(false)
  const [step, setStep] = useState<Step>('record')
  const [transcript, setTranscript] = useState('')
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSave(next: Settings) {
    setStorageWarning(!saveSettings(next))
    setSettings(next)
    setEditingSettings(false)
  }

  function showError(cause: unknown) {
    setError(describeError(cause))
  }

  async function handleRecorded(recording: Recording) {
    setError(null)
    setStep('transcribing')
    try {
      setTranscript(await transcribe(recording.blob, recording.fileName, settings.apiKey))
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
      const handover = await structure(transcript, settings.parentLabel, settings.apiKey)
      const visitDate = new Date()
      setSubject(formatTitle(settings.parentLabel, visitDate))
      setMessage(formatMessage(handover, settings.parentLabel, visitDate))
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
    <main className="app">
      <header className="app-header">
        <h1>Handover</h1>
        {!editingSettings && (
          <button type="button" className="link" onClick={() => setEditingSettings(true)}>
            Ustawienia
          </button>
        )}
      </header>
      <p className="tagline">Jedna notatka głosowa. Wszyscy na bieżąco.</p>

      {storageWarning && (
        <p role="alert" className="error">
          Nie udało się zapamiętać ustawień w przeglądarce — będą działać do zamknięcia strony.
        </p>
      )}

      {editingSettings ? (
        <SettingsForm
          initial={settings}
          onSave={handleSave}
          onCancel={settings.apiKey ? () => setEditingSettings(false) : undefined}
        />
      ) : (
        <section className="card">
          <h2>Notatka po wizycie u {settings.parentLabel}</h2>

          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}

          {step === 'record' && (
            <>
              <Recorder onRecorded={handleRecorded} onError={showError} />
              <button type="button" className="link" onClick={() => setStep('transcript')}>
                Wolę napisać notatkę
              </button>
            </>
          )}

          {step === 'transcribing' && <p aria-live="polite">Zamieniam nagranie na tekst…</p>}

          {step === 'transcript' && (
            <>
              <label htmlFor="transcript">Twoja notatka (możesz poprawić)</label>
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
                  Przygotuj wiadomość
                </button>
                <button type="button" onClick={startOver}>
                  Nagraj od nowa
                </button>
              </div>
            </>
          )}

          {step === 'structuring' && <p aria-live="polite">Porządkuję notatkę…</p>}

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
                  Wróć do notatki
                </button>
                <button type="button" onClick={startOver}>
                  Nowa notatka
                </button>
              </div>
            </>
          )}
        </section>
      )}
    </main>
  )
}
