import { useState, type FormEvent } from 'react'
import { useT, type Locale } from '../i18n'
import type { Settings } from '../lib/settings'
import { LanguageSelect } from './LanguageSelect'

interface Props {
  initial: Settings
  locale: Locale
  /** Applied immediately, so the rest of the form can be read in the chosen language. */
  onLocaleChange: (locale: Locale) => void
  onSave: (settings: Settings) => void
  onCancel?: () => void
}

export function SettingsForm({ initial, locale, onLocaleChange, onSave, onCancel }: Props) {
  const t = useT()
  const [apiKey, setApiKey] = useState(initial.apiKey)
  const [personLabel, setPersonLabel] = useState(initial.personLabel)
  const [recipients, setRecipients] = useState(initial.recipients)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSave({
      apiKey: apiKey.trim(),
      personLabel: personLabel.trim(),
      recipients: recipients.trim(),
    })
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{t.settings.heading}</h2>

      <LanguageSelect locale={locale} onChange={onLocaleChange} />

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

      <label htmlFor="person-label">{t.settings.personLabelLabel}</label>
      <input
        id="person-label"
        type="text"
        placeholder={t.handover.defaultPersonLabel}
        value={personLabel}
        onChange={(event) => setPersonLabel(event.target.value)}
      />
      <p className="hint">{t.settings.personLabelHint}</p>

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
