import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from './App'
import type { Handover } from './ai/handover'
import { structure, transcribe } from './ai/groq'
import type { Recording } from './lib/audio'
import { DRAFT_TTL_MS, saveDraft } from './lib/draft'
import { deleteDraftAudio, loadDraftAudio, saveDraftAudio } from './lib/draftAudio'
import { saveSettings } from './lib/settings'

const recording: Recording = { blob: new Blob(['audio'], { type: 'audio/webm' }), fileName: 'note.webm' }

const handover: Handover = {
  summary: 'Mum is fine.',
  observations: [],
  done_during_visit: ['shopping'],
  tasks_for_next_visit: [],
  not_checked: [],
  flags: [],
}

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

// jsdom has no IndexedDB; the audio store is a browser boundary like MediaRecorder.
vi.mock('./lib/draftAudio', () => ({
  saveDraftAudio: vi.fn(async () => true),
  loadDraftAudio: vi.fn(async () => null),
  deleteDraftAudio: vi.fn(async () => {}),
}))

function renderApp() {
  saveSettings({ apiKey: 'test-key', personLabel: '', recipients: '' })
  const result = render(<App />)
  return { user: userEvent.setup(), ...result }
}

// A reload: the component tree is gone, only storage survives.
function reload(unmount: () => void) {
  unmount()
  render(<App />)
}

describe('on-device draft', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('restores the edited message after a reload', async () => {
    vi.mocked(structure).mockResolvedValueOnce(handover)
    const { user, unmount } = renderApp()

    await user.click(screen.getByRole('button', { name: "I'd rather type the note" }))
    await user.type(screen.getByLabelText(/Your note/), 'I did the shopping.')
    await user.click(screen.getByRole('button', { name: 'Prepare the message' }))
    await user.type(await screen.findByLabelText(/Message to share/), '\nLove, Ola')

    reload(unmount)

    expect(screen.getByRole('status')).toHaveTextContent('Your unfinished note was restored')
    const preview = screen.getByLabelText<HTMLTextAreaElement>(/Message to share/)
    expect(preview.value).toMatch(/Mum is fine\..*Love, Ola$/s)
    await user.click(screen.getByRole('button', { name: 'Back to the note' }))
    expect(screen.getByLabelText(/Your note/)).toHaveValue('I did the shopping.')
  })

  it('returns to the editable note when a reload interrupts structuring', async () => {
    vi.mocked(structure).mockReturnValueOnce(new Promise(() => {}))
    const { user, unmount } = renderApp()

    await user.click(screen.getByRole('button', { name: "I'd rather type the note" }))
    await user.type(screen.getByLabelText(/Your note/), 'I did the shopping.')
    await user.click(screen.getByRole('button', { name: 'Prepare the message' }))

    reload(unmount)

    expect(screen.getByLabelText(/Your note/)).toHaveValue('I did the shopping.')
    expect(screen.getByRole('button', { name: 'Prepare the message' })).toBeEnabled()
  })

  it('keeps the recording until it is transcribed, then offers it again after a reload', async () => {
    vi.mocked(transcribe).mockReturnValueOnce(new Promise(() => {}))
    const { user, unmount } = renderApp()

    await user.click(screen.getByRole('button', { name: 'Fake recording' }))
    expect(saveDraftAudio).toHaveBeenCalledWith(recording)

    vi.mocked(loadDraftAudio).mockResolvedValueOnce(recording)
    vi.mocked(transcribe).mockResolvedValueOnce('I did the shopping.')
    reload(unmount)

    await user.click(await screen.findByRole('button', { name: 'Try again' }))
    expect(await screen.findByLabelText(/Your note/)).toHaveValue('I did the shopping.')
    expect(transcribe).toHaveBeenLastCalledWith(recording.blob, 'note.webm', 'en', 'test-key')
    expect(deleteDraftAudio).toHaveBeenCalled()
  })

  it('starts fresh when the recording could not be kept', async () => {
    saveDraft({ step: 'recording', transcript: '', message: '', subject: '' })
    renderApp()

    expect(await screen.findByRole('button', { name: 'Fake recording' })).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('deletes the draft on request', async () => {
    saveDraft({ step: 'transcript', transcript: 'I did the shopping.', message: '', subject: '' })
    const { user, unmount } = renderApp()

    await user.click(within(screen.getByRole('status')).getByRole('button', { name: 'Delete draft' }))
    expect(screen.getByRole('button', { name: 'Fake recording' })).toBeInTheDocument()
    expect(deleteDraftAudio).toHaveBeenCalled()

    reload(unmount)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fake recording' })).toBeInTheDocument()
  })

  it('ignores an expired draft', () => {
    saveDraft(
      { step: 'transcript', transcript: 'An old note.', message: '', subject: '' },
      Date.now() - DRAFT_TTL_MS - 1,
    )
    renderApp()

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fake recording' })).toBeInTheDocument()
    expect(deleteDraftAudio).toHaveBeenCalled()
  })
})
