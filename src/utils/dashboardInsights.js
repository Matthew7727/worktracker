import { getUtilisationCycleStart } from './utilisationUtils'
import { getWeekKey } from './staffitManager'

/** Monday (local) of the week containing `date`, at 00:00. */
const getMonday = (date) => {
  const d = new Date(date)
  const dow = d.getDay()
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

const toDateStr = (date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

const DEFAULT_WINDOW_DAYS = 90

// ── Tags ──────────────────────────────────────────────────────────────────

/**
 * Frequency of each tag across daily entries within a trailing window.
 * @returns {Array<{ tag: string, count: number }>} sorted desc by count.
 */
export const getTagCounts = (entries, windowDays = DEFAULT_WINDOW_DAYS) => {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - windowDays)
  const cutoffStr = toDateStr(cutoff)

  const counts = {}
  ;(entries || []).forEach((entry) => {
    if (entry.date < cutoffStr) return
    ;(entry.tags || []).forEach((raw) => {
      const tag = String(raw).trim()
      if (!tag) return
      counts[tag] = (counts[tag] || 0) + 1
    })
  })

  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}

// ── Collaborators ───────────────────────────────────────────────────────────

/**
 * People named in project/activity `teamMembers`, ranked by how many pieces
 * of work they appear on.
 * @returns {Array<{ name: string, count: number }>} sorted desc.
 */
export const getCollaborators = (projects) => {
  const counts = {}
  const items = [
    ...(projects?.clientProjects || []),
    ...(projects?.activities || []),
  ]
  items.forEach((item) => {
    ;(item.teamMembers || []).forEach((raw) => {
      const name = String(raw).trim()
      if (!name) return
      counts[name] = (counts[name] || 0) + 1
    })
  })
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

/** Initials for an avatar, e.g. "Jordan Smith" -> "JS". */
export const getInitials = (name) => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
  if (parts.length === 0 || !parts[0]) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// ── Tasks (throughput + totals) ─────────────────────────────────────────────

/** Flattens every task and subtask across all projects and activities. */
const flattenTasks = (projects) => {
  const items = [
    ...(projects?.clientProjects || []),
    ...(projects?.activities || []),
  ]
  const all = []
  items.forEach((item) => {
    ;(item.tasks || []).forEach((t) => {
      all.push(t)
      ;(t.subtasks || []).forEach((s) => all.push(s))
    })
  })
  return all
}

/**
 * Count of tasks (and subtasks) completed in each of the last `weeks` weeks,
 * bucketed by the Monday that starts the week.
 * @returns {Array<{ weekStart: Date, count: number }>} oldest -> newest.
 */
export const getTasksClosedPerWeek = (projects, weeks = 8) => {
  const thisMonday = getMonday(new Date())
  const buckets = Array.from({ length: weeks }, (_, i) => {
    const start = new Date(thisMonday)
    start.setDate(start.getDate() - (weeks - 1 - i) * 7)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    return { weekStart: start, end, count: 0 }
  })

  flattenTasks(projects).forEach((t) => {
    if (!t.completed || !t.completedAt) return
    const done = new Date(t.completedAt)
    buckets.forEach((b) => {
      if (done >= b.weekStart && done < b.end) b.count += 1
    })
  })

  return buckets.map(({ weekStart, count }) => ({ weekStart, count }))
}

/**
 * Aggregate task figures used by the throughput summary and the hero.
 * @returns {{ open: number, closedThisCycle: number, subtasksDone: number, subtasksTotal: number, lastWeek: number, prevWeek: number }}
 */
export const getTaskTotals = (projects, asOf = new Date()) => {
  const cycleStart = toDateStr(getUtilisationCycleStart(asOf))
  const all = flattenTasks(projects)

  let open = 0
  let closedThisCycle = 0
  let subtasksDone = 0
  let subtasksTotal = 0

  all.forEach((t) => {
    if (t.completed) {
      if (t.completedAt && t.completedAt >= cycleStart) closedThisCycle += 1
    } else {
      open += 1
    }
  })

  // Subtask completion across active work only (a "how close are we" gauge).
  const activeItems = [
    ...(projects?.clientProjects || []).filter((p) => p.status === 'active'),
    ...(projects?.activities || []).filter((a) => a.status === 'active'),
  ]
  activeItems.forEach((item) => {
    ;(item.tasks || []).forEach((t) => {
      ;(t.subtasks || []).forEach((s) => {
        subtasksTotal += 1
        if (s.completed) subtasksDone += 1
      })
    })
  })

  const perWeek = getTasksClosedPerWeek(projects, 2)
  const lastWeek = perWeek[perWeek.length - 1]?.count || 0
  const prevWeek = perWeek[perWeek.length - 2]?.count || 0

  return {
    open,
    closedThisCycle,
    subtasksDone,
    subtasksTotal,
    lastWeek,
    prevWeek,
  }
}

// ── Wellbeing / time off ────────────────────────────────────────────────────

/**
 * Counts of each non-working day status (pto / sick / volunteering) recorded
 * in daily entries during the current utilisation cycle.
 * @returns {{ pto: number, sick: number, volunteering: number }}
 */
export const getWellbeingCounts = (entries, asOf = new Date()) => {
  const cycleStart = toDateStr(getUtilisationCycleStart(asOf))
  const counts = { pto: 0, sick: 0, volunteering: 0 }
  ;(entries || []).forEach((entry) => {
    if (entry.date < cycleStart) return
    const status = entry.metadata?.dayStatus
    if (status && status !== 'working' && counts[status] !== undefined) {
      counts[status] += 1
    }
  })
  return counts
}

// ── Utilisation cycle / STAFFIT ─────────────────────────────────────────────

const TOTAL_CYCLE_WEEKS = 52

/**
 * Weekly STAFFIT hours for the current cycle so far, plus where we are in it.
 * @returns {{ weeks: Array<{ weekStart: Date, hours: number }>, weekNumber: number, totalWeeks: number }}
 */
export const getCycleWeeks = (staffitHours, asOf = new Date()) => {
  const cycleStartMonday = getMonday(getUtilisationCycleStart(asOf))
  const thisMonday = getMonday(asOf)

  const weeks = []
  const cursor = new Date(cycleStartMonday)
  while (cursor <= thisMonday && weeks.length < TOTAL_CYCLE_WEEKS) {
    const key = getWeekKey(cursor)
    weeks.push({
      weekStart: new Date(cursor),
      hours: (staffitHours || {})[key] || 0,
    })
    cursor.setDate(cursor.getDate() + 7)
  }

  return {
    weeks,
    weekNumber: weeks.length,
    totalWeeks: TOTAL_CYCLE_WEEKS,
  }
}

// ── Misc ────────────────────────────────────────────────────────────────────

/** Time-of-day greeting. */
export const getGreeting = (date = new Date()) => {
  const h = date.getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}
