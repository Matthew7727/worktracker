import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Box } from '@mui/material'
import { Add } from '@mui/icons-material'
import useNotesBoard, {
  CARD_WIDTH,
  defaultPosition,
  positionFor,
} from '../../components/Notes/hooks/useNotesBoard'
import NoteCard from '../../components/Notes/components/NoteCard'
import NoteEditorInline from '../../components/Notes/components/NoteEditorInline'
import NoteViewerDialog from '../../components/Notes/components/NoteViewerDialog'
import { InkButton, Segmented } from '../../components/shared/ui'
import { useFilofaxTokens } from '../../styles/useUiStyle'
import { PageHead, BlankLine, PrintLabel } from '../paper'

const byNewest = (a, b) =>
  String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''))

/**
 * Notes as memo sheets filed in date order, with the free-arrangement
 * pinboard kept as a second view (positions are shared with the ledger).
 */
const NotesPage = () => {
  const ff = useFilofaxTokens()
  const navigate = useNavigate()
  const location = useLocation()
  const board = useNotesBoard()
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
  } = board
  const [view, setView] = useState('memos')
  const [focusedNote, setFocusedNote] = useState(null)

  const activeFocusedNote =
    focusedNote ||
    board.notes.find((item) => item.id === location.state?.focusNoteId) ||
    null
  const clearSearchFocus = () =>
    navigate(location.pathname, { replace: true, state: undefined })

  const editorFor = (note) => (
    <NoteEditorInline
      key={note?.id || 'new'}
      note={note}
      activities={activities}
      projects={projects}
      streamById={streamById}
      onSave={handleSave}
      onDelete={note ? handleDelete : undefined}
      onClose={closeEditor}
    />
  )

  const cardFor = (note, draggable = false) => (
    <NoteCard
      note={note}
      stream={streamForNote(note)}
      draggable={draggable}
      onOpen={() => {
        if (draggedNoteIdRef.current !== note.id) setFocusedNote(note)
      }}
      onEdit={() => setEditorTarget(note)}
      onOpenLinkedItem={(type, id) => navigate(`/todos/${type}/${id}`)}
    />
  )

  const isEditing = (note) =>
    editorTarget && editorTarget !== 'new' && editorTarget.id === note.id

  return (
    <Box>
      <PageHead title="Notes" aside={`${notes.length} filed`}>
        <Segmented
          ariaLabel="Notes view"
          value={view}
          onChange={setView}
          options={[
            { value: 'memos', label: 'Memo pages' },
            { value: 'pinboard', label: 'Pinboard' },
          ]}
        />
        <InkButton startIcon={<Add />} onClick={() => setEditorTarget('new')}>
          New note
        </InkButton>
      </PageHead>

      {notes.length > 0 && (
        <Segmented
          ariaLabel="Filter notes"
          value={filter}
          onChange={setFilter}
          sx={{ mb: 3 }}
          options={[
            { value: 'all', label: 'All', meta: notes.length },
            { value: 'linked', label: 'Filed with work', meta: linkedCount },
            {
              value: 'unfiled',
              label: 'Loose',
              meta: notes.length - linkedCount,
            },
          ]}
        />
      )}

      {showEmpty ? (
        <BlankLine
          action={
            <InkButton
              size="sm"
              startIcon={<Add />}
              onClick={() => setEditorTarget('new')}
            >
              New note
            </InkButton>
          }
        >
          Nothing filed yet. Notes hold what doesn&apos;t belong in a day entry:
          meeting prep, contacts, reference links.
        </BlankLine>
      ) : view === 'memos' ? (
        <Box
          sx={{
            columnWidth: 280,
            columnGap: '24px',
            '& > *': { breakInside: 'avoid' },
          }}
        >
          {editorTarget === 'new' && <Box>{editorFor(null)}</Box>}
          {[...visibleNotes].sort(byNewest).map((note) => (
            <Box key={note.id}>
              {isEditing(note) ? editorFor(note) : cardFor(note)}
            </Box>
          ))}
        </Box>
      ) : (
        <>
          <PrintLabel sx={{ mb: 1 }}>
            Drag memos to arrange the board. Wider windows only.
          </PrintLabel>
          <Box
            ref={boardRef}
            sx={{
              position: 'relative',
              minHeight: { xs: 'auto', md: boardHeight },
              p: { xs: 2, md: 0 },
              overflow: 'hidden',
              borderRadius: '8px',
              border: `1px solid ${ff.ruleStrong}`,
              // A planning-grid refill: faint dotted squares
              backgroundColor: ff.pageShade,
              backgroundImage: `radial-gradient(${ff.ruleStrong} 1px, transparent 1.2px)`,
              backgroundSize: '20px 20px',
            }}
          >
            {editorTarget === 'new' && (
              <Box
                sx={{
                  position: { xs: 'relative', md: 'absolute' },
                  left: { md: defaultPosition(notes.length).x },
                  top: { md: defaultPosition(notes.length).y },
                  width: { xs: '100%', md: CARD_WIDTH },
                  zIndex: 3,
                }}
              >
                {editorFor(null)}
              </Box>
            )}
            {visibleNotes.map((note, index) => {
              const pos = positionFor(note, index)
              const editing = isEditing(note)
              return (
                <Box
                  key={note.id}
                  {...(!editing && {
                    onPointerDown: (e) => board.startDrag(note, index, e),
                    onPointerMove: board.moveDrag,
                    onPointerUp: board.finishDrag,
                    onPointerCancel: board.finishDrag,
                  })}
                  sx={{
                    position: { xs: 'relative', md: 'absolute' },
                    left: { md: pos.x },
                    top: { md: pos.y },
                    width: { xs: '100%', md: CARD_WIDTH },
                    mb: { xs: 3, md: 0 },
                    zIndex: draggingId === note.id || editing ? 3 : 1,
                    transform: draggingId === note.id ? 'rotate(1deg)' : 'none',
                    transition:
                      draggingId === note.id ? 'none' : 'transform 120ms ease',
                    touchAction: { xs: 'auto', md: 'none' },
                  }}
                >
                  {editing ? editorFor(note) : cardFor(note, true)}
                </Box>
              )
            })}
          </Box>
        </>
      )}
      <NoteViewerDialog
        note={activeFocusedNote}
        stream={activeFocusedNote ? streamForNote(activeFocusedNote) : null}
        onClose={() => {
          setFocusedNote(null)
          clearSearchFocus()
        }}
        onEdit={() => {
          setEditorTarget(activeFocusedNote)
          setFocusedNote(null)
          clearSearchFocus()
        }}
        onOpenLinkedItem={(type, id) => {
          setFocusedNote(null)
          clearSearchFocus()
          navigate(`/todos/${type}/${id}`)
        }}
      />
    </Box>
  )
}

export default NotesPage
