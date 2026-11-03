import { AI_CONFIG } from '../ai/config'
import { useT } from '../i18n'

export function Privacy() {
  const t = useT()
  return (
    <section className="card" aria-labelledby="privacy-heading">
      <h2 id="privacy-heading">{t.privacy.heading}</h2>
      <ul>
        {t.privacy.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <p>
        <a href={AI_CONFIG.dataPolicyUrl} target="_blank" rel="noopener noreferrer">
          {t.privacy.groqPolicyLink}
        </a>
      </p>
    </section>
  )
}
