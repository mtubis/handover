import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from './App'
import { transcribe } from './ai/groq'
import type { Recording } from './components/useRecorder'
import { ApiError } from './lib/errors'
import { saveSettings } from './lib/settings'

const recording: Recording = { blob: new Blob(['audio'], { type: 'audio/webm' }), fileName: 'note.webm' }

// MediaRecorder is a browser boundary: the recorder is replaced by a button that "records" a blob.
vi.mock('./components/Recorder', () => ({
  Recorder: ({ onRecorded }: { onRecorded: (recording: Recording) => void }) => (
    <button type="button" onClick={() => onRecorded(recording)}>
      Fake recording
    </button>
  ),
}))

vi.mock('./ai/groq', () => ({
  transcribe: vi.fn(),
  structure: vi.fn(),
}))

const transcribeMock = vi.mocked(transcribe)

function renderApp() {
  saveSettings({ apiKey: 'test-key', personLabel: '', recipients: '' })
  render(<App />)
  return userEvent.setup()
}

describe('failed transcription', () => {
  afterEach(() => {
    transcribeMock.mockReset()
  })

  it('keeps the recording and transcribes the same audio on retry', async () => {
    transcribeMock
      .mockRejectedValueOnce(new ApiError(429, 'rate limited'))
      .mockResolvedValueOnce('I did the shopping.')
    const user = renderApp()

    await user.click(screen.getByRole('button', { name: 'Fake recording' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Too many requests')
    expect(screen.getByText(/Your recording is still here/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByLabelText(/Your note/)).toHaveValue('I did the shopping.')
    expect(transcribeMock).toHaveBeenCalledTimes(2)
    expect(transcribeMock).toHaveBeenLastCalledWith(recording.blob, 'note.webm', 'en', 'test-key')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('can discard the recording and start a new one', async () => {
    transcribeMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    const user = renderApp()

    await user.click(screen.getByRole('button', { name: 'Fake recording' }))
    await user.click(await screen.findByRole('button', { name: 'Record a new note' }))

    expect(screen.getByRole('button', { name: 'Fake recording' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('asks before leaving the page while the recording is not transcribed yet', async () => {
    transcribeMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    const user = renderApp()

    await user.click(screen.getByRole('button', { name: 'Fake recording' }))
    await screen.findByRole('button', { name: 'Try again' })

    const event = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })
})
