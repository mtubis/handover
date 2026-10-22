import { useState } from 'react'
import { buildMailto } from '../lib/mailto'

interface Props {
  subject: string
  message: string
  recipients: string
}

export function ShareActions({ subject, message, recipients }: Props) {
  const [status, setStatus] = useState<string | null>(null)
  const canShare = typeof navigator.share === 'function'

  async function handleShare() {
    setStatus(null)
    try {
      // Only the text: the subject is already its first line, and some apps would show it twice.
      await navigator.share({ text: message })
    } catch (error) {
      // AbortError means the user closed the share sheet — not an error worth showing.
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        setStatus('Nie udało się udostępnić. Skopiuj wiadomość i wklej ją ręcznie.')
      }
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message)
      setStatus('Skopiowano do schowka.')
    } catch {
      setStatus('Nie udało się skopiować. Zaznacz tekst i skopiuj go ręcznie.')
    }
  }

  return (
    <>
      <div className="actions">
        {canShare && (
          <button type="button" className="primary" onClick={handleShare}>
            Udostępnij
          </button>
        )}
        {/* Always offered: the share sheet doesn't know the siblings' default e-mail addresses. */}
        <a
          className={canShare ? 'button' : 'button primary'}
          href={buildMailto(recipients, subject, message)}
        >
          Wyślij e-mailem
        </a>
        <button type="button" onClick={handleCopy}>
          Kopiuj
        </button>
      </div>
      <p className="hint" aria-live="polite">
        {status}
      </p>
    </>
  )
}
