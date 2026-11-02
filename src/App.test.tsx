import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from './App'
import { saveLocale } from './i18n'

describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('asks for the API key first and remembers it', async () => {
    const user = userEvent.setup()
    saveLocale('pl')
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Handover' })).toBeInTheDocument()
    await user.type(screen.getByLabelText('Klucz API Groq'), 'test-key')
    await user.clear(screen.getByLabelText('Wizyta u…'))
    await user.type(screen.getByLabelText('Wizyta u…'), 'taty')
    await user.click(screen.getByRole('button', { name: 'Zapisz' }))

    expect(screen.getByRole('heading', { name: 'Notatka po wizycie u taty' })).toBeInTheDocument()
  })
})

describe('UI language', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('follows the browser language when it is supported', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['pl-PL', 'en-US'])
    render(<App />)

    expect(screen.getByLabelText('Klucz API Groq')).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('pl')
  })

  it('falls back to English for an unsupported browser language', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['fr-FR'])
    render(<App />)

    expect(screen.getByLabelText('Groq API key')).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('en')
  })

  it('switches immediately when chosen in settings and remembers the choice', async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US'])
    const { unmount } = render(<App />)

    await user.selectOptions(screen.getByLabelText('Language'), 'Polski')

    expect(screen.getByRole('heading', { name: 'Ustawienia' })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('pl')

    unmount()
    render(<App />)
    expect(screen.getByLabelText('Język')).toHaveDisplayValue('Polski')
  })
})

describe('German UI', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('is used for a German-speaking browser in any region', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['de-AT', 'en'])
    render(<App />)

    expect(screen.getByLabelText('Groq-API-Schlüssel')).toBeInTheDocument()
    expect(screen.getByLabelText('Sprache')).toHaveDisplayValue('Deutsch')
    expect(document.documentElement.lang).toBe('de')
  })
})
