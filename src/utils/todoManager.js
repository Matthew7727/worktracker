import { getDailyFilePath } from './fileHelpers'

/**
 * Parsed Todo Item structure
 * @typedef {Object} TodoItem
 * @property {string} id - Unique ID (timestamp + random)
 * @property {string} text - Task content
 * @property {boolean} completed - Is checked
 * @property {string|null} createdAt - ISO date the todo was created (survives rollover)
 * @property {boolean} important - Flagged as important
 */

/**
 * Parsed Lane structure
 * @typedef {Object} TodoLane
 * @property {string} title - Lane header (e.g. "To Do")
 * @property {TodoItem[]} items - List of tasks
 */

export const AGE_WARN_DAYS = 3
export const AGE_URGENT_DAYS = 7

/** Days since the todo was created (0 for today, null when unknown). */
export const getTodoAge = (item, now = new Date()) => {
  if (!item.createdAt) return null
  const created = new Date(item.createdAt)
  if (isNaN(created.getTime())) return null
  const diff = Math.floor(
    (new Date(now.toISOString().split('T')[0]) - new Date(item.createdAt)) /
      86400000
  )
  return Math.max(0, diff)
}

export const getAgeSeverity = (age) => {
  if (age === null) return 'none'
  if (age >= AGE_URGENT_DAYS) return 'urgent'
  if (age >= AGE_WARN_DAYS) return 'warn'
  return 'fresh'
}

/**
 * Generates the specific path for todo files: YYYY-MM-DD-todos.md
 */
export const getTodoFilePath = (rootDir, date) => {
  const dailyPath = getDailyFilePath(rootDir, date)
  if (!dailyPath) return ''
  return dailyPath.replace('.md', '-todos.md')
}

/**
 * Loads todos for a specific date
 * @returns {Promise<TodoLane[]>}
 */
export const loadDailyTodos = async (rootDir, date) => {
  if (!window.electronAPI) return getDefaultLanes()

  const filePath = getTodoFilePath(rootDir, date)
  const result = await window.electronAPI.readFile(filePath)

  if (result.success) {
    return parseTodoMarkdown(result.data)
  }

  // If file doesn't exist, check for rollover from previous days
  return await checkForRollover(rootDir, date)
}

const getDateFromTodoPath = (path) => {
  const basename = path.split(/[\\/]/).pop()
  return basename.replace('-todos.md', '')
}

const checkForRollover = async (rootDir, date) => {
  // 1. List all todo files
  const result = await window.electronAPI.listAllFiles(rootDir)
  if (!result.success) return getDefaultLanes()

  // 2. Filter for *-todos.md files
  const todoFiles = result.files.filter((f) => f.endsWith('-todos.md'))

  if (todoFiles.length === 0) return getDefaultLanes()

  // 3. Find the most recent file before today (ISO dates sort lexicographically)
  const todayPath = getTodoFilePath(rootDir, date)
  todoFiles.sort().reverse()

  const previousFile = todoFiles.find((f) => f < todayPath)

  if (!previousFile) return getDefaultLanes()

  // 4. Load that file
  const prevResult = await window.electronAPI.readFile(previousFile)
  if (!prevResult.success) return getDefaultLanes()

  const prevLanes = parseTodoMarkdown(prevResult.data)
  const prevFileDate = getDateFromTodoPath(previousFile)

  // 5. Migrate incomplete tasks, preserving lane titles and metadata.
  // Items with no created date inherit the source file's date so their age
  // is tracked from the last day we know they existed.
  const newLanesMap = new Map() // title -> items array
  const defaults = getDefaultLanes()
  defaults.forEach((l) => newLanesMap.set(l.title, [...l.items]))

  let rolloverCount = 0
  prevLanes.forEach((lane) => {
    const incompleteItems = lane.items.filter((i) => !i.completed)
    if (incompleteItems.length > 0) {
      if (!newLanesMap.has(lane.title)) {
        newLanesMap.set(lane.title, [])
      }
      const existingItems = newLanesMap.get(lane.title)

      incompleteItems.forEach((item) => {
        existingItems.push({
          ...item,
          createdAt: item.createdAt || prevFileDate,
        })
        rolloverCount++
      })
    }
  })

  // Convert map back to array
  const finalListLanes = Array.from(newLanesMap.entries()).map(
    ([title, items]) => ({ title, items })
  )

  if (rolloverCount > 0) {
    saveDailyTodos(rootDir, date, finalListLanes)
  }

  return finalListLanes
}

/**
 * Saves todos to markdown
 * @param {TodoLane[]} lanes
 */
export const saveDailyTodos = async (rootDir, date, lanes) => {
  if (!window.electronAPI) return

  const filePath = getTodoFilePath(rootDir, date)
  const content = serializeTodoMarkdown(lanes)

  await window.electronAPI.writeFile(filePath, content)
}

