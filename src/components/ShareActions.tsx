import { useState } from 'react'
import { useT } from '../i18n'
import { buildMailto } from '../lib/mailto'

interface Props {
  subject: string
  message: string
  recipients: string
}

export function ShareActions({ subject, message, recipients }: Props) {
  const t = useT()
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
        setStatus(t.share.shareFailed)
      }
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message)
      setStatus(t.share.copied)
    } catch {
      setStatus(t.share.copyFailed)
    }
  }

  return (
    <>
      <div className="actions">
        {canShare && (
          <button type="button" className="primary" onClick={handleShare}>
            {t.share.share}
          </button>
        )}
        {/* Always offered: the share sheet doesn't know the default e-mail recipients. */}
        <a
          className={canShare ? 'button' : 'button primary'}
          href={buildMailto(recipients, subject, message)}
        >
          {t.share.email}
        </a>
        <button type="button" onClick={handleCopy}>
          {t.share.copy}
        </button>
      </div>
      <p className="hint" aria-live="polite">
        {status}
      </p>
    </>
  )
}
