import { ApiError } from '../lib/errors'
import { AI_CONFIG } from './config'

async function post(path: string, apiKey: string, body: BodyInit, headers: HeadersInit = {}) {
  const response = await fetch(`${AI_CONFIG.baseUrl}${path}`, {
    method: 'POST',
    headers: { ...headers, Authorization: `Bearer ${apiKey}` },
    body,
    signal: AbortSignal.timeout(AI_CONFIG.requestTimeoutMs),
  })
  if (!response.ok) {
    throw new ApiError(response.status, `AI request to ${path} failed with ${response.status}`)
  }
  return (await response.json()) as unknown
}

export async function transcribe(audio: Blob, fileName: string, apiKey: string): Promise<string> {
  const form = new FormData()
  form.append('file', audio, fileName)
  form.append('model', AI_CONFIG.transcriptionModel)
  form.append('language', AI_CONFIG.transcriptionLanguage)
  form.append('response_format', 'json')

  const data = await post('audio/transcriptions', apiKey, form)
  if (typeof data === 'object' && data !== null && 'text' in data && typeof data.text === 'string') {
    return data.text.trim()
  }
  throw new ApiError(502, 'Unexpected transcription response shape')
}
