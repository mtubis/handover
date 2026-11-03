import { useT, type Locale } from '../i18n'
import { KeyHelp } from './KeyHelp'
import { LanguageSelect } from './LanguageSelect'

interface Props {
  locale: Locale
  onLocaleChange: (locale: Locale) => void
  onStart: () => void
}

export function Welcome({ locale, onLocaleChange, onStart }: Props) {
  const t = useT()
  return (
    <section className="card welcome">
      <h2>{t.welcome.heading}</h2>
      {t.welcome.intro.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}

      <h3>{t.welcome.stepsHeading}</h3>
      <ol>
        {t.welcome.steps.map((step) => (
          <li key={step.title}>
            <strong>{step.title}</strong> {step.text}
          </li>
        ))}
      </ol>
      <p>{t.welcome.control}</p>

      <h3>{t.welcome.requirementHeading}</h3>
      <p>{t.welcome.requirement}</p>
      <KeyHelp trigger="link" />

      <h3>{t.welcome.privacyHeading}</h3>
      <p>{t.welcome.privacy}</p>

      {/* Offered here too: a first visitor may land in a language they don't read. */}
      <LanguageSelect locale={locale} onChange={onLocaleChange} />

      <div className="actions">
        <button type="button" className="primary" onClick={onStart}>
          {t.welcome.start}
        </button>
      </div>
    </section>
  )
}
