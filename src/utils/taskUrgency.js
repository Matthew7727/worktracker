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
