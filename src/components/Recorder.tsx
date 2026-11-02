import { useT } from '../i18n'
import { formatDuration } from '../lib/audio'
import { useRecorder, type Recording } from './useRecorder'

interface Props {
  onRecorded: (recording: Recording) => void
  onError: (error: unknown) => void
}

export function Recorder({ onRecorded, onError }: Props) {
  const t = useT()
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
        {isRecording ? t.recorder.stop : t.recorder.start}
      </button>
      <p className="timer" aria-live="polite">
        {isRecording ? t.recorder.recording(formatDuration(elapsedSeconds)) : t.recorder.prompt}
      </p>
    </div>
  )
}
