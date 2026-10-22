import { useState, type FormEvent } from 'react'
import type { Settings } from '../lib/settings'

interface Props {
  initial: Settings
  onSave: (settings: Settings) => void
  onCancel?: () => void
}

export function SettingsForm({ initial, onSave, onCancel }: Props) {
  const [apiKey, setApiKey] = useState(initial.apiKey)
  const [parentLabel, setParentLabel] = useState(initial.parentLabel)
  const [recipients, setRecipients] = useState(initial.recipients)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSave({
      apiKey: apiKey.trim(),
      parentLabel: parentLabel.trim() || 'mamy',
      recipients: recipients.trim(),
    })
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Ustawienia</h2>

      <label htmlFor="api-key">Klucz API Groq</label>
      <input
        id="api-key"
        type="password"
        autoComplete="off"
        spellCheck={false}
        value={apiKey}
        onChange={(event) => setApiKey(event.target.value)}
        required
      />
      <p className="hint">
        Klucz zostaje tylko na tym urządzeniu i jest wysyłany wyłącznie do api.groq.com.
      </p>

      <label htmlFor="parent-label">Wizyta u…</label>
      <input
        id="parent-label"
        type="text"
        placeholder="mamy"
        value={parentLabel}
        onChange={(event) => setParentLabel(event.target.value)}
      />
      <p className="hint">Np. „mamy”, „taty”, „babci” — tak, jak w zdaniu „wizyta u mamy”.</p>

      <label htmlFor="recipients">Adresy e-mail rodzeństwa (opcjonalnie)</label>
      <input
        id="recipients"
        type="text"
        inputMode="email"
        autoComplete="off"
        placeholder="ania@example.com, maciej@example.com"
        value={recipients}
        onChange={(event) => setRecipients(event.target.value)}
      />
      <p className="hint">Używane tylko wtedy, gdy telefon nie ma przycisku „Udostępnij”.</p>

      <div className="actions">
        <button type="submit" className="primary">
          Zapisz
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Anuluj
          </button>
        )}
      </div>
    </form>
  )
}
