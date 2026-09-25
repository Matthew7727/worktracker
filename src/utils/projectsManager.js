import { readFile, writeFile } from '../services/fileSystem'
import { getActiveStreams, getMainFocusStream } from './streamConfig'
import {
  createNextOccurrence,
  isRecurring,
  normalizeRecurrence,
} from './recurrence'

const getProjectsFilePath = (rootDir) => `${rootDir}/projects.json`

const generateId = () =>
  Math.random().toString(36).substr(2, 9) + Date.now().toString(36)

const defaultData = () => ({ activities: [], clientProjects: [] })

// Pre-1.8 activity types map to the legacy stream ids
const LEGACY_ACTIVITY_TYPES = {
  PD: 'practiceDevelopment',
  BD: 'businessDevelopment',
}

export const loadProjects = async (rootDir) => {
  if (!rootDir) return defaultData()
  const result = await readFile(getProjectsFilePath(rootDir))
  if (!result.success) return defaultData()
  try {
    return { ...defaultData(), ...JSON.parse(result.data) }
  } catch {
    return defaultData()
  }
}

export const saveProjects = async (rootDir, data) => {
  await writeFile(getProjectsFilePath(rootDir), JSON.stringify(data, null, 2))
}

/** Resolves an activity's stream id, accepting legacy 'PD'/'BD' types. */
export const getActivityStreamId = (activity) =>
  LEGACY_ACTIVITY_TYPES[activity.type] || activity.streamId || activity.type

/**
 * Normalizes the raw projects.json shape into per-stream buckets.
 * - `clientProjects` belong to the main-focus stream (the project pipeline)
 * - `activities` belong to the stream referenced by their type/streamId
 *
 * @returns {{ byStream: Object, mainFocusProjects: Array, activities: Array }}
 */
export const groupProjectsByStream = (data, config) => {
  const streams = getActiveStreams(config)
  const mainFocus = getMainFocusStream(config)
  const byStream = {}
  streams.forEach((s) => {
    byStream[s.id] = []
  })

  const mainFocusProjects = (data.clientProjects || []).map((p) => ({
    ...p,
    streamId: mainFocus?.id,
  }))
  if (mainFocus && byStream[mainFocus.id]) {
    byStream[mainFocus.id].push(...mainFocusProjects)
  }

  const activities = (data.activities || []).map((a) => ({
    ...a,
    streamId: getActivityStreamId(a),
  }))
  activities.forEach((a) => {
    if (byStream[a.streamId]) byStream[a.streamId].push(a)
  })

  return { byStream, mainFocusProjects, activities }
}

export const createActivity = (title, streamId, options = {}) => ({
  id: generateId(),
  type: streamId, // stream id; legacy rows still carry 'PD' | 'BD'
  title,
  description: '',
  teamMembers: [],
  tasks: [],
  status: 'active',
  completedAt: null,
  createdAt: new Date().toISOString().split('T')[0],
  parentId: options.parentId ?? null,
  ongoing: !!options.ongoing,
  // New activities always sort after existing ones (which default to 0).
  order: Date.now(),
})

export const createClientProject = (title, options = {}) => ({
  id: generateId(),
  title,
  description: '',
  teamMembers: [],
  status: 'active',
  tasks: [],
  createdAt: new Date().toISOString().split('T')[0],
  completedAt: null,
  ongoing: !!options.ongoing,
})

// Sorts by the explicit `order` field. Legacy activities without one default
// to 0 and fall back to their original (insertion) order via a stable sort.
const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0)

/** Activities that don't belong inside another activity. */
export const getTopLevelActivities = (activities) =>
  (activities || []).filter((a) => !a.parentId).sort(byOrder)

/** Activities nested inside the given parent activity. */
export const getChildActivities = (activities, parentId) =>
  (activities || []).filter((a) => a.parentId === parentId).sort(byOrder)

/**
 * Re-orders a sibling group (either all top-level activities, or all
 * children of one parent) to match `orderedIds`, without touching any
 * other activities.
 *
 * @param {Array} activities - The full activities array
 * @param {Array<string>} orderedIds - Sibling ids in their new order
 * @returns {Array} A new activities array with updated `order` values
 */
export const reorderActivities = (activities, orderedIds) => {
  const orderMap = new Map(orderedIds.map((id, index) => [id, index]))
  return (activities || []).map((a) =>
    orderMap.has(a.id) ? { ...a, order: orderMap.get(a.id) } : a
  )
}

export const createTask = (text, options = {}) => {
  const recurrence = normalizeRecurrence(options.recurrence)
  const today = new Date().toISOString().split('T')[0]
  return {
    id: generateId(),
    text,
    completed: false,
    important: !!options.important,
    createdAt: today,
    // A recurring todo always needs a due date to anchor its next occurrence.
    dueDate: options.dueDate || (recurrence ? today : null),
    completedAt: null,
    subtasks: (options.subtasks || []).map((subtask) =>
      typeof subtask === 'string' ? createTask(subtask) : subtask
    ),
    goalIds: options.goalIds || [],
    ...(recurrence ? { recurrence } : {}),
  }
}

/**
 * Ticks or un-ticks a task in `tasks`, maintaining recurring series: ticking a
 * recurring task appends its next occurrence and remembers it via
 * `nextTaskId`, un-ticking removes that spawned occurrence again.
 */
export const toggleTaskCompletion = (tasks, taskId, today) => {
  const date = today || new Date().toISOString().split('T')[0]
  const target = (tasks || []).find((t) => t.id === taskId)
  if (!target) return { tasks: tasks || [], justCompleted: false }

  const nextCompleted = !target.completed
  const spawned =
    nextCompleted && isRecurring(target)
      ? createNextOccurrence(target, date)
      : null

  let updated = (tasks || []).map((task) =>
    task.id === taskId
      ? {
          ...task,
          completed: nextCompleted,
          completedAt: nextCompleted ? date : null,
          nextTaskId: nextCompleted ? spawned?.id || null : null,
        }
      : task
  )

  if (spawned) {
    updated = [...updated, spawned]
  } else if (!nextCompleted && target.nextTaskId) {
    // Undoing a completion: drop the occurrence it spawned, unless that
    // occurrence has itself been completed already.
    updated = updated.filter(
      (task) => task.id !== target.nextTaskId || task.completed
    )
  }

  return { tasks: updated, justCompleted: nextCompleted }
}

/**
 * Sets (or clears) a task's recurrence. Recurring todos always keep a due
 * date so the next occurrence has something to count from.
 */
export const setTaskRecurrence = (tasks, taskId, recurrence) => {
  const rule = normalizeRecurrence(recurrence)
  return (tasks || []).map((task) => {
    if (task.id !== taskId) return task
    if (!rule) {
      const { recurrence: _removed, ...rest } = task
      return rest
    }
    return {
      ...task,
      recurrence: {
        ...rule,
        seriesId: task.recurrence?.seriesId || rule.seriesId,
      },
      dueDate: task.dueDate || new Date().toISOString().split('T')[0],
    }
  })
}

/** Tasks completed on a specific date (YYYY-MM-DD). */
export const getTasksCompletedOn = (tasks, dateStr) =>
  (tasks || []).filter((t) => t.completed && t.completedAt === dateStr)
