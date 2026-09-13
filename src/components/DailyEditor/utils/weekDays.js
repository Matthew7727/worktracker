// Returns an array of 5 Date objects [Mon, Tue, Wed, Thu, Fri] for the week containing refDate
export const getWeekDays = (refDate) => {
  const d = new Date(refDate)
  const day = d.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: 5 }, (_, i) => {
    const weekDay = new Date(monday)
    weekDay.setDate(monday.getDate() + i)
    return weekDay
  })
}

export const isWeekend = (date) => date.getDay() === 0 || date.getDay() === 6

// Saturday and Sunday for the week containing refDate. These are deliberately
// separate from getWeekDays: weekdays remain the default Entries experience.
export const getWeekendDays = (refDate) => {
  const friday = getWeekDays(refDate)[4]
  return [1, 2].map((offset) => {
    const weekendDay = new Date(friday)
    weekendDay.setDate(friday.getDate() + offset)
    return weekendDay
  })
}

const previousWorkingDay = (date) => {
  const previous = new Date(date)
  do {
    previous.setDate(previous.getDate() - 1)
  } while (isWeekend(previous))
  return previous
}

export const getDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Returns the most recent working days, oldest first. If the reference date is
// a weekend, Friday is treated as the most recent working day.
export const getRecentWorkingDays = (refDate, count = 5) => {
  if (count <= 0) return []

  let day = new Date(refDate)
  day.setHours(0, 0, 0, 0)
  while (isWeekend(day)) day = previousWorkingDay(day)

  const days = [new Date(day)]
  while (days.length < count) {
    day = previousWorkingDay(day)
    days.push(new Date(day))
  }
  return days.reverse()
}

// Counts consecutive logged working days. The current working day is allowed
// to be unfinished, while Saturday and Sunday neither count nor break a streak.
export const calculateWorkingDayStreak = (dateKeys, refDate = new Date()) => {
  const loggedDates = new Set(dateKeys)
  if (loggedDates.size === 0) return 0

  const reference = new Date(refDate)
  reference.setHours(0, 0, 0, 0)
  const referenceIsWeekend = isWeekend(reference)

  let cursor = new Date(reference)
  while (isWeekend(cursor)) cursor = previousWorkingDay(cursor)

  if (!loggedDates.has(getDateKey(cursor))) {
    if (referenceIsWeekend) return 0
    cursor = previousWorkingDay(cursor)
  }

  let streak = 0
  while (loggedDates.has(getDateKey(cursor))) {
    streak += 1
    cursor = previousWorkingDay(cursor)
  }
  return streak
}

// If today is a weekend, return Friday of current week; otherwise return today
export const getDefaultDate = () => {
  const today = new Date()
  const day = today.getDay()
  if (day === 0 || day === 6) {
    return getWeekDays(today)[4] // Friday
  }
  return today
}
