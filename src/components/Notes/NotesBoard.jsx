import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
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

// Small deterministic "pin" tilt per note, so the board doesn't shuffle on
// every re-render but still reads like a corkboard.
const rotationFor = (id) => {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return ((hash % 5) - 2) * 0.6 // -1.2deg .. 1.2deg
}

const NotesBoard = () => {
  const navigate = useNavigate()
  const { selectedDirectory, streamConfig } = useAppContext()
  const [notes, setNotes] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  // null = no editor open; 'new' = creating a fresh note; a note object =
  // editing that note in place (rendered inline where its card would be).
  const [editorTarget, setEditorTarget] = useState(null)

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
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDirectory])

  const streamForNote = (note) => {
    if (!note.activityId) return null
    const activity = activities.find((a) => a.id === note.activityId)
    return activity ? streamById[getActivityStreamId(activity)] : null
  }

  const openNewNote = () => {
    setEditorTarget('new')
  }

  const openExistingNote = (note) => {
    setEditorTarget(note)
  }

  const closeEditor = () => setEditorTarget(null)

  const editingNote = editorTarget === 'new' ? null : editorTarget

  const handleSave = async (fields) => {
    const base = editingNote || createNote()
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

  return (
    <Box sx={{ pb: 6 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 900 }}>
          Notes
        </Typography>
        <Box
          component="button"
          onClick={openNewNote}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            fontFamily: 'inherit',
            fontSize: '0.85rem',
            fontWeight: 900,
            px: 2.5,
            py: 1,
            borderRadius: '25px',
            border: '2px solid',
            borderColor: 'text.primary',
            color: 'text.primary',
            bgcolor: 'background.paper',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            '&:hover': {
              boxShadow: '4px 4px 0px',
              transform: 'translate(-1px, -1px)',
            },
          }}
        >
          <Add sx={{ fontSize: '1rem' }} />
          New Note
        </Box>
      </Box>

      {editorTarget === 'new' && (
        <NoteEditorInline
          note={null}
          activities={activities}
          streamById={streamById}
          onSave={handleSave}
          onClose={closeEditor}
        />
      )}

      {!loading && notes.length === 0 && editorTarget !== 'new' ? (
        <Box
          sx={{
            py: 6,
            textAlign: 'center',
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: '20px',
            color: 'text.secondary',
          }}
        >
          <Typography variant="body2">
            No notes yet.{' '}
            <Box
              component="span"
              sx={{
                cursor: 'pointer',
                textDecoration: 'underline',
                fontWeight: 700,
              }}
              onClick={openNewNote}
            >
              Pin one
            </Box>
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            columns: { xs: 1, sm: 2, md: 3, lg: 4 },
            columnGap: '16px',
          }}
        >
          {notes.map((note) =>
            editorTarget && editorTarget !== 'new' && editorTarget.id === note.id ? (
              <Box key={note.id} sx={{ breakInside: 'avoid' }}>
                <NoteEditorInline
                  note={note}
                  activities={activities}
                  streamById={streamById}
                  onSave={handleSave}
                  onDelete={handleDelete}
                  onClose={closeEditor}
                />
              </Box>
            ) : (
              <NoteCard
                key={note.id}
                note={note}
                stream={streamForNote(note)}
                rotation={rotationFor(note.id)}
                onOpen={() => openExistingNote(note)}
                onOpenActivity={(activityId) =>
                  navigate(`/todos/activity/${activityId}`)
                }
              />
            )
          )}
        </Box>
      )}
    </Box>
  )
}

export default NotesBoard
