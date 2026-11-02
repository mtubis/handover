import type { Handover, Observation, Task } from '../ai/handover'
import { MESSAGES } from '../i18n/dictionaries'
import type { Locale } from '../i18n/locale'
import type { Messages } from '../i18n/messages'

// A spelled-out month is unambiguous across languages ("10/21" reads differently in the US and the UK).
function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(date)
}

/** Used both as the first line of the message and as the e-mail subject. */
export function formatTitle(parentLabel: string, date: Date, locale: Locale): string {
  return MESSAGES[locale].handover.title(parentLabel, formatDate(date, locale))
}

function formatObservation(
  observation: Observation,
  parentLabel: string,
  t: Messages['handover'],
): string {
  const area = t.areas[observation.area]
  const source = observation.source === 'reported' ? ` (${t.reportedBy(parentLabel)})` : ''
  return `- ${area}${source}: ${observation.note}`
}

function formatTask({ task, owner }: Task): string {
  return owner ? `- [ ] ${owner}: ${task}` : `- [ ] ${task}`
}

function section(heading: string, lines: string[]): string | null {
  return lines.length > 0 ? [heading, ...lines].join('\n') : null
}

const bullet = (item: string) => `- ${item}`

export function formatMessage(
  handover: Handover,
  parentLabel: string,
  date: Date,
  locale: Locale,
): string {
  const t = MESSAGES[locale].handover
  const summary = handover.summary.trim()
  const sections = [
    formatTitle(parentLabel, date, locale),
    summary ? t.summary(parentLabel, summary) : null,
    section(
      t.observationsHeading,
      handover.observations.map((observation) => formatObservation(observation, parentLabel, t)),
    ),
    section(t.doneHeading, handover.done_during_visit.map(bullet)),
    section(t.tasksHeading, handover.tasks_for_next_visit.map(formatTask)),
    section(t.notCheckedHeading, handover.not_checked.map(bullet)),
    section(t.flagsHeading, handover.flags.map(bullet)),
  ]
  return sections.filter((part): part is string => part !== null).join('\n\n')
}
