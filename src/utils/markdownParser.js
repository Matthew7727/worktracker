import matter from 'gray-matter'
import { LEGACY_STREAMS, getStreamByHeading } from './streamConfig'

// Note: gray-matter is isomorphic but might rely on node built-ins like Buffer.
// Vite usually handles this, or we might need a polyfill configuration.

/**
 * Parses markdown content with frontmatter.
 * @param {string} fileContent - The raw file content
 * @returns {Object} { frontmatter, body }
 */
export const parseMarkdown = (fileContent) => {
  if (!fileContent) return { frontmatter: {}, body: '' }

  try {
    const { data, content } = matter(fileContent)
    return { frontmatter: data, body: content }
  } catch (e) {
    console.error('Failed to parse markdown', e)
    // Fallback: treat everything as body, empty frontmatter
    return { frontmatter: {}, body: fileContent }
  }
}

/**
 * Converts body and frontmatter back to a markdown string.
 * @param {string} body - The markdown content
 * @param {Object} frontmatter - The frontmatter object
 * @returns {string} The full file content with frontmatter
 */
export const stringifyMarkdown = (body, frontmatter) => {
  try {
    return matter.stringify(body, frontmatter)
  } catch (e) {
    console.error('Failed to stringify markdown', e)
    return body
  }
}

/**
 * Parses the markdown body into stream sections keyed by stream id.
 * Headings are matched against each stream's current name and its aliases
 * (renamed streams keep their old names as aliases), so historical files
 * keep working without any rewriting.
 *
 * @param {string} body - The markdown body content
 * @param {Array} streams - Stream definitions from the workspace config
 * @returns {Object} { [streamId]: content }
 */
export const parseStreams = (body, streams = LEGACY_STREAMS) => {
  const result = {}
  streams.forEach((s) => {
    result[s.id] = ''
  })

  if (!body) return result

  const config = { streams }
  const sections = body.split(/^# (.+)$/m)

  for (let i = 1; i < sections.length; i += 2) {
    const heading = sections[i]
    const content = sections[i + 1] ? sections[i + 1].trim() : ''
    const stream = getStreamByHeading(config, heading)
    if (stream && stream.id in result) {
      result[stream.id] = result[stream.id]
        ? `${result[stream.id]}\n\n${content}`
        : content
    }
  }

  return result
}

/**
 * Converts stream contents into a single markdown body string.
 * @param {Object} streamContents - { [streamId]: content }
 * @param {Array} streams - Stream definitions from the workspace config
 * @returns {string} The formatted markdown body
 */
export const stringifyStreams = (streamContents, streams = LEGACY_STREAMS) => {
  let body = ''
  streams.forEach((s) => {
    if (streamContents[s.id]) {
      body += `# ${s.name}\n${streamContents[s.id]}\n\n`
    }
  })
  return body.trim()
}

// Historical `type` values map onto the legacy stream ids so pre-1.8 data
// (and any in-flight objects using them) resolve to the right stream.
const LEGACY_TYPE_TO_STREAM = {
  client: 'clientWork',
  pd: 'practiceDevelopment',
  bd: 'businessDevelopment',
}

export const resolveEntryStreamId = (entry) =>
  entry.streamId || LEGACY_TYPE_TO_STREAM[entry.type] || entry.type

/**
 * Converts per-project entries into a stream-grouped markdown body.
 * Each project becomes a ## subheading within its stream section.
 * @param {Array} projectEntries - [{ title, streamId, content }]
 * @param {Array} streams - Stream definitions from the workspace config
 * @returns {string} The formatted markdown body
 */
export const stringifyProjectEntries = (
  projectEntries,
  streams = LEGACY_STREAMS
) => {
  let body = ''
  streams.forEach((s) => {
    const entries = projectEntries.filter(
      (p) => resolveEntryStreamId(p) === s.id && p.content?.trim()
    )
    if (entries.length > 0) {
      body += `# ${s.name}\n`
      entries.forEach((p) => {
        body += `## ${p.title}\n${p.content.trim()}\n\n`
      })
    }
  })
  return body.trim()
}

/**
 * Parses ## subheadings within a stream section back to project entries.
 * Returns null if no ## subheadings are found (indicates legacy format).
 * @param {string} streamContent - Content from a single stream section
 * @returns {Array|null} [{ title, content }] or null for legacy format
 */
export const parseStreamProjects = (streamContent) => {
  if (!streamContent) return []
  const lines = streamContent.split('\n')
  if (!lines.some((l) => l.startsWith('## '))) return null

  const entries = []
  let current = null
  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (current) entries.push(current)
      current = { title: line.slice(3).trim(), content: '' }
    } else if (current) {
      current.content += (current.content ? '\n' : '') + line
    }
  }
  if (current) entries.push(current)
  return entries.map((e) => ({ ...e, content: e.content.trim() }))
}
