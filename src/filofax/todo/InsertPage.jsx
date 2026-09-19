import React from 'react'
import {
  Box,
  Typography,
  InputBase,
  Switch,
  FormControlLabel,
  IconButton,
} from '@mui/material'
import { ChevronLeft, Close, Add } from '@mui/icons-material'
import useActivityDetails from '../../components/ActivitiesBoard/hooks/useActivityDetails'
import TaskList from '../../components/ActivitiesBoard/components/TaskList'
import ConfirmDialog from '../../components/ActivitiesBoard/components/ConfirmDialog'
import AddActivityDialog from '../../components/ActivitiesBoard/components/AddActivityDialog'
import NoteCard from '../../components/Notes/components/NoteCard'
import NoteEditorInline from '../../components/Notes/components/NoteEditorInline'
import { InkButton, StatStrip } from '../../components/shared/ui'
import { useFilofaxTokens } from '../../styles/useUiStyle'
import { PrintHeading, StreamMark, Stamp, PenLink, BlankLine } from '../paper'
import { LINE, ruled } from '../paperStyles'

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]
const formatDate = (dateStr) => {
  if (!dateStr) return null
  const [year, month, day] = dateStr.split('-')
  return `${parseInt(day)} ${MONTHS[parseInt(month) - 1]} ${year}`
}

