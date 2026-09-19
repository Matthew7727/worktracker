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
