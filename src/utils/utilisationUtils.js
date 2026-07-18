import { getWeekKey } from './staffitManager'

// Utilisation is tracked on a fiscal cycle running 1 June -> 31 May, not the
// calendar year.
const CYCLE_START_MONTH = 5 // June, 0-indexed

export const getUtilisationCycleStart = (date = new Date()) => {
  const d = new Date(date)
  const year =
    d.getMonth() >= CYCLE_START_MONTH ? d.getFullYear() : d.getFullYear() - 1
  return new Date(year, CYCLE_START_MONTH, 1)
}

export const getUtilisationCycleEnd = (date = new Date()) => {
  const start = getUtilisationCycleStart(date)
  return new Date(start.getFullYear() + 1, CYCLE_START_MONTH, 0) // 31 May
}

/**
 * Predicted utilisation % for the current June->June cycle: the average of
 * (declared STAFFIT hours / standard hours) across every week logged so far
 * this cycle, i.e. "if the rest of the year tracks like it has so far,
 * you'll land here" — not a claim about hours actually worked this instant.
 * Returns null when there isn't enough data to predict from.
 */
export const getUtilisationPrediction = (
  staffitHours,
  standardWeeklyHours,
  asOf = new Date()
) => {
  if (!standardWeeklyHours) return null
  const cycleStart = getUtilisationCycleStart(asOf)
  const thisWeekKey = getWeekKey(asOf)

  const weeksInCycle = Object.entries(staffitHours || {}).filter(
    ([weekKey]) => weekKey >= getWeekKey(cycleStart) && weekKey <= thisWeekKey
  )
  if (weeksInCycle.length === 0) return null

  const totalHours = weeksInCycle.reduce((sum, [, h]) => sum + (h || 0), 0)
  const totalCapacity = weeksInCycle.length * standardWeeklyHours
  return Math.round((totalHours / totalCapacity) * 100)
}