/** A single project or activity, filed as its own insert. */
const InsertPage = () => {
  const ff = useFilofaxTokens()
  const d = useActivityDetails()
  const {
    itemId,
    navigate,
    streamConfig,
    data,
    item,
    isProject,
    itemReadOnly,
    stream,
    streamById,
    parentActivity,
    childActivities,
    updateItem,
    taskHandlers,
    teamMembers,
    noteEditorTarget,
    noteTask,
    linkedNotes,
  } = d

  if (!item) {
    return (
      <Box>
        <PenLink startIcon={<ChevronLeft />} onClick={() => navigate('/todos')}>
          Back to To do
        </PenLink>
        <BlankLine sx={{ mt: 3 }}>This sheet is no longer on file.</BlankLine>
      </Box>
    )
  }

  const tasks = item.tasks || []
  const doneCount = tasks.filter((t) => t.completed).length
  const accent = stream?.color || ff.print
  const statusLabel = !itemReadOnly
    ? 'Active'
    : isProject
      ? 'Done'
      : 'Completed'
  const entity = isProject ? 'project' : 'activity'
  const canHaveChildren = !isProject && !item.parentId
  const ro = (fn) => (itemReadOnly ? undefined : fn)

  return (
    <Box>
      <PenLink
        startIcon={<ChevronLeft />}
        onClick={() => navigate('/todos')}
        sx={{ mb: 2.5 }}
      >
        To do
      </PenLink>

      <Box
        component="header"
        sx={{ borderBottom: `3px double ${ff.print}`, pb: 1.5, mb: 3 }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
            mb: 0.75,
          }}
        >
          {stream && <StreamMark stream={stream} />}
          <Stamp color={itemReadOnly ? ff.inkSoft : ff.print}>
            {statusLabel}
          </Stamp>
          {parentActivity && (
            <PenLink
              onClick={() => navigate(`/todos/activity/${parentActivity.id}`)}
            >
              Part of {parentActivity.title}
            </PenLink>
          )}
        </Box>
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: '1.9rem', md: '2.4rem' },
            lineHeight: 1.1,
            color: ff.print,
            maxWidth: '28ch',
            // The stream colour runs as a thin underline of the title
            textDecoration: 'underline',
            textDecorationColor: accent,
            textDecorationThickness: '3px',
            textUnderlineOffset: '8px',
          }}
        >
          {item.title}
        </Typography>
      </Box>

      <StatStrip
        sx={{ mb: 4 }}
        items={[
          {
            label: 'Todos done',
            value: tasks.length ? `${doneCount} of ${tasks.length}` : 'None',
            size: 'sm',
          },
          {
            label: 'Started',
            value: formatDate(item.createdAt) || 'Not set',
            size: 'sm',
          },
          {
            label: itemReadOnly ? 'Completed' : 'Ends',
            value: itemReadOnly
              ? formatDate(item.completedAt) || 'Not set'
              : item.ongoing
                ? 'Ongoing'
                : 'Open',
            size: 'sm',
          },
          { label: 'Team', value: teamMembers.length, size: 'sm' },
        ]}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 280px' },
          gap: { xs: 5, lg: 6 },
          alignItems: 'start',
        }}
      >
        <Box
          sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}
        >
          <Box component="section">
            <PrintHeading>Context</PrintHeading>
            <InputBase
              fullWidth
              multiline
              minRows={3}
              readOnly={itemReadOnly}
              placeholder={`Background for this ${entity}…`}
              value={item.description || ''}
              onChange={(e) => updateItem({ description: e.target.value })}
              inputProps={{ 'aria-label': 'Context' }}
              sx={{
                p: 0,
                '& textarea': {
                  ...ruled(ff),
                  backgroundAttachment: 'local',
                  lineHeight: `${LINE}px`,
                  color: ff.ink,
                  p: 0,
                },
                '& textarea::placeholder': { fontStyle: 'italic' },
              }}
            />
          </Box>

          <Box component="section">
            <PrintHeading
              aside={tasks.length ? `${tasks.length - doneCount} open` : null}
            >
              Things to do
            </PrintHeading>
            <TaskList
              tasks={tasks}
              accentColor={ff.print}
              readOnly={itemReadOnly}
              ghostAdd
              divided
              collapseCompleted
              onAddTask={ro(taskHandlers.onAddTask)}
              onToggleTask={ro(taskHandlers.onToggleTask)}
              onDeleteTask={ro(taskHandlers.onDeleteTask)}
              onToggleTaskImportant={ro(taskHandlers.onToggleTaskImportant)}
              onSetTaskDueDate={ro(taskHandlers.onSetTaskDueDate)}
              onAddSubtask={ro(taskHandlers.onAddSubtask)}
              onToggleSubtask={ro(taskHandlers.onToggleSubtask)}
              onDeleteSubtask={ro(taskHandlers.onDeleteSubtask)}
              onAddNote={d.openNewNote}
            />
            {tasks.length === 0 && itemReadOnly && (
              <BlankLine>No todos were added.</BlankLine>
            )}
          </Box>

          {canHaveChildren && (childActivities.length > 0 || !itemReadOnly) && (
            <Box component="section">
              <PrintHeading aside={childActivities.length || null}>
                Sub-activities
              </PrintHeading>
              {childActivities.length === 0 && (
                <BlankLine>No sub-activities yet.</BlankLine>
              )}
              {childActivities.map((child) => {
                const ct = child.tasks || []
                return (
                  <Box
                    key={child.id}
                    component="button"
                    type="button"
                    onClick={() => navigate(`/todos/activity/${child.id}`)}
                    sx={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      minHeight: LINE,
                      px: 0,
                      border: 'none',
                      borderBottom: `1px solid ${ff.rule}`,
                      background: 'none',
                      fontFamily: 'inherit',
                      fontSize: '0.92rem',
                      color: ff.ink,
                      textAlign: 'left',
                      cursor: 'pointer',
                      '&:hover': { color: ff.print },
                    }}
                  >
                    {child.title}
                    <Box
                      component="span"
                      sx={{
                        fontStyle: 'italic',
                        fontSize: '0.78rem',
                        color: 'text.secondary',
                      }}
                    >
                      {ct.length
                        ? `${ct.filter((t) => t.completed).length} of ${ct.length} done`
                        : 'No todos'}
                    </Box>
                  </Box>
                )
              })}
              {!itemReadOnly && (
                <PenLink
                  startIcon={<Add />}
                  onClick={() => d.setAddSubOpen(true)}
                  sx={{ mt: 1.5 }}
                >
                  Add sub-activity
                </PenLink>
              )}
            </Box>
          )}

          <Box component="section">
            <PrintHeading aside={linkedNotes.length || null}>
              Notes
            </PrintHeading>
            {linkedNotes.length === 0 && noteEditorTarget !== 'new' && (
              <BlankLine>No notes filed with this {entity}.</BlankLine>
            )}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 2.5,
                alignItems: 'start',
              }}
            >
              {noteEditorTarget === 'new' && (
                <NoteEditorInline
                  note={null}
                  activities={data.activities}
                  streamById={streamById}
                  projects={data.clientProjects}
                  lockActivityId={isProject ? null : itemId}
                  lockProjectId={isProject ? itemId : null}
                  lockTask={noteTask}
                  onSave={d.handleSaveNote}
                  onClose={d.closeNoteEditor}
                />
              )}
              {linkedNotes.map((note) =>
                noteEditorTarget &&
                noteEditorTarget !== 'new' &&
                noteEditorTarget.id === note.id ? (
                  <NoteEditorInline
                    key={note.id}
                    note={note}
                    activities={data.activities}
                    streamById={streamById}
                    projects={data.clientProjects}
                    lockActivityId={isProject ? null : itemId}
                    lockProjectId={isProject ? itemId : null}
                    lockTask={noteTask}
                    onSave={d.handleSaveNote}
                    onDelete={d.handleDeleteNote}
                    onClose={d.closeNoteEditor}
                  />
                ) : (
                  <NoteCard
                    key={note.id}
                    note={note}
                    stream={stream}
                    onOpen={() => d.openExistingNote(note)}
                  />
                )
              )}
            </Box>
            {noteEditorTarget === null && (
              <PenLink
                startIcon={<Add />}
                onClick={d.openNewNote}
                sx={{ mt: 1.5 }}
              >
                Add note
              </PenLink>
            )}
          </Box>
        </Box>

        <Box
          component="aside"
          sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}
        >
          <Box>
            <PrintHeading aside={teamMembers.length || null}>Team</PrintHeading>
            {teamMembers.map((member) => (
              <Box
                key={member}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minHeight: LINE,
                  borderBottom: `1px solid ${ff.rule}`,
                  '&:hover .remove': { opacity: 1 },
                }}
              >
                <PenLink
                  onClick={() =>
                    navigate('/contacts', { state: { name: member } })
                  }
                  sx={{
                    fontStyle: 'normal',
                    color: ff.ink,
                    textDecoration: 'none',
                  }}
                >
                  {member}
                </PenLink>
                {!itemReadOnly && (
                  <IconButton
                    size="small"
                    className="remove"
                    aria-label={`Remove ${member}`}
                    onClick={() => d.removeTeamMember(member)}
                    sx={{
                      p: 0.25,
                      opacity: 0,
                      '&:focus-visible': { opacity: 1 },
                    }}
                  >
                    <Close sx={{ fontSize: '0.9rem' }} />
                  </IconButton>
                )}
              </Box>
            ))}
            {!itemReadOnly && (
              <InputBase
                fullWidth
                value={d.teamInput}
                placeholder="Add a name…"
                onChange={(e) => d.setTeamInput(e.target.value)}
                onBlur={() => d.teamInput.trim() && d.addTeamMember()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') d.addTeamMember()
                  if (e.key === 'Escape') d.setTeamInput('')
                }}
                inputProps={{ 'aria-label': 'Add a team member' }}
                sx={{
                  minHeight: LINE,
                  borderBottom: `1px solid ${ff.rule}`,
                  fontSize: '0.92rem',
                  '& input::placeholder': { fontStyle: 'italic' },
                }}
              />
            )}
            {teamMembers.length === 0 && itemReadOnly && (
              <BlankLine>No team members.</BlankLine>
            )}
          </Box>

          <Box>
            <PrintHeading>Filing</PrintHeading>
            <FormControlLabel
              control={
                <Switch
                  checked={!!item.ongoing}
                  onChange={(e) => updateItem({ ongoing: e.target.checked })}
                />
              }
              label="Ongoing, no fixed end date"
              sx={{
                ml: 0,
                mb: 2,
                '& .MuiFormControlLabel-label': { fontSize: '0.88rem' },
              }}
            />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
                alignItems: 'flex-start',
              }}
            >
              {!itemReadOnly ? (
                <InkButton
                  onClick={() =>
                    d.openConfirm({
                      title: isProject
                        ? 'Mark project done'
                        : 'Finish activity',
                      message: `"${item.title}" will be marked as ${isProject ? 'done' : 'completed'}.`,
                      confirmLabel: isProject ? 'Mark done' : 'Finish',
                      onConfirm: d.markComplete,
                    })
                  }
                >
                  {isProject ? 'Mark done' : 'Mark complete'}
                </InkButton>
              ) : (
                <>
                  <Typography
                    sx={{
                      fontStyle: 'italic',
                      color: 'text.secondary',
                      fontSize: '0.88rem',
                    }}
                  >
                    {statusLabel}
                    {item.completedAt
                      ? ` on ${formatDate(item.completedAt)}`
                      : ''}
                  </Typography>
                  <InkButton tone="outline" onClick={d.reopen}>
                    Reopen
                  </InkButton>
                </>
              )}
              <InkButton
                tone="ghost"
                size="sm"
                sx={{ color: 'error.main', px: 0 }}
                onClick={() =>
                  d.openConfirm({
                    title: isProject ? 'Delete project' : 'Delete activity',
                    message: `"${item.title}" will be permanently removed.`,
                    confirmLabel: 'Delete',
                    danger: true,
                    onConfirm: d.deleteItem,
                  })
                }
              >
                Delete {entity}
              </InkButton>
            </Box>
          </Box>
        </Box>
      </Box>

      <ConfirmDialog {...d.confirm} onCancel={d.closeConfirm} />
      {canHaveChildren && (
        <AddActivityDialog
          open={d.addSubOpen}
          onClose={() => d.setAddSubOpen(false)}
          onAdd={d.addSubActivity}
          streams={streamConfig?.streams || []}
          activities={data.activities}
          defaultParentId={item.id}
        />
      )}
    </Box>
  )
}

export default InsertPage
