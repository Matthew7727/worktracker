import { readFile, writeFile } from '../services/fileSystem'
import { getGoalIds } from './DataManager'
import { stringifyMarkdown } from './markdownParser'

const getGoalsPath = (rootDir) => `${rootDir}/goals.json`
const id = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

export const createGoal = (year = new Date().getFullYear()) => ({
  id: id(),
  year,
  title: '',
  targetDate: `${year}-12-31`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

export const loadGoals = async (rootDir) => {
  if (!rootDir) return []
  const result = await readFile(getGoalsPath(rootDir))
  if (!result.success) return []
  try {
    const parsed = JSON.parse(result.data)
    return Array.isArray(parsed.goals) ? parsed.goals : []
  } catch {
    return []
  }
}

export const saveGoals = async (rootDir, goals) =>
  writeFile(getGoalsPath(rootDir), JSON.stringify({ goals }, null, 2))

const LEGACY_EVIDENCE_FIELDS = ['activityIds', 'taskIds', 'entryIds']
const withoutLegacyEvidence = (goal) => {
  const next = { ...goal }
  LEGACY_EVIDENCE_FIELDS.forEach((field) => delete next[field])
  return next
}

const updateTasks = (tasks, taskIds, goalId, remove = false) =>
  (tasks || []).map((task) => {
    const applies = taskIds.has(task.id)
    const current = task.goalIds || []
    const goalIds = remove
      ? current.filter((id) => id !== goalId)
      : applies
        ? [...new Set([...current, goalId])]
        : current
    return {
      ...task,
      goalIds,
      subtasks: updateTasks(task.subtasks, taskIds, goalId, remove),
    }
  })

const updateOwners = (owners, activityIds, taskIds, goalId, remove = false) =>
  (owners || []).map((owner) => {
    const current = owner.goalIds || []
    const goalIds = remove
      ? current.filter((id) => id !== goalId)
      : activityIds.has(owner.id)
        ? [...new Set([...current, goalId])]
        : current
    return {
      ...owner,
      goalIds,
      tasks: updateTasks(owner.tasks, taskIds, goalId, remove),
    }
  })

const writeEntryGoalIds = async (entry, goalId, remove = false) => {
  const current = getGoalIds(entry.metadata)
  const goalIds = remove
    ? current.filter((id) => id !== goalId)
    : [...new Set([...current, goalId])]
  const streamGoalIds = Object.fromEntries(
    Object.entries(entry.metadata?.streamGoalIds || {}).map(([stream, ids]) => [
      stream,
      (ids || []).filter((id) => id !== goalId),
    ])
  )
  return writeFile(
    entry.path,
    stringifyMarkdown(entry.content || '', {
      ...entry.metadata,
      goalIds,
      streamGoalIds,
      lastModified: new Date().toISOString(),
    })
  )
}

/** Moves legacy goal-owned evidence lists to the canonical linked records. */
export const migrateLegacyGoalEvidence = async (
  rootDir,
  goals,
  projects,
  entries
) => {
  const legacyGoals = (goals || []).filter((goal) =>
    LEGACY_EVIDENCE_FIELDS.some((field) => goal[field]?.length)
  )
  if (!legacyGoals.length) return { goals, projects, migrated: false }

  let nextProjects = projects
  for (const goal of legacyGoals) {
    const activityIds = new Set(goal.activityIds || [])
    const taskIds = new Set(goal.taskIds || [])
    nextProjects = {
      ...nextProjects,
      activities: updateOwners(
        nextProjects.activities,
        activityIds,
        taskIds,
        goal.id
      ),
      clientProjects: updateOwners(
        nextProjects.clientProjects,
        activityIds,
        taskIds,
        goal.id
      ),
    }
    await Promise.all(
      entries
        .filter((entry) => (goal.entryIds || []).includes(entry.id))
        .map((entry) => writeEntryGoalIds(entry, goal.id))
    )
  }

  const nextGoals = goals.map(withoutLegacyEvidence)
  await Promise.all([
    writeFile(
      `${rootDir}/projects.json`,
      JSON.stringify(nextProjects, null, 2)
    ),
    saveGoals(rootDir, nextGoals),
  ])
  return { goals: nextGoals, projects: nextProjects, migrated: true }
}

/** Removes a goal and all of its canonical evidence references. */
export const removeGoalEvidence = async (
  rootDir,
  goalId,
  projects,
  entries
) => {
  const none = new Set()
  const nextProjects = {
    ...projects,
    activities: updateOwners(projects.activities, none, none, goalId, true),
    clientProjects: updateOwners(
      projects.clientProjects,
      none,
      none,
      goalId,
      true
    ),
  }
  await Promise.all([
    writeFile(
      `${rootDir}/projects.json`,
      JSON.stringify(nextProjects, null, 2)
    ),
    ...entries
      .filter((entry) => getGoalIds(entry.metadata).includes(goalId))
      .map((entry) => writeEntryGoalIds(entry, goalId, true)),
  ])
  return nextProjects
}
