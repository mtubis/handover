import { useT, type Locale } from '../i18n'
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
      <p>{t.welcome.intro}</p>

      <h3>{t.welcome.stepsHeading}</h3>
      <ol>
        {t.welcome.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <p>{t.welcome.noDiagnosis}</p>
      <p>{t.welcome.requirement}</p>
      <p className="hint">{t.welcome.privacy}</p>

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
