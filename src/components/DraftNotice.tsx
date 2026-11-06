import { useT, type Locale } from '../i18n'

interface Props {
  savedAt: number
  locale: Locale
  onDelete: () => void
}

export function DraftNotice({ savedAt, locale, onDelete }: Props) {
  const t = useT()
  const time = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(savedAt)

  return (
    <div role="status" className="notice">
      <p>{t.draft.restored(time)}</p>
      <button type="button" className="link" onClick={onDelete}>
        {t.draft.delete}
      </button>
    </div>
  )
}
