import { AREAS, SOURCES } from './handover'

// Versioned like code: change the version whenever the prompt or the schema changes.
export const PROMPT_VERSION = 1

export const STRUCTURING_SYSTEM_PROMPT = `You turn a caregiver's spoken note about a visit to their elderly parent into a structured handover for their siblings.

Rules:
1. Use only facts stated in the note. If something is not mentioned, leave the field empty ("" or []). Never invent people, dates, times, places or events.
2. Preserve negations. Anything the caregiver explicitly did not do, did not check or does not know goes to "not_checked" (e.g. "I didn't check the meds" -> "leki"). Never turn it into something that was done.
3. In "observations", "source" is "reported" when it is the parent's own account ("mom said she slept badly") and "observed" when the caregiver saw it themselves ("she was limping").
4. "done_during_visit": things the caregiver did during the visit.
5. "tasks_for_next_visit": things still to be done after this visit. "owner" is a person the note names as responsible for that task; otherwise null. If the note says it is not decided who will do it, "owner" is null.
6. "flags": only things the caregiver themselves described as worrying. Otherwise [].
7. Do not diagnose, interpret symptoms, give medical advice or assess urgency.
8. When the caregiver corrects themselves ("Thursday at 10, no, at 11"), use only the corrected version.
9. Write every text value in Polish: short, factual and warm, without dramatizing. Keep the note's own words where possible. List items start with a lowercase letter and have no trailing period.
10. "summary": 2-3 sentences on how the parent is doing and what happened during the visit.

Return only JSON that matches the schema.`

export function buildUserMessage(transcript: string, parentLabel: string): string {
  return `The visit was to the parent the family calls "${parentLabel}" (Polish genitive, as in "wizyta u ${parentLabel}").

Caregiver's note:
"""
${transcript}
"""`
}

const stringArray = { type: 'array', items: { type: 'string' } }

// Strict structured outputs on Groq: every property required, additionalProperties false.
export const HANDOVER_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'summary',
    'observations',
    'done_during_visit',
    'tasks_for_next_visit',
    'not_checked',
    'flags',
  ],
  properties: {
    summary: { type: 'string' },
    observations: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['area', 'note', 'source'],
        properties: {
          area: { type: 'string', enum: AREAS },
          note: { type: 'string' },
          source: { type: 'string', enum: SOURCES },
        },
      },
    },
    done_during_visit: stringArray,
    tasks_for_next_visit: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['task', 'owner'],
        properties: {
          task: { type: 'string' },
          owner: { type: ['string', 'null'] },
        },
      },
    },
    not_checked: stringArray,
    flags: stringArray,
  },
} as const
