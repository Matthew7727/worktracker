import { getItemAge } from './ageUtils'

const DAY_MS = 86400000

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate())

const parseDateOnly = (value) => {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  return isNaN(date.getTime()) ? null : date
}

const formatShortDate = (value) => {
  const date = parseDateOnly(value)
  if (!date) return null
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export const getTaskDueInDays = (task, now = new Date()) => {
  const due = parseDateOnly(task?.dueDate)
  if (!due) return null
  return Math.round((due - startOfDay(now)) / DAY_MS)
}

export const getTaskDueSeverity = (task, now = new Date()) => {
  const days = getTaskDueInDays(task, now)
  if (days === null) return 'none'
  if (days < 0) return 'overdue'
  if (days <= 2) return 'soon'
  return 'scheduled'
}

export const getTaskDueLabel = (task, now = new Date()) => {
  const days = getTaskDueInDays(task, now)
  if (days === null) return null
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  return `Due ${formatShortDate(task.dueDate)}`
}

export const isTaskDueThisWeek = (task, now = new Date()) => {
  const days = getTaskDueInDays(task, now)
  if (days === null) return false
  const endOfWeek = 6 - startOfDay(now).getDay()
  return days >= 0 && days <= endOfWeek
}

/** Sunday (local) ending the Monday-start week containing `date`, at 00:00. */
const endOfCalendarWeek = (date) => {
  const day = startOfDay(date)
  const dow = day.getDay()
  day.setDate(day.getDate() + (dow === 0 ? 0 : 7 - dow))
  return day
}

export const DUE_BUCKETS = [
  { key: 'overdue', label: 'Overdue' },
  { key: 'today', label: 'Due today' },
  { key: 'thisWeek', label: 'Due this week' },
  { key: 'nextWeek', label: 'Due next week' },
  { key: 'thisMonth', label: 'Due this month' },
  { key: 'later', label: 'Due later' },
  { key: 'none', label: 'No due date' },
]

export const getTaskDueBucket = (task, now = new Date()) => {
  const due = parseDateOnly(task?.dueDate)
  if (!due) return 'none'
  const today = startOfDay(now)
  if (due < today) return 'overdue'
  if (due.getTime() === today.getTime()) return 'today'
  const weekEnd = endOfCalendarWeek(now)
  if (due <= weekEnd) return 'thisWeek'
  const nextWeekEnd = new Date(weekEnd)
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 7)
  if (due <= nextWeekEnd) return 'nextWeek'
  if (
    due.getFullYear() === today.getFullYear() &&
    due.getMonth() === today.getMonth()
  ) {
    return 'thisMonth'
  }
  return 'later'
}

const urgencyRank = (task, now = new Date()) => {
  const dueInDays = getTaskDueInDays(task, now)
  const age = getItemAge(task, now) ?? -1
  return {
    bucket: dueInDays === null ? 1 : 0,
    dueInDays: dueInDays ?? Number.MAX_SAFE_INTEGER,
    importantRank: task.important ? 0 : 1,
    ageRank: -age,
    createdAt: task.createdAt || '',
  }
}

export const sortTasksByUrgency = (tasks, now = new Date()) =>
  [...(tasks || [])].sort((a, b) => {
    const left = urgencyRank(a, now)
    const right = urgencyRank(b, now)
    if (left.bucket !== right.bucket) return left.bucket - right.bucket
    if (left.dueInDays !== right.dueInDays)
      return left.dueInDays - right.dueInDays
    if (left.importantRank !== right.importantRank) {
      return left.importantRank - right.importantRank
    }
    if (left.ageRank !== right.ageRank) return left.ageRank - right.ageRank
    return left.createdAt.localeCompare(right.createdAt)
  })
