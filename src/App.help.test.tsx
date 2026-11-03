import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { saveLocale } from './i18n'
import { saveSettings } from './lib/settings'

async function openSettings() {
  const user = userEvent.setup()
  saveSettings({ apiKey: 'test-key', personLabel: '', recipients: '' })
  render(<App />)
  await user.click(screen.getByRole('button', { name: 'Settings' }))
  return user
}

describe('API key help', () => {
  it('opens from the "?" next to the key field and closes again', async () => {
    const user = await openSettings()

    await user.click(screen.getByRole('button', { name: 'How do I get a Groq API key?' }))
    const dialog = screen.getByRole('dialog', { name: 'How do I get a Groq API key?' })
    expect(within(dialog).getByText(/Groq has a free plan/)).toBeInTheDocument()
    expect(within(dialog).getByRole('link', { name: 'Open the Groq console' })).toHaveAttribute(
      'href',
      'https://console.groq.com/keys',
    )

    await user.click(within(dialog).getByRole('button', { name: 'Close' }))
    expect(dialog).not.toHaveAttribute('open')
    // Closing the help must not submit or leave the settings form.
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
  })

  it('opens from the welcome screen, in the UI language', async () => {
    const user = userEvent.setup()
    saveLocale('pl')
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Jak uzyskać klucz Groq?' }))
    expect(screen.getByRole('dialog', { name: 'Jak uzyskać klucz Groq?' })).toBeInTheDocument()
  })
})

describe('privacy section', () => {
  it('explains where the data goes and links to the provider policy', async () => {
    await openSettings()

    const privacy = screen.getByRole('region', { name: 'Privacy' })
    expect(within(privacy).getByText(/no server of its own/)).toBeInTheDocument()
    expect(within(privacy).getByText(/up to 30 days/)).toBeInTheDocument()
    expect(within(privacy).getByText(/only in this browser on this device/)).toBeInTheDocument()
    expect(within(privacy).getByRole('link', { name: 'How Groq handles your data' })).toHaveAttribute(
      'href',
      'https://console.groq.com/docs/your-data',
    )
  })
})
