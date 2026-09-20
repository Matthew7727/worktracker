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
  const cycleMonday = new Date(getWeekKey(cycleStart) + 'T12:00:00')
  const thisMonday = new Date(getWeekKey(asOf) + 'T12:00:00')
  const elapsedWeeks =
    Math.floor((thisMonday - cycleMonday) / (7 * 24 * 60 * 60 * 1000)) + 1
  const declaredWeeks = Object.entries(staffitHours || {}).filter(
    ([weekKey]) =>
      weekKey >= getWeekKey(cycleStart) && weekKey <= getWeekKey(asOf)
  )
  if (declaredWeeks.length === 0) return null

  // A forecast must include capacity elapsed even when a weekly declaration
  // has not been entered. Otherwise it silently reports an optimistic average
  // of only completed weeks.
  const totalHours = declaredWeeks.reduce((sum, [, h]) => sum + (h || 0), 0)
  const totalCapacity = elapsedWeeks * standardWeeklyHours
  return Math.round((totalHours / totalCapacity) * 100)
}

export const getUtilisationCoverage = (staffitHours, asOf = new Date()) => {
  const cycleStart = getUtilisationCycleStart(asOf)
  const cycleMonday = new Date(getWeekKey(cycleStart) + 'T12:00:00')
  const thisMonday = new Date(getWeekKey(asOf) + 'T12:00:00')
  const elapsedWeeks =
    Math.floor((thisMonday - cycleMonday) / (7 * 24 * 60 * 60 * 1000)) + 1
  const declaredWeeks = Object.keys(staffitHours || {}).filter(
    (key) => key >= getWeekKey(cycleStart) && key <= getWeekKey(asOf)
  ).length
  return {
    elapsedWeeks,
    declaredWeeks,
    missingWeeks: elapsedWeeks - declaredWeeks,
  }
}
