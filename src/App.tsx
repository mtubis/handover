import { useState } from 'react'
import { transcribe } from './ai/groq'
import { Recorder } from './components/Recorder'
import { SettingsForm } from './components/SettingsForm'
import type { Recording } from './components/useRecorder'
import { describeError } from './lib/errors'
import { loadSettings, saveSettings, type Settings } from './lib/settings'

type Step = 'record' | 'transcribing' | 'transcript'

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [editingSettings, setEditingSettings] = useState(() => settings.apiKey === '')
  const [storageWarning, setStorageWarning] = useState(false)
  const [step, setStep] = useState<Step>('record')
  const [transcript, setTranscript] = useState('')
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

  function startOver() {
    setError(null)
    setTranscript('')
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
                <button type="button" onClick={startOver}>
                  Nagraj od nowa
                </button>
              </div>
            </>
          )}
        </section>
      )}
    </main>
  )
}
