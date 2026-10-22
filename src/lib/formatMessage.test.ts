import type { Handover } from '../ai/handover'
import { formatMessage, formatTitle } from './formatMessage'

const visitDate = new Date(2026, 9, 21)

// Shaped after fixtures/transcripts/PL_261022_233833_sd.txt.
const handover: Handover = {
  summary: 'Tata źle spał i jest zmęczony. Wypił herbatę, kanapki nie chciał.',
  observations: [
    { area: 'sleep', note: 'w nocy kilka razy się budził', source: 'reported' },
    { area: 'food', note: 'kanapki nie chciał', source: 'observed' },
  ],
  done_during_visit: ['pranie (mokre rzeczy wiszą w łazience)'],
  tasks_for_next_visit: [
    { task: 'zapytać, czy tata chce coś zjeść', owner: 'Maciej' },
    { task: 'odebrać receptę', owner: null },
  ],
  not_checked: ['leki', 'ciśnienie'],
  flags: [],
}

describe('formatTitle', () => {
  it('uses the parent label verbatim and a zero-padded date', () => {
    expect(formatTitle('mamy', new Date(2026, 0, 5))).toBe('Handover · wizyta u mamy, 05.01')
  })
})

describe('formatMessage', () => {
  const message = formatMessage(handover, 'taty', visitDate)

  it('starts with the title and the summary', () => {
    expect(message).toMatch(/^Handover · wizyta u taty, 21\.10\n\nCo u taty: Tata źle spał/)
  })

  it("marks the parent's own account and keeps the caregiver's observation plain", () => {
    expect(message).toContain('- Sen (wg taty): w nocy kilka razy się budził')
    expect(message).toContain('- Jedzenie: kanapki nie chciał')
  })

  it('renders owners only when they are named', () => {
    expect(message).toContain('Do przejęcia:\n- [ ] Maciej: zapytać, czy tata chce coś zjeść\n- [ ] odebrać receptę')
  })

  it('keeps negations under "Nie sprawdzono"', () => {
    expect(message).toContain('Nie sprawdzono:\n- leki\n- ciśnienie')
  })

  it('omits empty sections', () => {
    expect(message).not.toContain('Warto zwrócić uwagę')

    const minimal = formatMessage(
      { ...handover, summary: '', observations: [], tasks_for_next_visit: [], not_checked: [] },
      'taty',
      visitDate,
    )
    expect(minimal).toBe(
      'Handover · wizyta u taty, 21.10\n\nZrobione:\n- pranie (mokre rzeczy wiszą w łazience)',
    )
  })

  it('lists flags when the caregiver described something as worrying', () => {
    const flagged = formatMessage({ ...handover, flags: ['mało je od kilku dni'] }, 'taty', visitDate)
    expect(flagged).toMatch(/Warto zwrócić uwagę:\n- mało je od kilku dni$/)
  })
})
