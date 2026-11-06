import { buildSystemPrompt, buildUserMessage } from './prompts'

describe('buildSystemPrompt', () => {
  it.each([
    ['en', 'English'],
    ['pl', 'Polish'],
    ['de', 'German'],
  ] as const)('asks for the handover in the UI language (%s)', (locale, language) => {
    expect(buildSystemPrompt(locale)).toContain(`Write every text value in ${language}`)
  })
})

describe('buildUserMessage', () => {
  it('passes the parent label and the note verbatim', () => {
    const message = buildUserMessage('Mama zjadła zupę.', 'mamy')
    expect(message).toContain('"mamy"')
    expect(message).toContain('"""\nMama zjadła zupę.\n"""')
  })
})
