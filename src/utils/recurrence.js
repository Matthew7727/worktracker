/**
 * Recurring todos.
 *
 * A recurring todo carries a `recurrence` object; plain todos leave it absent
 * so existing `projects.json` files need no migration. Only one instance of a
 * series is ever open at a time: ticking an instance keeps it (so completion
 * history stays intact) and spawns the next occurrence.
 *
 * All date maths is date-only and local-time, matching `taskUrgency.js`.
 */

export const FREQUENCIES = ['daily', 'weekdays', 'weekly', 'monthly', 'yearly']

export const ANCHORS = ['schedule', 'completion']

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const generateId = () =>
  Math.random().toString(36).substr(2, 9) + Date.now().toString(36)

export const toDateString = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const parseDateOnly = (value) => {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  return isNaN(date.getTime()) ? null : date
}

const addDays = (date, days) => {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  next.setDate(next.getDate() + days)
  return next
}

/**
 * Adds whole months/years without rolling into the following month: the 31st
 * of January plus one month lands on 28/29 February, not 2/3 March.
 */
const addMonths = (date, months) => {
  const targetMonth = date.getMonth() + months
  const candidate = new Date(date.getFullYear(), targetMonth, 1)
  const lastDayOfMonth = new Date(
    candidate.getFullYear(),
    candidate.getMonth() + 1,
    0
  ).getDate()
  return new Date(
    candidate.getFullYear(),
    candidate.getMonth(),
    Math.min(date.getDate(), lastDayOfMonth)
  )
}

/** A recurrence with every optional field filled in. */
export const normalizeRecurrence = (recurrence) => {
  if (!recurrence) return null
  const frequency = FREQUENCIES.includes(recurrence.frequency)
    ? recurrence.frequency
    : 'weekly'
  const interval = Math.max(1, Math.round(Number(recurrence.interval) || 1))
  const weekdays =
    frequency === 'weekly' && Array.isArray(recurrence.weekdays)
      ? [...new Set(recurrence.weekdays.filter((d) => d >= 0 && d <= 6))].sort(
          (a, b) => a - b
        )
      : []
  return {
    frequency,
    interval,
    weekdays,
    anchor: ANCHORS.includes(recurrence.anchor)
      ? recurrence.anchor
      : 'schedule',
    endDate: recurrence.endDate || null,
    count: recurrence.count ? Math.max(1, Math.round(recurrence.count)) : null,
    seriesId: recurrence.seriesId || generateId(),
    occurrence: Math.max(1, Math.round(recurrence.occurrence || 1)),
  }
}

export const createRecurrence = (options = {}) => normalizeRecurrence(options)

export const isRecurring = (task) => !!task?.recurrence

/** "Every 2 weeks on Mon, Wed" */
export const describeRecurrence = (recurrence) => {
  const rule = normalizeRecurrence(recurrence)
  if (!rule) return null
  const { frequency, interval, weekdays, anchor } = rule
  const every = interval === 1 ? 'Every' : `Every ${interval}`
  const unit = {
    daily: interval === 1 ? 'day' : 'days',
    weekdays: interval === 1 ? 'weekday' : 'weeks (weekdays)',
    weekly: interval === 1 ? 'week' : 'weeks',
    monthly: interval === 1 ? 'month' : 'months',
    yearly: interval === 1 ? 'year' : 'years',
  }[frequency]

  let label = `${every} ${unit}`
  if (frequency === 'weekly' && weekdays.length > 0) {
    label += ` on ${weekdays.map((day) => WEEKDAY_LABELS[day]).join(', ')}`
  }
  if (anchor === 'completion') label += ', after completion'
  return label
}

const nextWeeklyDate = (from, rule) => {
  const { interval, weekdays } = rule
  if (weekdays.length === 0) return addDays(from, 7 * interval)

  // Within the current week, jump to the next selected weekday; otherwise
  // skip ahead `interval` weeks and take the earliest selected weekday.
  const currentDay = from.getDay()
  const later = weekdays.find((day) => day > currentDay)
  if (later !== undefined) return addDays(from, later - currentDay)

  const weekStart = addDays(from, -currentDay)
  const nextWeekStart = addDays(weekStart, 7 * interval)
  return addDays(nextWeekStart, weekdays[0])
}

const nextWeekdayDate = (from, interval) => {
  // "Weekdays" means Mon–Fri; an interval > 1 steps whole weeks.
  let next = addDays(from, interval > 1 ? 7 * (interval - 1) + 1 : 1)
  while (next.getDay() === 0 || next.getDay() === 6) {
    next = addDays(next, 1)
  }
  return next
}

const advance = (from, rule) => {
  switch (rule.frequency) {
    case 'daily':
      return addDays(from, rule.interval)
    case 'weekdays':
      return nextWeekdayDate(from, rule.interval)
    case 'weekly':
      return nextWeeklyDate(from, rule)
    case 'monthly':
      return addMonths(from, rule.interval)
    case 'yearly':
      return addMonths(from, 12 * rule.interval)
    default:
      return addDays(from, rule.interval)
  }
}

/**
 * The due date of the occurrence following `task`.
 *
 * `schedule` anchors on the previous due date (so "every Monday" stays on
 * Mondays even when ticked late); `completion` anchors on the day it was
 * actually ticked. Returns null once the end date or count is reached.
 *
 * Missed occurrences are never backfilled — a schedule-anchored date that is
 * still in the past is rolled forward to the first future occurrence.
 */
export const getNextDueDate = (
  task,
  completedOn = toDateString(new Date())
) => {
  const rule = normalizeRecurrence(task?.recurrence)
  if (!rule) return null
  if (rule.count && rule.occurrence >= rule.count) return null

  const completedDate = parseDateOnly(completedOn) || new Date()
  const from =
    rule.anchor === 'completion'
      ? completedDate
      : parseDateOnly(task.dueDate) || completedDate

  let next = advance(from, rule)
  // Guard against an unbounded loop if a rule somehow fails to move forward.
  let guard = 0
  while (next <= completedDate && guard < 500) {
    next = advance(next, rule)
    guard += 1
  }

  const nextStr = toDateString(next)
  if (rule.endDate && nextStr > rule.endDate) return null
  return nextStr
}

/**
 * The next instance of a recurring task: same text/flags/subtasks, fresh id,
 * un-ticked, due on the next occurrence date. Returns null when the series
 * has ended.
 */
export const createNextOccurrence = (
  task,
  completedOn = toDateString(new Date())
) => {
  const rule = normalizeRecurrence(task?.recurrence)
  if (!rule) return null
  const dueDate = getNextDueDate(task, completedOn)
  if (!dueDate) return null

  return {
    ...task,
    id: generateId(),
    completed: false,
    completedAt: null,
    nextTaskId: null,
    createdAt: completedOn,
    dueDate,
    subtasks: (task.subtasks || []).map((subtask) => ({
      ...subtask,
      id: generateId(),
      completed: false,
      completedAt: null,
    })),
    recurrence: { ...rule, occurrence: rule.occurrence + 1 },
  }
}
