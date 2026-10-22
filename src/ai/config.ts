// Single place for provider details, so the provider or models can be swapped without touching callers.
export const AI_CONFIG = {
  baseUrl: 'https://api.groq.com/openai/v1/',
  transcriptionModel: 'whisper-large-v3-turbo',
  transcriptionLanguage: 'pl',
  structuringModel: 'openai/gpt-oss-120b',
  // Generous limit: Groq docs don't say whether reasoning tokens count towards it.
  structuringMaxTokens: 2000,
  structuringReasoningEffort: 'low',
  structuringTemperature: 0.2,
  requestTimeoutMs: 90_000,
} as const
