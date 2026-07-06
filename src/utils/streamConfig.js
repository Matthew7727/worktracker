/**
 * src/utils/streamConfig.js
 *
 * Workspace-level stream configuration. Streams (formerly the hardcoded
 * "Client Work" / "Practice Development" / "Business Development") are now
 * user-defined and stored in a config file INSIDE the workspace folder so the
 * config syncs across devices together with the markdown data.
 */
import { readFile, writeFile } from '../services/fileSystem'

export const CONFIG_FILENAME = 'worktracker.config.json'

// Colour palette matching the app's bold aesthetic. First three are the
// original stream colours; the rest come from the day-status family.
export const STREAM_PALETTE = [
  '#80b621', // green (original Client Work)
  '#ffd166', // yellow (original Practice Development)
  '#eb8449', // orange (original Business Development)
  '#4dabf7', // blue
  '#9c6ade', // purple
  '#ff6b6b', // coral
  '#4ecdc4', // teal
  '#f783ac', // pink
]

export const MAX_STREAMS = 5
export const MIN_STREAMS = 2

// The legacy trio. Ids intentionally match the historical object keys used
// throughout old entries' frontmatter so nothing needs rewriting on disk.
export const LEGACY_STREAMS = [
  {
    id: 'clientWork',
    name: 'Client Work',
    color: '#80b621',
    aliases: [],
    archived: false,
    mainFocus: true,
  },
  {
    id: 'practiceDevelopment',
    name: 'Practice Development',
    color: '#ffd166',
    aliases: [],
    archived: false,
    mainFocus: false,
  },
  {
    id: 'businessDevelopment',
    name: 'Business Development',
    color: '#eb8449',
    aliases: [],
    archived: false,
    mainFocus: false,
  },
]

export const slugify = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'stream'

export const createStream = (name, color, opts = {}) => ({
  id: opts.id || slugify(name),
  name: name.trim(),
  color: color || STREAM_PALETTE[0],
  aliases: opts.aliases || [],
  archived: false,
  mainFocus: !!opts.mainFocus,
})

export const createConfig = (streams, features = {}) => ({
  version: 1,
  createdAt: new Date().toISOString(),
  features: {
    utilisation: !!features.utilisation,
    projectHierarchy: !!features.projectHierarchy,
  },
  streams,
})

export const createLegacyConfig = () =>
  createConfig(
    LEGACY_STREAMS.map((s) => ({ ...s })),
    { utilisation: true, projectHierarchy: true }
  )

const getConfigPath = (rootDir) => `${rootDir}/${CONFIG_FILENAME}`

/** Ensures exactly one non-archived stream is flagged mainFocus. */
export const normalizeConfig = (config) => {
  if (!config || !Array.isArray(config.streams) || config.streams.length === 0)
    return null
  const streams = config.streams.map((s) => ({
    aliases: [],
    archived: false,
    mainFocus: false,
    ...s,
  }))
  const active = streams.filter((s) => !s.archived)
  if (active.length === 0) return null
  if (!active.some((s) => s.mainFocus)) {
    active[0].mainFocus = true
  } else {
    // Only one main focus allowed
    let found = false
    for (const s of streams) {
      if (s.mainFocus && !s.archived) {
        if (found) s.mainFocus = false
        found = true
      } else if (s.mainFocus && s.archived) {
        s.mainFocus = false
      }
    }
    if (!streams.some((s) => s.mainFocus)) active[0].mainFocus = true
  }
  return {
    version: 1,
    features: {
      utilisation: false,
      projectHierarchy: false,
      ...config.features,
    },
    ...config,
    streams,
  }
}

/**
 * Detects a pre-config workspace by looking for daily YYYY-MM-DD.md files.
 */
export const detectLegacyWorkspace = async (rootDir) => {
  if (!window.electronAPI) return false
  const result = await window.electronAPI.listAllFiles(rootDir)
  if (!result.success) return false
  return result.files.some((f) => {
    const name = f.split(/[\\/]/).pop()
    return /^\d{4}-\d{2}-\d{2}(_\d{6})?\.md$/.test(name)
  })
}

