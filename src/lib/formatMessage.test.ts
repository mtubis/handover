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
  it('uses the parent label verbatim and a spelled-out date in the message language', () => {
    expect(formatTitle('mamy', new Date(2026, 0, 5), 'pl')).toBe('Handover · wizyta u mamy, 5 stycznia')
    expect(formatTitle('Mom', new Date(2026, 0, 5), 'en')).toBe('Handover · visit to Mom, January 5')
  })
})

describe('formatMessage (Polish)', () => {
  const message = formatMessage(handover, 'taty', visitDate, 'pl')

  it('starts with the title and the summary', () => {
    expect(message).toMatch(/^Handover · wizyta u taty, 21 października\n\nCo u taty: Tata źle spał/)
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
      'pl',
    )
    expect(minimal).toBe(
      'Handover · wizyta u taty, 21 października\n\nZrobione:\n- pranie (mokre rzeczy wiszą w łazience)',
    )
  })

  it('lists flags when the caregiver described something as worrying', () => {
    const flagged = formatMessage({ ...handover, flags: ['mało je od kilku dni'] }, 'taty', visitDate, 'pl')
    expect(flagged).toMatch(/Warto zwrócić uwagę:\n- mało je od kilku dni$/)
  })
})

describe('formatMessage (English)', () => {
  const englishHandover: Handover = {
    summary: 'Dad slept badly and is tired.',
    observations: [
      { area: 'sleep', note: 'woke up several times at night', source: 'reported' },
      { area: 'food', note: "didn't want the sandwich", source: 'observed' },
    ],
    done_during_visit: ['laundry'],
    tasks_for_next_visit: [{ task: 'ask whether Dad wants something to eat', owner: 'Mark' }],
    not_checked: ['meds'],
    flags: ['he has been eating little for a few days'],
  }

  it('uses English headings, labels and date', () => {
    expect(formatMessage(englishHandover, 'Dad', visitDate, 'en')).toBe(
      [
        'Handover · visit to Dad, October 21',
        'How Dad is doing: Dad slept badly and is tired.',
        "What I noticed:\n- Sleep (according to Dad): woke up several times at night\n- Food: didn't want the sandwich",
        'Done:\n- laundry',
        'To take over:\n- [ ] Mark: ask whether Dad wants something to eat',
        'Not checked:\n- meds',
        'Worth keeping an eye on:\n- he has been eating little for a few days',
      ].join('\n\n'),
    )
  })
})
