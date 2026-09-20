/** Entries within an export range: 'all', 'thisYear' or 'last30'. */
export const filterEntriesByRange = (entries, range, now = new Date()) => {
  if (range === 'last30') {
    const cutoff = new Date(now)
    cutoff.setDate(now.getDate() - 30)
    return entries.filter((e) => e.dateObj >= cutoff)
  }
  if (range === 'thisYear') {
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    return entries.filter((e) => e.dateObj >= startOfYear)
  }
  return entries
}

/** Filter entries for a review without losing compatibility with title links. */
export const filterEntries = (entries, filters = {}, now = new Date()) => {
  let result = filterEntriesByRange(entries, filters.range || 'all', now)
  if (filters.startDate) {
    result = result.filter((entry) => entry.date >= filters.startDate)
  }
  if (filters.endDate) {
    result = result.filter((entry) => entry.date <= filters.endDate)
  }
  if (filters.tag) {
    result = result.filter((entry) => entry.tags?.includes(filters.tag))
  }
  if (filters.workId) {
    result = result.filter(
      (entry) =>
        Object.values(entry.projectIdsByStream || {}).some((ids) =>
          ids.includes(filters.workId)
        ) ||
        (filters.workTitle &&
          Object.values(entry.projectsByStream || {}).some((titles) =>
            titles.includes(filters.workTitle)
          ))
    )
  }
  if (filters.goalId) {
    result = result.filter((entry) => {
      const streamGoals = Object.values(entry.metadata?.streamGoalIds || {})
      return (
        entry.metadata?.goalIds?.includes(filters.goalId) ||
        streamGoals.some((ids) => ids?.includes(filters.goalId))
      )
    })
  }
  return result
}

/**
 * Serialises entries for export.
 * @returns {{ content: string, extension: 'json' | 'md' }}
 */
export const buildExport = (entries, format, range, now = new Date()) => {
  if (format === 'json') {
    return { content: JSON.stringify(entries, null, 2), extension: 'json' }
  }
  let content = `# Work Tracker Export\n\nGenerated: ${now.toLocaleDateString()}\nRange: ${range}\n\n`
  entries.forEach((e) => {
    const timeHeader = e.time ? ` [${e.time}]` : ''
    content += `### ${e.date}${timeHeader}\n\n`
    if (e.tags && e.tags.length > 0) {
      content += `**Tags:** ${e.tags.join(', ')}\n\n`
    }
    content += `${e.content}\n\n`
  })
  content += `---\n\n`
  return { content, extension: 'md' }
}
