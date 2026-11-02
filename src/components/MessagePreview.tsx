import { useT } from '../i18n'

interface Props {
  message: string
  onChange: (message: string) => void
}

export function MessagePreview({ message, onChange }: Props) {
  const t = useT()
  return (
    <>
      <label htmlFor="message">{t.message.label}</label>
      <textarea
        id="message"
        rows={16}
        value={message}
        onChange={(event) => onChange(event.target.value)}
      />
    </>
  )
}
