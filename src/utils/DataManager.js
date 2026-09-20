import { parseMarkdown, parseStreams } from './markdownParser'
import { LEGACY_STREAMS } from './streamConfig'

// Legacy frontmatter keys map to the original stream ids
const LEGACY_FRONTMATTER_KEYS = {
  clientProjects: 'clientWork',
  pdActivities: 'practiceDevelopment',
  bdActivities: 'businessDevelopment',
}

/**
 * Reads the per-stream project titles from an entry's frontmatter,
 * supporting both the generic `projects` map and the legacy keys.
 */
export const getProjectsByStream = (frontmatter) => {
  const byStream = {}
  if (frontmatter.projects && typeof frontmatter.projects === 'object') {
    Object.entries(frontmatter.projects).forEach(([streamId, titles]) => {
      if (Array.isArray(titles) && titles.length > 0)
        byStream[streamId] = titles
    })
  }
  Object.entries(LEGACY_FRONTMATTER_KEYS).forEach(([key, streamId]) => {
    if (Array.isArray(frontmatter[key]) && frontmatter[key].length > 0) {
      byStream[streamId] = [
        ...new Set([...(byStream[streamId] || []), ...frontmatter[key]]),
      ]
    }
  })
  return byStream
}

/**
 * Stable project/activity references for an entry. New entries write these
 * alongside the human-readable `projects` map, so renamed work keeps its
 * history while older Markdown remains fully readable.
 */
export const getProjectIdsByStream = (frontmatter) => {
  const byStream = {}
  if (frontmatter.projectIds && typeof frontmatter.projectIds === 'object') {
    Object.entries(frontmatter.projectIds).forEach(([streamId, ids]) => {
      if (Array.isArray(ids) && ids.length > 0) byStream[streamId] = ids
    })
  }
  return byStream
}

/**
 * Canonical work links. `projectLinks` keeps an id and a display snapshot
 * together, avoiding the positional-array corruption possible with the
 * earlier `projects` + `projectIds` representation.
 */
export const getProjectLinksByStream = (frontmatter) => {
  if (
    frontmatter.projectLinks &&
    typeof frontmatter.projectLinks === 'object'
  ) {
    return Object.fromEntries(
      Object.entries(frontmatter.projectLinks).map(([streamId, links]) => [
        streamId,
        (Array.isArray(links) ? links : [])
          .filter((link) => link && typeof link.title === 'string')
          .map((link) => ({ id: link.id || null, title: link.title })),
      ])
    )
  }
  const titlesByStream = getProjectsByStream(frontmatter)
  const idsByStream = getProjectIdsByStream(frontmatter)
  return Object.fromEntries(
    Object.entries(titlesByStream).map(([streamId, titles]) => [
      streamId,
      titles.map((title, index) => ({
        // Older data may have sparse/non-aligned IDs. Treat a missing ID as
        // unresolved instead of risking an incorrect association.
        id: idsByStream[streamId]?.[index] || null,
        title,
      })),
    ])
  )
}

/** Whole-entry goal links, including a read-only fallback for older files. */
export const getGoalIds = (frontmatter = {}) => [
  ...new Set([
    ...(frontmatter.goalIds || []),
    ...Object.values(frontmatter.streamGoalIds || {}).flat(),
  ]),
]

/**
 * loads all daily entries from the project directory.
 * @param {string} rootDir
 * @param {Array} streams - Stream definitions from the workspace config
 * @returns {Promise<Array>} Array of entry objects { date, tags, content, path, streams, streamCounts, totalWords }
 */
export const loadAllEntries = async (rootDir, streams = LEGACY_STREAMS) => {
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
      const parsedStreams = parseStreams(body, streams)

      // Calculate word counts for each stream
      const getWordCount = (text) =>
        text
          ? text
              .trim()
              .split(/\s+/)
              .filter((w) => w.length > 0).length
          : 0

      const streamCounts = {}
      let totalWords = 0
      streams.forEach((s) => {
        streamCounts[s.id] = getWordCount(parsedStreams[s.id])
        totalWords += streamCounts[s.id]
      })

      return {
        id: fileName.replace('.md', ''),
        date: dateStr,
        time: timeStr !== '000000' ? `${hours}:${mins}` : null,
        dateObj: fullDateObj,
        tags: frontmatter.tags || [],
        content: body,
        path: filePath,
        metadata: frontmatter,
        projectLinksByStream: getProjectLinksByStream(frontmatter),
        projectsByStream: getProjectsByStream(frontmatter),
        projectIdsByStream: getProjectIdsByStream(frontmatter),
        streams: parsedStreams,
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

const DEFAULT_MENTION_WINDOW_DAYS = 90

/**
 * How often each activity/project title has come up in daily entries within
 * a trailing window — a proxy for how much non-client time something is
 * actually taking, since we can't tie PD/BD work to hours the way STAFFIT
 * ties client work to hours.
 *
 * @returns {{ byId: Object<string, number>, byTitle: Object<string, number>, byStream: Object<string, number> }}
 */
export const getEntryMentionCounts = (
  entries,
  windowDays = DEFAULT_MENTION_WINDOW_DAYS
) => {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - windowDays)
  const cutoffStr = cutoff.toISOString().split('T')[0]

  const byTitle = {}
  const byId = {}
  const byStream = {}

  entries.forEach((entry) => {
    if (entry.date < cutoffStr) return
    const linksByStream = entry.projectLinksByStream || {}
    Object.entries(linksByStream).forEach(([streamId, links]) => {
      links.forEach(({ id, title }) => {
        byTitle[title] = (byTitle[title] || 0) + 1
        byStream[streamId] = (byStream[streamId] || 0) + 1
        if (id) {
          byId[id] = (byId[id] || 0) + 1
        }
      })
    })
  })

  return { byId, byTitle, byStream }
}
