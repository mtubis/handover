import { fileNameForMimeType, formatDuration, pickMimeType } from './audio'

describe('pickMimeType', () => {
  it('prefers WebM/Opus when supported (Chrome)', () => {
    expect(pickMimeType(() => true)).toBe('audio/webm;codecs=opus')
  })

  it('falls back to MP4 when WebM is not supported (Safari)', () => {
    expect(pickMimeType((type) => type === 'audio/mp4')).toBe('audio/mp4')
  })

  it('returns undefined so the browser can use its default', () => {
    expect(pickMimeType(() => false)).toBeUndefined()
  })
})

describe('fileNameForMimeType', () => {
  it.each([
    ['audio/webm;codecs=opus', 'note.webm'],
    ['audio/mp4', 'note.mp4'],
    ['audio/mp4; codecs=mp4a.40.2', 'note.mp4'],
    ['AUDIO/MP4', 'note.mp4'],
    ['audio/ogg;codecs=opus', 'note.ogg'],
  ])('maps %s to %s', (mimeType, expected) => {
    expect(fileNameForMimeType(mimeType)).toBe(expected)
  })
})

describe('formatDuration', () => {
  it('formats seconds as m:ss', () => {
    expect(formatDuration(0)).toBe('0:00')
    expect(formatDuration(75)).toBe('1:15')
  })
})
