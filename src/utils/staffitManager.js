import { readFile, writeFile } from '../services/fileSystem'
import { getWeekDays } from '../components/DailyEditor/utils/weekDays'

const getStaffitFilePath = (rootDir) => `${rootDir}/staffitHours.json`

/** The storage key for a date's week: its Monday, as YYYY-MM-DD. */
export const getWeekKey = (date) =>
  getWeekDays(date)[0].toISOString().split('T')[0]

/** Weekly client hours declared in STAFFIT, keyed by week-start (Monday). */
export const loadStaffitHours = async (rootDir) => {
  if (!rootDir) return {}
  const result = await readFile(getStaffitFilePath(rootDir))
  if (!result.success) return {}
  try {
    return JSON.parse(result.data)
  } catch {
    return {}
  }
}

export const saveStaffitHours = async (rootDir, data) => {
  await writeFile(getStaffitFilePath(rootDir), JSON.stringify(data, null, 2))
}

export const setHoursForWeek = async (rootDir, date, hours) => {
  const data = await loadStaffitHours(rootDir)
  const weekKey = getWeekKey(date)
  const next = { ...data, [weekKey]: hours }
  await saveStaffitHours(rootDir, next)
  return next
}
