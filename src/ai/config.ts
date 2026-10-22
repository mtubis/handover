// Single place for provider details, so the provider or models can be swapped without touching callers.
export const AI_CONFIG = {
  baseUrl: 'https://api.groq.com/openai/v1/',
  transcriptionModel: 'whisper-large-v3-turbo',
  transcriptionLanguage: 'pl',
  structuringModel: 'openai/gpt-oss-120b',
  requestTimeoutMs: 90_000,
} as const
