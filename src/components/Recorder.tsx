import { formatDuration } from '../lib/audio'
import { useRecorder, type Recording } from './useRecorder'

interface Props {
  onRecorded: (recording: Recording) => void
  onError: (error: unknown) => void
}

export function Recorder({ onRecorded, onError }: Props) {
  const { isRecording, elapsedSeconds, start, stop } = useRecorder()

  async function handleClick() {
    try {
      if (isRecording) {
        onRecorded(await stop())
      } else {
        await start()
      }
    } catch (error) {
      onError(error)
    }
  }

  return (
    <div className="recorder">
      <button
        type="button"
        className={`record-button${isRecording ? ' recording' : ''}`}
        onClick={handleClick}
      >
        {isRecording ? 'Zakończ nagrywanie' : 'Nagraj notatkę'}
      </button>
      <p className="timer" aria-live="polite">
        {isRecording ? `Nagrywam… ${formatDuration(elapsedSeconds)}` : 'Opowiedz, jak minęła wizyta.'}
      </p>
    </div>
  )
}
