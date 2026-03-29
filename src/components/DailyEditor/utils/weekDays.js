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

// If today is a weekend, return Friday of current week; otherwise return today
export const getDefaultDate = () => {
  const today = new Date()
  const day = today.getDay()
  if (day === 0 || day === 6) {
    return getWeekDays(today)[4] // Friday
  }
  return today
}
