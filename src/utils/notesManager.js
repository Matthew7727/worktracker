import {
  readFile,
  writeFile,
  deleteFile,
  listAllFiles,
} from '../services/fileSystem'
import { parseMarkdown, stringifyMarkdown } from './markdownParser'

// Notes are each their own markdown file:
//   - Linked to an activity: [rootDir]/notes/<activityId>/<noteId>.md
//   - Free-standing (not linked): [rootDir]/notes/<noteId>.md
const getNotesDir = (rootDir) => `${rootDir}/notes`

const generateId = () =>
  Math.random().toString(36).substr(2, 9) + Date.now().toString(36)

export const getNoteFilePath = (rootDir, note) =>
  note.activityId
    ? `${getNotesDir(rootDir)}/${note.activityId}/${note.id}.md`
    : `${getNotesDir(rootDir)}/${note.id}.md`

export const createNote = (options = {}) => ({
  id: generateId(),
  title: options.title || '',
  activityId: options.activityId || null,
  activityTitle: options.activityTitle || null,
  content: options.content || '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

const noteFromFile = (filePath, raw) => {
  const { frontmatter, body } = parseMarkdown(raw)
  return {
    id: frontmatter.id || filePath.split(/[\\/]/).pop().replace(/\.md$/, ''),
    title: frontmatter.title || '',
    activityId: frontmatter.activityId || null,
    activityTitle: frontmatter.activityTitle || null,
    createdAt: frontmatter.createdAt || null,
    updatedAt: frontmatter.updatedAt || null,
    content: body,
    filePath,
  }
}

const noteToFileContent = (note) =>
  stringifyMarkdown(note.content || '', {
    id: note.id,
    title: note.title || '',
    activityId: note.activityId || null,
    activityTitle: note.activityTitle || null,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  })

/** Loads every note stored under [rootDir]/notes, newest first. */
export const loadNotes = async (rootDir) => {
  if (!rootDir) return []
  const notesDir = getNotesDir(rootDir)
  const result = await listAllFiles(notesDir)
  if (!result.success) return []

  // Defensive filter: some environments (e.g. the browser dev mock) return
  // every markdown file in the workspace rather than scoping to `notesDir`.
  const notesDirNormalized = notesDir.replace(/\\/g, '/')
  const noteFiles = (result.files || [])
    .map((f) => f.replace(/\\/g, '/'))
    .filter((f) => f.startsWith(`${notesDirNormalized}/`))

  const notes = await Promise.all(
    noteFiles.map(async (filePath) => {
      const fileResult = await readFile(filePath)
      if (!fileResult.success) return null
      return noteFromFile(filePath, fileResult.data)
    })
  )

  return notes
    .filter(Boolean)
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
}

/**
 * Saves a note, moving its file if the activity link (and therefore its
 * folder) changed since it was last persisted.
 */
export const saveNote = async (rootDir, note, previousFilePath) => {
  const filePath = getNoteFilePath(rootDir, note)
  await writeFile(filePath, noteToFileContent(note))
  if (previousFilePath && previousFilePath !== filePath) {
    await deleteFile(previousFilePath)
  }
  return { ...note, filePath }
}

export const deleteNote = async (rootDir, note) => {
  const filePath = note.filePath || getNoteFilePath(rootDir, note)
  await deleteFile(filePath)
}

/** Notes linked to a specific activity, newest first. */
export const getNotesForActivity = (notes, activityId) =>
  (notes || []).filter((n) => n.activityId === activityId)
