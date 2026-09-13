import React, { useEffect, useMemo, useState } from 'react'
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

  const linkedCount = notes.filter((n) => n.activityId || n.projectId).length
  const visibleNotes = notes.filter((n) =>
    filter === 'linked'
      ? n.activityId || n.projectId
      : filter === 'unfiled'
        ? !n.activityId && !n.projectId
        : true
  )
  const showEmpty = !loading && notes.length === 0 && editorTarget !== 'new'

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
        <Box sx={{ columnWidth: 300, columnGap: 3, pt: 1 }}>
          {editorTarget === 'new' && (
            <NoteEditorInline
              note={null}
              activities={activities}
              projects={projects}
              streamById={streamById}
              onSave={handleSave}
              onClose={closeEditor}
            />
          )}
          {visibleNotes.map((note) =>
            editorTarget &&
            editorTarget !== 'new' &&
            editorTarget.id === note.id ? (
              <NoteEditorInline
                key={note.id}
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
                key={note.id}
                note={note}
                stream={streamForNote(note)}
                onOpen={() => setEditorTarget(note)}
                onOpenLinkedItem={(type, id) =>
                  navigate(`/todos/${type}/${id}`)
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
