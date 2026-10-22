import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from './App'
import type { Handover } from './ai/handover'
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
  saveSettings({ apiKey: 'test-key', parentLabel: 'mamy', recipients: 'ania@example.com' })
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Wolę napisać notatkę' }))
  await user.type(screen.getByLabelText(/Twoja notatka/), 'Byłam u mamy, zrobiłam zakupy.')
  await user.click(screen.getByRole('button', { name: 'Przygotuj wiadomość' }))
  const preview = await screen.findByLabelText(/Wiadomość dla rodzeństwa/)
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
  })

  it('falls back to an e-mail link and copying when Web Share is unavailable', async () => {
    const { user } = await prepareMessage()

    expect(screen.queryByRole('button', { name: 'Udostępnij' })).not.toBeInTheDocument()
    const mailLink = screen.getByRole('link', { name: 'Wyślij e-mailem' })
    expect(mailLink.getAttribute('href')).toMatch(/^mailto:ania@example\.com\?subject=Handover/)

    await user.click(screen.getByRole('button', { name: 'Kopiuj' }))
    expect(await screen.findByText('Skopiowano do schowka.')).toBeInTheDocument()
    expect(await navigator.clipboard.readText()).toContain('- [ ] odebrać receptę')
  })
})
