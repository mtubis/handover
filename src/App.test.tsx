import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  it('asks for the API key first and remembers it', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Handover' })).toBeInTheDocument()
    await user.type(screen.getByLabelText('Klucz API Groq'), 'test-key')
    await user.clear(screen.getByLabelText('Wizyta u…'))
    await user.type(screen.getByLabelText('Wizyta u…'), 'taty')
    await user.click(screen.getByRole('button', { name: 'Zapisz' }))

    expect(screen.getByRole('heading', { name: 'Notatka po wizycie u taty' })).toBeInTheDocument()
  })
})
