import { useId, useRef } from 'react'
import { AI_CONFIG } from '../ai/config'
import { useT } from '../i18n'

interface Props {
  /** "icon": a "?" next to the key field; "link": the question as text, on the welcome screen. */
  trigger: 'icon' | 'link'
}

// A native modal <dialog>: focus moves into it, Escape closes it and the page behind is inert.
export function KeyHelp({ trigger }: Props) {
  const t = useT()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  return (
    <>
      <button
        type="button"
        className={trigger === 'icon' ? 'help-icon' : 'link'}
        aria-label={trigger === 'icon' ? t.keyHelp.title : undefined}
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
      >
        {trigger === 'icon' ? '?' : t.keyHelp.title}
      </button>

      <dialog ref={dialogRef} className="dialog" aria-labelledby={titleId}>
        <h2 id={titleId}>{t.keyHelp.title}</h2>
        <p>{t.keyHelp.intro}</p>
        <ol>
          {t.keyHelp.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p>
          <a href={AI_CONFIG.consoleKeysUrl} target="_blank" rel="noopener noreferrer">
            {t.keyHelp.consoleLink}
          </a>
        </p>
        <p>{t.keyHelp.cost}</p>
        <p>{t.keyHelp.safety}</p>
        {/* Not <form method="dialog">: this dialog can sit inside the settings form. */}
        <div className="actions">
          <button type="button" className="primary" onClick={() => dialogRef.current?.close()}>
            {t.keyHelp.close}
          </button>
        </div>
      </dialog>
    </>
  )
}
