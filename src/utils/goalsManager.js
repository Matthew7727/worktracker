import { readFile, writeFile } from '../services/fileSystem'

const getGoalsPath = (rootDir) => `${rootDir}/goals.json`
const id = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

export const createGoal = (year = new Date().getFullYear()) => ({
  id: id(),
  year,
  title: '',
  targetDate: `${year}-12-31`,
  activityIds: [],
  taskIds: [],
  entryIds: [],
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
