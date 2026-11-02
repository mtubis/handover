import { useState, type FormEvent } from 'react'
import { useT } from '../i18n'
import { DEFAULT_SETTINGS, type Settings } from '../lib/settings'

interface Props {
  initial: Settings
  onSave: (settings: Settings) => void
  onCancel?: () => void
}

export function SettingsForm({ initial, onSave, onCancel }: Props) {
  const t = useT()
  const [apiKey, setApiKey] = useState(initial.apiKey)
  const [parentLabel, setParentLabel] = useState(initial.parentLabel)
  const [recipients, setRecipients] = useState(initial.recipients)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSave({
      apiKey: apiKey.trim(),
      parentLabel: parentLabel.trim() || DEFAULT_SETTINGS.parentLabel,
      recipients: recipients.trim(),
    })
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{t.settings.heading}</h2>

      <label htmlFor="api-key">{t.settings.apiKeyLabel}</label>
      <input
        id="api-key"
        type="password"
        autoComplete="off"
        spellCheck={false}
        value={apiKey}
        onChange={(event) => setApiKey(event.target.value)}
        required
      />
      <p className="hint">{t.settings.apiKeyHint}</p>

      <label htmlFor="parent-label">{t.settings.parentLabelLabel}</label>
      <input
        id="parent-label"
        type="text"
        placeholder={t.settings.parentLabelPlaceholder}
        value={parentLabel}
        onChange={(event) => setParentLabel(event.target.value)}
      />
      <p className="hint">{t.settings.parentLabelHint}</p>

      <label htmlFor="recipients">{t.settings.recipientsLabel}</label>
      <input
        id="recipients"
        type="text"
        inputMode="email"
        autoComplete="off"
        placeholder={t.settings.recipientsPlaceholder}
        value={recipients}
        onChange={(event) => setRecipients(event.target.value)}
      />
      <p className="hint">{t.settings.recipientsHint}</p>

      <div className="actions">
        <button type="submit" className="primary">
          {t.settings.save}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            {t.settings.cancel}
          </button>
        )}
      </div>
    </form>
  )
}
