import { buildMailto } from './mailto'

describe('buildMailto', () => {
  it('encodes Polish characters, reserved characters and line breaks', () => {
    const link = buildMailto('', 'Handover · wizyta u mamy', 'Zrobione:\n- zakupy & leki?')

    expect(link).toBe(
      'mailto:?subject=Handover%20%C2%B7%20wizyta%20u%20mamy' +
        '&body=Zrobione%3A%0D%0A-%20zakupy%20%26%20leki%3F',
    )
    expect(decodeURIComponent(link.split('&body=')[1])).toBe('Zrobione:\r\n- zakupy & leki?')
  })

  it('accepts recipients separated by commas, semicolons or spaces', () => {
    const link = buildMailto('ania@example.com; maciej@example.com', 'Temat', 'Treść')
    expect(link.startsWith('mailto:ania@example.com,maciej@example.com?')).toBe(true)
  })
})
