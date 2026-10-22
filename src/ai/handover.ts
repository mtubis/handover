import { UserFacingError } from '../lib/errors'

export const AREAS = ['health', 'sleep', 'mood', 'food', 'medication', 'home', 'other'] as const
export const SOURCES = ['observed', 'reported'] as const

export type Area = (typeof AREAS)[number]
export type Source = (typeof SOURCES)[number]

export interface Observation {
  area: Area
  note: string
  source: Source
}

export interface Task {
  task: string
  owner: string | null
}

export interface Handover {
  summary: string
  observations: Observation[]
  done_during_visit: string[]
  tasks_for_next_visit: Task[]
  not_checked: string[]
  flags: string[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isOneOf<T extends string>(options: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && (options as readonly string[]).includes(value)
}

function isObservation(value: unknown): value is Observation {
  return (
    isRecord(value) &&
    isOneOf(AREAS, value.area) &&
    typeof value.note === 'string' &&
    isOneOf(SOURCES, value.source)
  )
}

function isTask(value: unknown): value is Task {
  return (
    isRecord(value) &&
    typeof value.task === 'string' &&
    (value.owner === null || typeof value.owner === 'string')
  )
}

export function isHandover(value: unknown): value is Handover {
  return (
    isRecord(value) &&
    typeof value.summary === 'string' &&
    Array.isArray(value.observations) &&
    value.observations.every(isObservation) &&
    isStringArray(value.done_during_visit) &&
    Array.isArray(value.tasks_for_next_visit) &&
    value.tasks_for_next_visit.every(isTask) &&
    isStringArray(value.not_checked) &&
    isStringArray(value.flags)
  )
}

const INVALID_RESPONSE_MESSAGE =
  'Nie udało się uporządkować notatki — odpowiedź AI miała nieoczekiwany format. Spróbuj ponownie.'

export function parseHandover(text: string): Handover {
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    throw new UserFacingError(INVALID_RESPONSE_MESSAGE)
  }
  if (!isHandover(value)) throw new UserFacingError(INVALID_RESPONSE_MESSAGE)
  return value
}
