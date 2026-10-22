import { ApiError, UserFacingError } from '../lib/errors'
import { AI_CONFIG } from './config'
import { parseHandover, type Handover } from './handover'
import { HANDOVER_JSON_SCHEMA, STRUCTURING_SYSTEM_PROMPT, buildUserMessage } from './prompts'

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

interface ChatCompletion {
  choices?: { finish_reason?: string; message?: { content?: string | null } }[]
}

export async function structure(
  transcript: string,
  parentLabel: string,
  apiKey: string,
): Promise<Handover> {
  const body = JSON.stringify({
    model: AI_CONFIG.structuringModel,
    messages: [
      { role: 'system', content: STRUCTURING_SYSTEM_PROMPT },
      { role: 'user', content: buildUserMessage(transcript, parentLabel) },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: { name: 'handover', strict: true, schema: HANDOVER_JSON_SCHEMA },
    },
    reasoning_effort: AI_CONFIG.structuringReasoningEffort,
    // gpt-oss on Groq does not support reasoning_format; this keeps the reasoning out of the response.
    include_reasoning: false,
    temperature: AI_CONFIG.structuringTemperature,
    max_completion_tokens: AI_CONFIG.structuringMaxTokens,
  })

  const data = (await post('chat/completions', apiKey, body, {
    'Content-Type': 'application/json',
  })) as ChatCompletion
  const choice = data.choices?.[0]
  if (choice?.finish_reason === 'length') {
    throw new UserFacingError('Notatka jest za długa do uporządkowania. Skróć ją i spróbuj ponownie.')
  }
  return parseHandover(choice?.message?.content ?? '')
}
