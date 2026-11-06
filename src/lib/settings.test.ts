import { DEFAULT_SETTINGS, loadSettings, saveSettings } from './settings'

describe('settings', () => {
  it('returns defaults when nothing is stored', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it('round-trips what was saved', () => {
    saveSettings({ apiKey: 'test-key', personLabel: 'babci', recipients: 'ania@example.com' })
    expect(loadSettings()).toEqual({
      apiKey: 'test-key',
      personLabel: 'babci',
      recipients: 'ania@example.com',
    })
  })

  it('keeps the label saved under its earlier name, parentLabel', () => {
    localStorage.setItem(
      'handover.settings',
      JSON.stringify({ apiKey: 'test-key', parentLabel: 'taty', recipients: '' }),
    )
    expect(loadSettings().personLabel).toBe('taty')
  })

  it('ignores malformed data', () => {
    localStorage.setItem('handover.settings', '{not json')
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })
})
