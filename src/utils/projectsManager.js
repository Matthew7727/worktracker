import { readFile, writeFile } from '../services/fileSystem'

const getProjectsFilePath = (rootDir) => `${rootDir}/projects.json`

const generateId = () =>
  Math.random().toString(36).substr(2, 9) + Date.now().toString(36)

const defaultData = () => ({ activities: [], clientProjects: [] })

export const loadProjects = async (rootDir) => {
  if (!rootDir) return defaultData()
  const result = await readFile(getProjectsFilePath(rootDir))
  if (!result.success) return defaultData()
  try {
    return JSON.parse(result.data)
  } catch {
    return defaultData()
  }
}

export const saveProjects = async (rootDir, data) => {
  await writeFile(getProjectsFilePath(rootDir), JSON.stringify(data, null, 2))
}

export const createActivity = (title, type) => ({
  id: generateId(),
  type, // 'PD' | 'BD'
  title,
  tasks: [],
  status: 'active',
  completedAt: null,
  createdAt: new Date().toISOString().split('T')[0],
})

export const createClientProject = (title) => ({
  id: generateId(),
  title,
  status: 'active',
  createdAt: new Date().toISOString().split('T')[0],
  completedAt: null,
})

export const createTask = (text) => ({
  id: generateId(),
  text,
  completed: false,
})
