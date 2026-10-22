interface Props {
  message: string
  onChange: (message: string) => void
}

export function MessagePreview({ message, onChange }: Props) {
  return (
    <>
      <label htmlFor="message">Wiadomość dla rodzeństwa (możesz poprawić)</label>
      <textarea
        id="message"
        rows={16}
        value={message}
        onChange={(event) => onChange(event.target.value)}
      />
    </>
  )
}
