import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box } from '@mui/material'
import { Add } from '@mui/icons-material'
import { useAppContext } from '../../context/AppContext'
import { loadProjects, getActivityStreamId } from '../../utils/projectsManager'
import { getStreamAbbrev } from '../../utils/streamConfig'
import {
  loadNotes,
  saveNote,
  deleteNote,
  createNote,
} from '../../utils/notesManager'
import NoteCard from './components/NoteCard'
import NoteEditorInline from './components/NoteEditorInline'
import { InkButton, PageHeader, Segmented, EmptyState } from '../shared/ui'

const CARD_WIDTH = 300
const BOARD_PADDING = 28
const DEFAULT_CARD_HEIGHT = 500

const defaultPosition = (index) => ({
  x: BOARD_PADDING + (index % 3) * (CARD_WIDTH + 28),
  y: BOARD_PADDING + Math.floor(index / 3) * 245,
})

const positionFor = (note, index) =>
  Number.isFinite(note.boardX) && Number.isFinite(note.boardY)
    ? { x: note.boardX, y: note.boardY }
    : defaultPosition(index)

const NotesBoard = () => {
  const navigate = useNavigate()
  const { selectedDirectory, streamConfig, mainFocusStream } = useAppContext()
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
  }, [selectedDirectory])

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

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', width: '100%', pb: 8 }}>
      <PageHeader title="Notes" meta={`${notes.length} pinned`}>
        <InkButton
          color="#f45b69"
          startIcon={<Add />}
          onClick={() => setEditorTarget('new')}
        >
          New note
        </InkButton>
      </PageHeader>

      {notes.length > 0 && (
        <Segmented
          size="sm"
          ariaLabel="Filter notes"
          value={filter}
          onChange={setFilter}
          sx={{ mb: 3 }}
          options={[
            { value: 'all', label: 'All', meta: notes.length },
            { value: 'linked', label: 'Linked to work', meta: linkedCount },
            {
              value: 'unfiled',
              label: 'Unfiled',
              meta: notes.length - linkedCount,
            },
          ]}
        />
      )}

      {showEmpty ? (
        <EmptyState
          title="Nothing pinned yet."
          action={
            <InkButton
              startIcon={<Add />}
              onClick={() => setEditorTarget('new')}
            >
              New note
            </InkButton>
          }
        >
          Notes hold the things that don&apos;t belong in a day entry: meeting
          prep, contacts, reference links. Link one to a project or activity to
          keep it with that work.
        </EmptyState>
      ) : (
        <Box
          ref={boardRef}
          sx={{
            position: 'relative',
            minHeight: { xs: 'auto', md: boardHeight },
            p: { xs: 2, md: 0 },
            overflow: 'hidden',
            border: { xs: '2px solid', md: '3px solid' },
            borderColor: 'text.primary',
            backgroundColor: '#b77945',
            backgroundImage:
              'radial-gradient(rgba(66, 37, 19, 0.22) 1px, transparent 1px), radial-gradient(rgba(255, 225, 183, 0.18) 1px, transparent 1px)',
            backgroundPosition: '0 0, 9px 9px',
            backgroundSize: '18px 18px',
            boxShadow: (t) => `7px 7px 0 ${t.palette.text.primary}`,
            '&::before': {
              content: '"Drag cards to arrange your board"',
              position: 'absolute',
              top: 8,
              right: 12,
              fontSize: '0.72rem',
              fontWeight: 800,
              color: 'rgba(45, 25, 12, 0.72)',
              letterSpacing: '0.03em',
            },
          }}
        >
          {editorTarget === 'new' && (
            <Box
              sx={{
                position: { xs: 'relative', md: 'absolute' },
                left: { md: defaultPosition(notes.length).x },
                top: { md: defaultPosition(notes.length).y },
                width: { xs: '100%', md: CARD_WIDTH },
                mb: { xs: 3, md: 0 },
              }}
            >
              <NoteEditorInline
                note={null}
                activities={activities}
                projects={projects}
                streamById={streamById}
                onSave={handleSave}
                onClose={closeEditor}
              />
            </Box>
          )}
          {visibleNotes.map((note, index) => {
            const position = positionFor(note, index)
            const isEditing =
              editorTarget &&
              editorTarget !== 'new' &&
              editorTarget.id === note.id

            return (
              <Box
                key={note.id}
                {...(!isEditing && {
                  onPointerDown: (event) => startDrag(note, index, event),
                  onPointerMove: moveDrag,
                  onPointerUp: finishDrag,
                  onPointerCancel: finishDrag,
                })}
                sx={{
                  position: { xs: 'relative', md: 'absolute' },
                  left: { md: position.x },
                  top: { md: position.y },
                  width: { xs: '100%', md: CARD_WIDTH },
                  mb: { xs: 3, md: 0 },
                  zIndex: draggingId === note.id ? 2 : 1,
                  transform: draggingId === note.id ? 'rotate(1deg)' : 'none',
                  transition:
                    draggingId === note.id ? 'none' : 'transform 120ms ease',
                  touchAction: { xs: 'auto', md: 'none' },
                }}
              >
                {isEditing ? (
                  <NoteEditorInline
                    note={note}
                    activities={activities}
                    projects={projects}
                    streamById={streamById}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    onClose={closeEditor}
                  />
                ) : (
                  <NoteCard
                    note={note}
                    stream={streamForNote(note)}
                    draggable
                    onOpen={() => {
                      if (draggedNoteIdRef.current !== note.id) {
                        setEditorTarget(note)
                      }
                    }}
                    onOpenLinkedItem={(type, id) =>
                      navigate(`/todos/${type}/${id}`)
                    }
                  />
                )}
              </Box>
            )
          })}
        </Box>
      )}
    </Box>
  )
}

export default NotesBoard
