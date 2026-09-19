import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box } from '@mui/material'
import { Add } from '@mui/icons-material'
import NoteCard from './components/NoteCard'
import NoteEditorInline from './components/NoteEditorInline'
import NoteViewerDialog from './components/NoteViewerDialog'
import { InkButton, PageHeader, Segmented, EmptyState } from '../shared/ui'
import useNotesBoard, {
  CARD_WIDTH,
  defaultPosition,
  positionFor,
} from './hooks/useNotesBoard'

const NotesBoard = () => {
  const navigate = useNavigate()
  const [focusedNote, setFocusedNote] = useState(null)
  const {
    notes,
    activities,
    projects,
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
  } = useNotesBoard()

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
                        setFocusedNote(note)
                      }
                    }}
                    onEdit={() => setEditorTarget(note)}
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
      <NoteViewerDialog
        note={focusedNote}
        stream={focusedNote ? streamForNote(focusedNote) : null}
        onClose={() => setFocusedNote(null)}
        onEdit={() => {
          setEditorTarget(focusedNote)
          setFocusedNote(null)
        }}
        onOpenLinkedItem={(type, id) => {
          setFocusedNote(null)
          navigate(`/todos/${type}/${id}`)
        }}
      />
    </Box>
  )
}

export default NotesBoard