const getDefaultLanes = () => [{ title: 'General', items: [] }]

/**
 * Extracts `{created:YYYY-MM-DD !important}` metadata from a todo line.
 * The braces block stays human-readable in the raw markdown.
 */
export const parseTodoText = (raw) => {
  let text = raw
  let createdAt = null
  let important = false

  const metaMatch = text.match(/\s*\{([^{}]*)\}\s*$/)
  if (metaMatch) {
    const meta = metaMatch[1]
    const createdMatch = meta.match(/created:(\d{4}-\d{2}-\d{2})/)
    if (createdMatch) createdAt = createdMatch[1]
    important = /!important/.test(meta)
    if (createdMatch || important) {
      text = text.slice(0, metaMatch.index).trim()
    }
  }

  // Old rollovers prefixed the text; the age chip replaces that now
  text = text.replace(/^(\(Rollover\)\s*)+/, '')

  return { text, createdAt, important }
}

export const serializeTodoText = (item) => {
  const meta = []
  if (item.createdAt) meta.push(`created:${item.createdAt}`)
  if (item.important) meta.push('!important')
  return meta.length > 0 ? `${item.text} {${meta.join(' ')}}` : item.text
}

/**
 * Parses markdown into lanes.
 * Format:
 * # Lane Title
 * - [ ] Task {created:2026-07-06 !important}
 * - [x] Completed Task
 */
export const parseTodoMarkdown = (content) => {
  const lines = content.split('\n')
  const lanes = []
  let currentLane = null

  lines.forEach((line) => {
    const trimmed = line.trim()

    if (trimmed.startsWith('# ')) {
      // New Lane
      if (currentLane) lanes.push(currentLane)
      currentLane = {
        title: trimmed.substring(2).trim(),
        items: [],
      }
    } else if (trimmed.startsWith('- [') && currentLane) {
      // Task Item
      const isCompleted = trimmed.startsWith('- [x]')
      const { text, createdAt, important } = parseTodoText(
        trimmed.substring(5).trim()
      )
      currentLane.items.push({
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        text,
        completed: isCompleted,
        createdAt,
        important,
      })
    }
  })

  if (currentLane) lanes.push(currentLane)

  // If empty or malformed, return defaults
  return lanes.length > 0 ? lanes : getDefaultLanes()
}

/**
 * Aggregates todo statistics
 * @returns {Promise<{ today: { total: number, completed: number, byCategory: Object }, month: { completed: number }, year: { completed: number } }>}
 */
export const getTodoStats = async (rootDir) => {
  if (!window.electronAPI) return { today: {}, month: {}, year: {} }

  // 1. List all todo files
  const result = await window.electronAPI.listAllFiles(rootDir)
  if (!result.success) return { today: {}, month: {}, year: {} }

  const todoFiles = result.files.filter((f) => f.endsWith('-todos.md'))

  const stats = {
    today: { total: 0, completed: 0, byCategory: [] },
    month: { completed: 0 },
    year: { completed: 0 },
    allTimeCompleted: 0,
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() // 0-indexed
  const todayStr = new Date().toISOString().split('T')[0]

  // Helper to parse filename YYYY-MM-DD
  const getDateFromPath = (path) => {
    const basename = path.split(/[\\/]/).pop()
    const datePart = basename.replace('-todos.md', '')
    return new Date(datePart)
  }

  const filePromises = todoFiles.map(async (filePath) => {
    const fileRes = await window.electronAPI.readFile(filePath)
    if (!fileRes.success) return null

    const date = getDateFromPath(filePath)
    const lanes = parseTodoMarkdown(fileRes.data)

    let fileCompleted = 0
    lanes.forEach((lane) => {
      lane.items.forEach((item) => {
        if (item.completed) fileCompleted++
      })
    })

    const isToday = filePath.includes(todayStr)

    if (isToday) {
      lanes.forEach((lane) => {
        const laneTotal = lane.items.length
        const laneCompleted = lane.items.filter((i) => i.completed).length
        stats.today.total += laneTotal
        stats.today.completed += laneCompleted
        stats.today.byCategory.push({
          title: lane.title,
          total: laneTotal,
          completed: laneCompleted,
        })
      })
    }

    stats.allTimeCompleted += fileCompleted
    if (date.getFullYear() === currentYear) {
      stats.year.completed += fileCompleted
      if (date.getMonth() === currentMonth) {
        stats.month.completed += fileCompleted
      }
    }
  })

  await Promise.all(filePromises)

  return stats
}

const serializeTodoMarkdown = (lanes) => {
  return lanes
    .map((lane) => {
      const header = `# ${lane.title}`
      const items = lane.items
        .map((item) => {
          return `- [${item.completed ? 'x' : ' '}] ${serializeTodoText(item)}`
        })
        .join('\n')
      return `${header}\n${items}`
    })
    .join('\n\n')
}
