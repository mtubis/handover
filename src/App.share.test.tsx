import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from './App'
import type { Handover } from './ai/handover'
import { structure } from './ai/groq'
import { saveLocale } from './i18n'
import { saveSettings } from './lib/settings'

const handover: Handover = {
  summary: 'Mama czuje się dobrze.',
  observations: [],
  done_during_visit: ['zakupy'],
  tasks_for_next_visit: [{ task: 'odebrać receptę', owner: null }],
  not_checked: ['leki'],
  flags: [],
}

vi.mock('./ai/groq', () => ({
  transcribe: vi.fn(),
  structure: vi.fn(async () => handover),
}))

async function prepareMessage() {
  const user = userEvent.setup()
  saveLocale('pl')
  saveSettings({ apiKey: 'test-key', personLabel: 'mamy', recipients: 'ania@example.com' })
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Wolę napisać notatkę' }))
  await user.type(screen.getByLabelText(/Twoja notatka/), 'Byłam u mamy, zrobiłam zakupy.')
  await user.click(screen.getByRole('button', { name: 'Przygotuj wiadomość' }))
  const preview = await screen.findByLabelText(/Wiadomość do przekazania/)
  return { user, preview }
}

describe('sharing the handover message', () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'share')
  })

  it('shares the message as edited by the user', async () => {
    const share = vi.fn(async () => {})
    Object.defineProperty(navigator, 'share', { value: share, configurable: true })
    const { user, preview } = await prepareMessage()

    expect((preview as HTMLTextAreaElement).value).toContain('Nie sprawdzono:\n- leki')
    await user.type(preview, '\nPozdrawiam, Ola')
    await user.click(screen.getByRole('button', { name: 'Udostępnij' }))

    expect(share).toHaveBeenCalledWith({
      text: expect.stringMatching(/^Handover · wizyta u mamy.*Pozdrawiam, Ola$/s),
    })
    expect(screen.getByRole('link', { name: 'Wyślij e-mailem' })).toHaveAttribute(
      'href',
      expect.stringContaining('Pozdrawiam%2C%20Ola'),
    )
  })

  it('offers the e-mail link and copying when Web Share is unavailable', async () => {
    const { user } = await prepareMessage()

    expect(screen.queryByRole('button', { name: 'Udostępnij' })).not.toBeInTheDocument()
    const mailLink = screen.getByRole('link', { name: 'Wyślij e-mailem' })
    expect(mailLink.getAttribute('href')).toMatch(/^mailto:ania@example\.com\?subject=Handover/)

    await user.click(screen.getByRole('button', { name: 'Kopiuj' }))
    expect(await screen.findByText('Skopiowano do schowka.')).toBeInTheDocument()
    expect(await navigator.clipboard.readText()).toContain('- [ ] odebrać receptę')
  })
})

describe('message language', () => {
  it('asks for and formats the message in the UI language, with its default parent label', async () => {
    const user = userEvent.setup()
    saveLocale('en')
    saveSettings({ apiKey: 'test-key', personLabel: '', recipients: '' })
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Note after the visit to Mom' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: "I'd rather type the note" }))
    await user.type(screen.getByLabelText(/Your note/), 'I did the shopping.')
    await user.click(screen.getByRole('button', { name: 'Prepare the message' }))
    const preview = await screen.findByLabelText(/Message to share/)

    expect(structure).toHaveBeenCalledWith('I did the shopping.', 'Mom', 'en', 'test-key')
    expect((preview as HTMLTextAreaElement).value).toMatch(/^Handover · visit to Mom, /)
    expect((preview as HTMLTextAreaElement).value).toContain('Not checked:\n- leki')
  })
})
