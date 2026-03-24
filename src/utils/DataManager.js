import { parseMarkdown, parseStreams } from './markdownParser'

/**
 * loads all daily entries from the project directory.
 * @param {string} rootDir
 * @returns {Promise<Array>} Array of entry objects { date, tags, content, path, streams, wordCount }
 */
export const loadAllEntries = async (rootDir) => {
  if (!window.electronAPI || !rootDir) return []

  try {
    // 1. Get all markdown files recursively
    const result = await window.electronAPI.listAllFiles(rootDir)
    if (!result.success) {
      console.error('Failed to list files:', result.error)
      return []
    }

    const files = result.files

    // 2. Process each file
    const filePromises = files.map(async (filePath) => {
      // Check if filename matches YYYY-MM-DD.md or YYYY-MM-DD_HHMMSS.md pattern
      const fileName = filePath.split(/[\\/]/).pop()
      const match = fileName.match(/^(\d{4}-\d{2}-\d{2})(_(\d{6}))?\.md$/)

      if (!match) return null // Skip non-daily files

      const dateStr = match[1]
      const timeStr = match[3] || '000000' // Default to start of day for old files

      // Construct a sortable key or full date object
      const hours = timeStr.substring(0, 2)
      const mins = timeStr.substring(2, 4)
      const secs = timeStr.substring(4, 6)
      const fullDateObj = new Date(`${dateStr}T${hours}:${mins}:${secs}`)

      // Read file content
      const fileResult = await window.electronAPI.readFile(filePath)
      if (!fileResult.success) return null

      // Parse content
      const { frontmatter, body } = parseMarkdown(fileResult.data)
      const streams = parseStreams(body)

      // Calculate word counts for each stream
      const getWordCount = (text) =>
        text
          ? text
              .trim()
              .split(/\s+/)
              .filter((w) => w.length > 0).length
          : 0

      const streamCounts = {
        clientWork: getWordCount(streams.clientWork),
        practiceDevelopment: getWordCount(streams.practiceDevelopment),
        businessDevelopment: getWordCount(streams.businessDevelopment),
      }

      const totalWords =
        streamCounts.clientWork +
        streamCounts.practiceDevelopment +
        streamCounts.businessDevelopment

      return {
        id: fileName.replace('.md', ''),
        date: dateStr,
        time: timeStr !== '000000' ? `${hours}:${mins}` : null,
        dateObj: fullDateObj,
        tags: frontmatter.tags || [],
        content: body,
        path: filePath,
        metadata: frontmatter,
        streams,
        streamCounts,
        totalWords,
      }
    })

    const results = await Promise.all(filePromises)

    // Filter out nulls and sort by date/time descending
    return results
      .filter((e) => e !== null)
      .sort((a, b) => b.dateObj - a.dateObj)
  } catch (e) {
    console.error('Error loading all entries:', e)
    return []
  }
}
