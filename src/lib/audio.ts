// Chrome records WebM/Opus, Safari records MP4/AAC. Whisper accepts both as-is,
// but it detects the format from the file extension, so the name must match the content.
const PREFERRED_MIME_TYPES = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm']

const EXTENSIONS: Record<string, string> = {
  'audio/webm': 'webm',
  'video/webm': 'webm',
  'audio/mp4': 'mp4',
  'video/mp4': 'mp4',
  'audio/x-m4a': 'm4a',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/mpeg': 'mp3',
}

export function pickMimeType(isSupported: (mimeType: string) => boolean): string | undefined {
  return PREFERRED_MIME_TYPES.find((mimeType) => isSupported(mimeType))
}

export function fileNameForMimeType(mimeType: string): string {
  const baseType = mimeType.split(';')[0].trim().toLowerCase()
  return `note.${EXTENSIONS[baseType] ?? 'webm'}`
}

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
