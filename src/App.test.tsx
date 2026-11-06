import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from './App'
import { saveLocale } from './i18n'
import { saveSettings } from './lib/settings'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('first visit', () => {
  it('explains the app, then asks for the API key and remembers it', async () => {
    const user = userEvent.setup()
    saveLocale('pl')
    const { unmount } = render(<App />)

    expect(screen.getByRole('heading', { name: 'Handover' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Wspólna opieka, sprawny przepływ informacji' })).toBeInTheDocument()
    expect(screen.getByText(/nie stawia diagnoz/)).toBeInTheDocument()
    expect(screen.getByText(/nie jest wyrobem medycznym/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Zacznij' }))

    await user.type(screen.getByLabelText('Klucz API Groq'), 'test-key')
    await user.clear(screen.getByLabelText('Wizyta u…'))
    await user.type(screen.getByLabelText('Wizyta u…'), 'taty')
    await user.click(screen.getByRole('button', { name: 'Zapisz' }))
    expect(screen.getByRole('heading', { name: 'Notatka po wizycie u taty' })).toBeInTheDocument()

    unmount()
    render(<App />)
    expect(screen.queryByRole('heading', { name: 'Wspólna opieka, sprawny przepływ informacji' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Notatka po wizycie u taty' })).toBeInTheDocument()
  })

  it('shows the settings next time if the key was never saved', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await user.click(screen.getByRole('button', { name: 'Get started' }))

    unmount()
    render(<App />)
    expect(screen.getByLabelText('Groq API key')).toBeInTheDocument()
  })

  it('is skipped for someone who already has a key', () => {
    saveSettings({ apiKey: 'test-key', personLabel: '', recipients: '' })
    render(<App />)

    expect(screen.queryByRole('heading', { name: 'Shared care. Clear communication.' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Note after the visit to Mom' })).toBeInTheDocument()
  })

  it('can be reopened from the header', async () => {
    const user = userEvent.setup()
    saveSettings({ apiKey: 'test-key', personLabel: '', recipients: '' })
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'How it works' }))
    expect(screen.getByRole('heading', { name: 'Shared care. Clear communication.' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Get started' }))
    expect(screen.getByRole('heading', { name: 'Note after the visit to Mom' })).toBeInTheDocument()
  })
})

describe('UI language', () => {
  it('follows the browser language when it is supported', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['pl-PL', 'en-US'])
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Wspólna opieka, sprawny przepływ informacji' })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('pl')
  })

  it('falls back to English for an unsupported browser language', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['fr-FR'])
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Shared care. Clear communication.' })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('en')
  })

  it('is used for a German-speaking browser in any region', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['de-AT', 'en'])
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Gemeinsam betreuen. Gut informiert bleiben.' })).toBeInTheDocument()
    expect(screen.getByLabelText('Sprache')).toHaveDisplayValue('Deutsch')
    expect(document.documentElement.lang).toBe('de')
  })

  it('can be changed on the welcome screen, before reading it', async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US'])
    render(<App />)

    await user.selectOptions(screen.getByLabelText('Language'), 'Deutsch')
    expect(screen.getByRole('heading', { name: 'Gemeinsam betreuen. Gut informiert bleiben.' })).toBeInTheDocument()
  })

  it('switches immediately when chosen in settings and remembers the choice', async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US'])
    saveSettings({ apiKey: 'test-key', personLabel: '', recipients: '' })
    const { unmount } = render(<App />)

    await user.click(screen.getByRole('button', { name: 'Settings' }))
    await user.selectOptions(screen.getByLabelText('Language'), 'Polski')

    expect(screen.getByRole('heading', { name: 'Ustawienia' })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('pl')

    unmount()
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Notatka po wizycie u mamy' })).toBeInTheDocument()
  })
})