/**
 * Loads the workspace stream config.
 * - Config file exists  -> parsed config
 * - Legacy data on disk -> auto-creates the Deloitte-era config (zero-touch)
 * - Brand new workspace -> null (caller should run the setup flow)
 */
export const loadStreamConfig = async (rootDir) => {
  if (!rootDir) return null
  const result = await readFile(getConfigPath(rootDir))
  if (result.success) {
    try {
      const parsed = normalizeConfig(JSON.parse(result.data))
      if (parsed) return parsed
    } catch (e) {
      console.error('Failed to parse stream config, falling back', e)
    }
  }
  if (await detectLegacyWorkspace(rootDir)) {
    const legacy = createLegacyConfig()
    await saveStreamConfig(rootDir, legacy)
    return legacy
  }
  return null
}

export const saveStreamConfig = async (rootDir, config) => {
  await writeFile(getConfigPath(rootDir), JSON.stringify(config, null, 2))
  return config
}

// ── Selectors ───────────────────────────────────────────────────────────────

export const getActiveStreams = (config) =>
  (config?.streams || []).filter((s) => !s.archived)

export const getArchivedStreams = (config) =>
  (config?.streams || []).filter((s) => s.archived)

export const getStream = (config, id) =>
  (config?.streams || []).find((s) => s.id === id) || null

export const getMainFocusStream = (config) =>
  getActiveStreams(config).find((s) => s.mainFocus) ||
  getActiveStreams(config)[0] ||
  null

/**
 * Maps a markdown `# Heading` back to a stream via current name or aliases
 * (renames keep old names as aliases so history remains readable).
 */
export const getStreamByHeading = (config, heading) => {
  const target = heading.trim().toLowerCase()
  return (
    (config?.streams || []).find(
      (s) =>
        s.name.trim().toLowerCase() === target ||
        (s.aliases || []).some((a) => a.trim().toLowerCase() === target)
    ) || null
  )
}

// ── Mutations (all return a new config object) ─────────────────────────────

export const renameStream = (config, id, newName) => {
  const trimmed = newName.trim()
  if (!trimmed) return config
  return {
    ...config,
    streams: config.streams.map((s) =>
      s.id === id
        ? {
            ...s,
            name: trimmed,
            aliases:
              s.name.toLowerCase() === trimmed.toLowerCase()
                ? s.aliases
                : [...new Set([...(s.aliases || []), s.name])],
          }
        : s
    ),
  }
}

export const setStreamColor = (config, id, color) => ({
  ...config,
  streams: config.streams.map((s) => (s.id === id ? { ...s, color } : s)),
})

export const setMainFocus = (config, id) => ({
  ...config,
  streams: config.streams.map((s) => ({ ...s, mainFocus: s.id === id })),
})

export const setStreamArchived = (config, id, archived) =>
  normalizeConfig({
    ...config,
    streams: config.streams.map((s) => (s.id === id ? { ...s, archived } : s)),
  })

export const addStream = (config, name, color) => {
  const base = slugify(name)
  let id = base
  let n = 2
  while (config.streams.some((s) => s.id === id)) id = `${base}-${n++}`
  return {
    ...config,
    streams: [...config.streams, createStream(name, color, { id })],
  }
}

export const setFeature = (config, key, value) => ({
  ...config,
  features: { ...config.features, [key]: value },
})

/** Short label for chips/legends: "Practice Development" -> "PD". */
export const getStreamAbbrev = (streamOrName) => {
  const name =
    typeof streamOrName === 'string' ? streamOrName : streamOrName?.name
  if (!name) return '?'
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

/** Suggests the next unused palette colour. */
export const nextPaletteColor = (config) => {
  const used = new Set(getActiveStreams(config).map((s) => s.color))
  return STREAM_PALETTE.find((c) => !used.has(c)) || STREAM_PALETTE[0]
}
