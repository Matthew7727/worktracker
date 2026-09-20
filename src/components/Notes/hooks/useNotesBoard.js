import { useEffect, useMemo, useRef, useState } from 'react'
import { useAppContext } from '../../../context/AppContext'
import {
  loadProjects,
  getActivityStreamId,
} from '../../../utils/projectsManager'
import { getStreamAbbrev } from '../../../utils/streamConfig'
import {
  loadNotes,
  saveNote,
  deleteNote,
  createNote,
} from '../../../utils/notesManager'

export const CARD_WIDTH = 300
const BOARD_PADDING = 28
const DEFAULT_CARD_HEIGHT = 500

export const defaultPosition = (index) => ({
  x: BOARD_PADDING + (index % 3) * (CARD_WIDTH + 28),
  y: BOARD_PADDING + Math.floor(index / 3) * 245,
})

export const positionFor = (note, index) =>
  Number.isFinite(note.boardX) && Number.isFinite(note.boardY)
    ? { x: note.boardX, y: note.boardY }
    : defaultPosition(index)

/**
 * Notes, their linked work, the inline editor target and the pinboard drag
 * behaviour. Shared by the ledger notes board and the Filofax notes section.
 */
const useNotesBoard = () => {
  const { selectedDirectory, refreshTrigger, streamConfig, mainFocusStream } =
    useAppContext()
  const [notes, setNotes] = useState([])
  const [activities, setActivities] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  // null = no editor open; 'new' = creating a fresh note; a note object =
  // editing that note in place (rendered inline where its card would be).
  const [editorTarget, setEditorTarget] = useState(null)
  const [draggingId, setDraggingId] = useState(null)
  const boardRef = useRef(null)
  const dragRef = useRef(null)
  const draggedNoteIdRef = useRef(null)

  const streamById = useMemo(
    () =>
      Object.fromEntries(
        (streamConfig?.streams || []).map((s) => [
          s.id,
          { ...s, abbrev: getStreamAbbrev(s) },
        ])
      ),
    [streamConfig]
  )

  const refresh = async () => {
    if (!selectedDirectory) return
    setLoading(true)
    const [notesData, projectsData] = await Promise.all([
      loadNotes(selectedDirectory),
      loadProjects(selectedDirectory),
    ])
    setNotes(notesData)
    setActivities(projectsData.activities || [])
    setProjects(projectsData.clientProjects || [])
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDirectory, refreshTrigger])

  const streamForNote = (note) => {
    if (note.projectId) return mainFocusStream || null
    if (!note.activityId) return null
    const activity = activities.find((a) => a.id === note.activityId)
    return activity ? streamById[getActivityStreamId(activity)] : null
  }

  const closeEditor = () => setEditorTarget(null)
  const editingNote = editorTarget === 'new' ? null : editorTarget

  const handleSave = async (fields) => {
    const newNotePosition = defaultPosition(notes.length)
    const base =
      editingNote ||
      createNote({
        boardX: newNotePosition.x,
        boardY: newNotePosition.y,
      })
    const updated = {
      ...base,
      ...fields,
      updatedAt: new Date().toISOString(),
    }
    await saveNote(selectedDirectory, updated, editingNote?.filePath)
    closeEditor()
    refresh()
  }

  const handleDelete = async () => {
    if (!editingNote) return
    await deleteNote(selectedDirectory, editingNote)
    closeEditor()
    refresh()
  }

  const linkedCount = notes.filter((n) => n.activityId || n.projectId).length
  const visibleNotes = notes.filter((n) =>
    filter === 'linked'
      ? n.activityId || n.projectId
      : filter === 'unfiled'
        ? !n.activityId && !n.projectId
        : true
  )
  const showEmpty = !loading && notes.length === 0 && editorTarget !== 'new'
  const boardHeight = Math.max(
    560,
    ...visibleNotes.map(
      (note, index) => positionFor(note, index).y + DEFAULT_CARD_HEIGHT
    ),
    editorTarget === 'new'
      ? defaultPosition(notes.length).y + DEFAULT_CARD_HEIGHT
      : 0
  )

  const startDrag = (note, index, event) => {
    if (
      event.button !== 0 ||
      event.target.closest(
        'button, input, textarea, [contenteditable="true"]'
      ) ||
      !window.matchMedia('(min-width: 900px)').matches
    ) {
      return
    }

    const boardBounds = boardRef.current?.getBoundingClientRect()
    if (!boardBounds) return

    const position = positionFor(note, index)
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      id: note.id,
      pointerId: event.pointerId,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startPosition: position,
      position,
      moved: false,
      boardWidth: boardBounds.width,
    }
    setDraggingId(note.id)
  }

  const moveDrag = (event) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    const deltaX = event.clientX - drag.startPointerX
    const deltaY = event.clientY - drag.startPointerY
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) drag.moved = true

    const position = {
      x: Math.max(
        BOARD_PADDING,
        Math.min(
          drag.startPosition.x + deltaX,
          drag.boardWidth - CARD_WIDTH - BOARD_PADDING
        )
      ),
      y: Math.max(BOARD_PADDING, drag.startPosition.y + deltaY),
    }
    drag.position = position
    setNotes((current) =>
      current.map((note) =>
        note.id === drag.id
          ? {
              ...note,
              boardX: Math.round(position.x),
              boardY: Math.round(position.y),
            }
          : note
      )
    )
  }

  const finishDrag = async (event) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    dragRef.current = null
    setDraggingId(null)

    if (!drag.moved) return
    draggedNoteIdRef.current = drag.id
    window.setTimeout(() => {
      draggedNoteIdRef.current = null
    }, 0)

    const movedNote = notes.find((note) => note.id === drag.id)
    if (movedNote) {
      await saveNote(
        selectedDirectory,
        {
          ...movedNote,
          boardX: Math.round(drag.position.x),
          boardY: Math.round(drag.position.y),
        },
        movedNote.filePath
      )
    }
  }

  return {
    notes,
    activities,
    projects,
    loading,
    filter,
    setFilter,
    editorTarget,
    setEditorTarget,
    draggingId,
    boardRef,
    draggedNoteIdRef,
    streamById,
    streamForNote,
    closeEditor,
    handleSave,
    handleDelete,
    linkedCount,
    visibleNotes,
    showEmpty,
    boardHeight,
    startDrag,
    moveDrag,
    finishDrag,
  }
}

export default useNotesBoard
