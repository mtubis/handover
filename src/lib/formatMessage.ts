import type { Area, Handover, Observation, Task } from '../ai/handover'

const AREA_LABELS: Record<Area, string> = {
  health: 'Zdrowie',
  sleep: 'Sen',
  mood: 'Nastrój',
  food: 'Jedzenie',
  medication: 'Leki',
  home: 'Dom',
  other: 'Inne',
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}`
}

/** Used both as the first line of the message and as the e-mail subject. */
export function formatTitle(parentLabel: string, date: Date): string {
  return `Handover · wizyta u ${parentLabel}, ${formatDate(date)}`
}

function formatObservation(observation: Observation, parentLabel: string): string {
  const area = AREA_LABELS[observation.area]
  const source = observation.source === 'reported' ? ` (wg ${parentLabel})` : ''
  return `- ${area}${source}: ${observation.note}`
}

function formatTask({ task, owner }: Task): string {
  return owner ? `- [ ] ${owner}: ${task}` : `- [ ] ${task}`
}

function section(heading: string, lines: string[]): string | null {
  return lines.length > 0 ? [heading, ...lines].join('\n') : null
}

const bullet = (item: string) => `- ${item}`

export function formatMessage(handover: Handover, parentLabel: string, date: Date): string {
  const summary = handover.summary.trim()
  const sections = [
    formatTitle(parentLabel, date),
    summary ? `Co u ${parentLabel}: ${summary}` : null,
    section(
      'Zauważyłam/em:',
      handover.observations.map((observation) => formatObservation(observation, parentLabel)),
    ),
    section('Zrobione:', handover.done_during_visit.map(bullet)),
    section('Do przejęcia:', handover.tasks_for_next_visit.map(formatTask)),
    section('Nie sprawdzono:', handover.not_checked.map(bullet)),
    section('Warto zwrócić uwagę:', handover.flags.map(bullet)),
  ]
  return sections.filter((part): part is string => part !== null).join('\n\n')
}
