import { UserFacingError } from '../lib/errors'
import { parseHandover, type Handover } from './handover'

const valid: Handover = {
  summary: 'Tata źle spał i jest zmęczony.',
  observations: [
    { area: 'sleep', note: 'w nocy kilka razy się budził', source: 'reported' },
    { area: 'food', note: 'kanapki nie chciał', source: 'observed' },
  ],
  done_during_visit: ['pranie'],
  tasks_for_next_visit: [
    { task: 'zapytać, czy tata chce coś zjeść', owner: 'Maciej' },
    { task: 'odebrać receptę', owner: null },
  ],
  not_checked: ['leki', 'ciśnienie'],
  flags: [],
}

describe('parseHandover', () => {
  it('accepts a valid response', () => {
    expect(parseHandover(JSON.stringify(valid))).toEqual(valid)
  })

  it('rejects invalid JSON with a readable error', () => {
    expect(() => parseHandover('{"summary": ')).toThrow(UserFacingError)
  })

  it('rejects a response with a missing field', () => {
    const { not_checked: _, ...withoutNotChecked } = valid
    expect(() => parseHandover(JSON.stringify(withoutNotChecked))).toThrow(UserFacingError)
  })

  it('rejects an unknown observation source', () => {
    const broken = {
      ...valid,
      observations: [{ area: 'sleep', note: 'źle spał', source: 'guessed' }],
    }
    expect(() => parseHandover(JSON.stringify(broken))).toThrow(UserFacingError)
  })

  it('rejects a task without an owner field', () => {
    const broken = { ...valid, tasks_for_next_visit: [{ task: 'zakupy' }] }
    expect(() => parseHandover(JSON.stringify(broken))).toThrow(UserFacingError)
  })

  it('rejects a non-object response', () => {
    expect(() => parseHandover('[]')).toThrow(UserFacingError)
  })
})
