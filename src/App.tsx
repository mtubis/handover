import { useState } from 'react'
import { SettingsForm } from './components/SettingsForm'
import { loadSettings, saveSettings, type Settings } from './lib/settings'

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [editingSettings, setEditingSettings] = useState(() => settings.apiKey === '')
  const [storageWarning, setStorageWarning] = useState(false)

  function handleSave(next: Settings) {
    setStorageWarning(!saveSettings(next))
    setSettings(next)
    setEditingSettings(false)
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
          <p>Nagrywanie pojawi się w kolejnym kroku.</p>
        </section>
      )}
    </main>
  )
}
