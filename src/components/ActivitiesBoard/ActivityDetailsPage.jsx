import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  TextField,
  Chip,
  Avatar,
  InputBase,
  IconButton,
  FormControlLabel,
  Switch,
  Tooltip,
} from '@mui/material'
import { ArrowBack, Add, Check, Close, Edit } from '@mui/icons-material'
import { InkButton, StatStrip, MONO } from '../shared/ui'
import TaskList from './components/TaskList'
import ConfirmDialog from './components/ConfirmDialog'
import ProgressStrip from './components/ProgressStrip'
import AddActivityDialog from './components/AddActivityDialog'
import NoteCard from '../Notes/components/NoteCard'
import NoteEditorInline from '../Notes/components/NoteEditorInline'
import NoteViewerDialog from '../Notes/components/NoteViewerDialog'
import useActivityDetails from './hooks/useActivityDetails'
import GoalLinkPicker from '../Goals/GoalLinkPicker'

const formatDate = (dateStr) => {
  if (!dateStr) return null
  const [year, month, day] = dateStr.split('-')
  const months = [
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
  return `${parseInt(day)} ${months[parseInt(month) - 1]} '${year.slice(2)}`
}

const initialsFor = (name) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

const Panel = ({ label, meta, children, sx = {} }) => (
  <Paper
    elevation={0}
    component="section"
    sx={{ border: '3px solid', borderColor: 'text.primary', ...sx }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        px: 2.5,
        py: 1.25,
        borderBottom: '2px solid',
        borderColor: 'divider',
      }}
    >
      <Typography component="h2" sx={{ fontWeight: 900, fontSize: '1.05rem' }}>
        {label}
      </Typography>
      {meta != null && (
        <Typography
          sx={{
            fontFamily: MONO,
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'text.secondary',
          }}
        >
          {meta}
        </Typography>
      )}
    </Box>
    <Box sx={{ p: 2.5 }}>{children}</Box>
  </Paper>
)

const AddLink = ({ children, onClick }) => (
  <InkButton
    tone="ghost"
    size="sm"
    startIcon={<Add />}
    onClick={onClick}
    sx={{ ml: -1 }}
  >
    {children}
  </InkButton>
)

const ActivityDetailsPage = () => {
  const [goalLinkOpen, setGoalLinkOpen] = useState(false)
  const [focusedNote, setFocusedNote] = useState(null)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
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
    teamInput,
    setTeamInput,
    addingTeam,
    setAddingTeam,
    addTeamMember,
    removeTeamMember,
    addSubOpen,
    setAddSubOpen,
    addSubActivity,
    confirm,
    openConfirm,
    closeConfirm,
    markComplete,
    reopen,
    deleteItem,
    linkedNotes,
    noteEditorTarget,
    noteTask,
    openNewNote,
    openExistingNote,
    closeNoteEditor,
    handleSaveNote,
    handleDeleteNote,
  } = useActivityDetails()

  if (!item) {
    return (
      <Box sx={{ py: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/todos')}>
          Back to Activities
        </Button>
        <Typography sx={{ mt: 2, fontWeight: 800 }}>
          This entry was not found.
        </Typography>
      </Box>
    )
  }

  const tasks = item.tasks || []
  const doneCount = tasks.filter((t) => t.completed).length
  const accentColor = stream?.color || '#80b621'
  const isActive = !itemReadOnly
  const statusLabel = isActive ? 'Active' : isProject ? 'Done' : 'Completed'
  const entityLabel = isProject ? 'project' : 'activity'
  // Nesting is capped at one level — only top-level activities can take children.
  const canHaveChildren = !isProject && !item.parentId
  const startTitleEdit = () => {
    setTitleDraft(item.title || '')
    setEditingTitle(true)
  }
  const saveTitle = () => {
    const title = titleDraft.trim()
    if (title && title !== item.title) updateItem({ title })
    setEditingTitle(false)
  }

  return (
    <Box sx={{ pb: 8, maxWidth: 1280, mx: 'auto', width: '100%' }}>
      {/* ── Header ── */}
      <InkButton
        tone="ghost"
        size="sm"
        startIcon={<ArrowBack />}
        onClick={() => navigate('/todos')}
        sx={{ ml: -1, mb: 2 }}
      >
        {isProject ? 'Projects & activities' : 'Activities'}
      </InkButton>

      <Box
        component="header"
        sx={{
          border: '3px solid',
          borderColor: 'text.primary',
          borderTop: '14px solid',
          borderTopColor: accentColor,
          bgcolor: 'background.paper',
          boxShadow: (t) => `8px 8px 0 ${t.palette.text.primary}`,
          mb: 4,
        }}
      >
        <Box sx={{ px: 3, pt: 2.25, pb: 2.75 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexWrap: 'wrap',
              mb: 1.25,
            }}
          >
            {stream && (
              <Typography sx={{ fontWeight: 800, fontSize: '0.92rem' }}>
                {stream.name}
              </Typography>
            )}
            <Box
              sx={{
                px: 0.9,
                py: 0.15,
                fontSize: '0.78rem',
                fontWeight: 800,
                border: '2px solid',
                borderColor: 'text.primary',
                bgcolor: isActive ? accentColor : 'transparent',
                color: isActive ? '#000' : 'text.secondary',
              }}
            >
              {statusLabel}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 28 }}>
              {goalLinkOpen || (item.goalIds || []).length > 0 ? (
                <GoalLinkPicker
                  value={item.goalIds || []}
                  onChange={(goalIds) => updateItem({ goalIds })}
                />
              ) : (
                <InkButton
                  tone="ghost"
                  size="sm"
                  onClick={() => setGoalLinkOpen(true)}
                  sx={{ ml: -1 }}
                >
                  Link to goal
                </InkButton>
              )}
            </Box>
            {parentActivity && (
              <Typography
                component="button"
                type="button"
                onClick={() => navigate(`/todos/activity/${parentActivity.id}`)}
                sx={{
                  border: 'none',
                  background: 'none',
                  p: 0,
                  fontFamily: 'inherit',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: 'text.secondary',
                  cursor: 'pointer',
                  '&:hover': {
                    color: 'text.primary',
                    textDecoration: 'underline',
                  },
                }}
              >
                Part of {parentActivity.title}
              </Typography>
            )}
          </Box>
          {editingTitle ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                maxWidth: 720,
              }}
            >
              <TextField
                autoFocus
                fullWidth
                value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') saveTitle()
                  if (event.key === 'Escape') setEditingTitle(false)
                }}
                slotProps={{
                  htmlInput: { 'aria-label': `Rename ${entityLabel}` },
                }}
                sx={{
                  '& input': {
                    fontSize: { xs: '1.45rem', md: '2rem' },
                    fontWeight: 900,
                    py: 0.75,
                  },
                }}
              />
              <IconButton aria-label="Save title" onClick={saveTitle}>
                <Check />
              </IconButton>
              <IconButton
                aria-label="Cancel title edit"
                onClick={() => setEditingTitle(false)}
              >
                <Close />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: '2.25rem', md: '3.25rem' },
                  fontWeight: 900,
                  letterSpacing: '-0.045em',
                  lineHeight: 0.98,
                  maxWidth: '22ch',
                }}
              >
                {item.title}
              </Typography>
              <Tooltip title={`Rename ${entityLabel}`}>
                <IconButton
                  aria-label={`Rename ${entityLabel}`}
                  onClick={startTitleEdit}
                  size="small"
                  sx={{ mt: 0.25 }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
        <StatStrip
          sx={{
            border: 'none',
            borderTop: '3px solid',
            borderColor: 'text.primary',
          }}
          items={[
            {
              label: 'Todos done',
              value: tasks.length ? `${doneCount}/${tasks.length}` : '0',
              color:
                tasks.length && doneCount === tasks.length
                  ? accentColor
                  : undefined,
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
                : 'Ongoing',
              size: 'sm',
            },
            {
              label: 'Team',
              value: teamMembers.length,
              size: 'sm',
            },
          ]}
        />
      </Box>

      {/* ── Main grid ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 340px' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        <Stack spacing={2.5}>
          <Panel label="Context">
            <InputBase
              fullWidth
              multiline
              minRows={2}
              readOnly={itemReadOnly}
              placeholder={`Add context for this ${entityLabel}…`}
              value={item.description || ''}
              onChange={(e) => updateItem({ description: e.target.value })}
              sx={{
                fontSize: '0.9rem',
                lineHeight: 1.6,
                '& textarea::placeholder': { fontStyle: 'italic' },
              }}
            />
          </Panel>

          <Panel
            label="Todos"
            meta={tasks.length ? `${tasks.length - doneCount} open` : null}
          >
            <TaskList
              tasks={tasks}
              accentColor={accentColor}
              readOnly={itemReadOnly}
              ghostAdd
              divided
              collapseCompleted
              onAddTask={itemReadOnly ? undefined : taskHandlers.onAddTask}
              onToggleTask={
                itemReadOnly ? undefined : taskHandlers.onToggleTask
              }
              onDeleteTask={
                itemReadOnly ? undefined : taskHandlers.onDeleteTask
              }
              onRenameTask={
                itemReadOnly ? undefined : taskHandlers.onRenameTask
              }
              onToggleTaskImportant={
                itemReadOnly ? undefined : taskHandlers.onToggleTaskImportant
              }
              onSetTaskDueDate={
                itemReadOnly ? undefined : taskHandlers.onSetTaskDueDate
              }
              onAddSubtask={
                itemReadOnly ? undefined : taskHandlers.onAddSubtask
              }
              onToggleSubtask={
                itemReadOnly ? undefined : taskHandlers.onToggleSubtask
              }
              onDeleteSubtask={
                itemReadOnly ? undefined : taskHandlers.onDeleteSubtask
              }
              onAddNote={openNewNote}
              onSetTaskGoalIds={taskHandlers.onSetTaskGoalIds}
            />
            {tasks.length === 0 && itemReadOnly && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No todos were added.
              </Typography>
            )}
          </Panel>

          {canHaveChildren && (childActivities.length > 0 || !itemReadOnly) && (
            <Panel label="Sub-activities" meta={childActivities.length || null}>
              {childActivities.length > 0 ? (
                <Stack spacing={1} sx={{ mb: itemReadOnly ? 0 : 1.5 }}>
                  {childActivities.map((child) => {
                    const childTasks = child.tasks || []
                    const childDone = childTasks.filter(
                      (t) => t.completed
                    ).length
                    return (
                      <Box
                        key={child.id}
                        onClick={() => navigate(`/todos/activity/${child.id}`)}
                        sx={{
                          p: 1.5,
                          borderRadius: 0,
                          border: '1px solid',
                          borderColor: 'divider',
                          cursor: 'pointer',
                          '&:hover': { borderColor: 'text.secondary' },
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            mb: childTasks.length > 0 ? 0.75 : 0,
                          }}
                        >
                          {child.title}
                        </Typography>
                        {childTasks.length > 0 && (
                          <ProgressStrip
                            done={childDone}
                            total={childTasks.length}
                            color={accentColor}
                          />
                        )}
                      </Box>
                    )
                  })}
                </Stack>
              ) : (
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', mb: 1.5 }}
                >
                  No sub-activities yet.
                </Typography>
              )}
              {!itemReadOnly && (
                <AddLink onClick={() => setAddSubOpen(true)}>
                  Add sub-activity
                </AddLink>
              )}
            </Panel>
          )}

          <Panel label="Notes">
            {linkedNotes.length > 0 ? (
              <Stack spacing={1.5} sx={{ mb: 1.5 }}>
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
                      onSave={handleSaveNote}
                      onDelete={handleDeleteNote}
                      onClose={closeNoteEditor}
                    />
                  ) : (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onOpen={() => setFocusedNote(note)}
                      onEdit={() => openExistingNote(note)}
                    />
                  )
                )}
              </Stack>
            ) : (
              noteEditorTarget !== 'new' && (
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', mb: 1.5 }}
                >
                  No notes linked yet.
                </Typography>
              )
            )}
            {noteEditorTarget === 'new' && (
              <Box sx={{ mb: 1.5 }}>
                <NoteEditorInline
                  note={null}
                  activities={data.activities}
                  streamById={streamById}
                  projects={data.clientProjects}
                  lockActivityId={isProject ? null : itemId}
                  lockProjectId={isProject ? itemId : null}
                  lockTask={noteTask}
                  onSave={handleSaveNote}
                  onClose={closeNoteEditor}
                />
              </Box>
            )}
            {noteEditorTarget === null && (
              <AddLink onClick={openNewNote}>Add note</AddLink>
            )}
          </Panel>

          <NoteViewerDialog
            note={focusedNote}
            onClose={() => setFocusedNote(null)}
            onEdit={() => {
              openExistingNote(focusedNote)
              setFocusedNote(null)
            }}
          />

          <Panel label="Actions">
            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!item.ongoing}
                    onChange={(e) => updateItem({ ongoing: e.target.checked })}
                  />
                }
                label="Ongoing — no fixed end date"
                sx={{ mb: 0.5, ml: 0 }}
              />
              {isActive ? (
                <InkButton
                  color={accentColor}
                  startIcon={<Check />}
                  onClick={() =>
                    openConfirm({
                      title: isProject
                        ? 'Mark project done'
                        : 'Finish activity',
                      message: `"${item.title}" will be marked as ${
                        isProject ? 'done' : 'completed'
                      }.`,
                      confirmLabel: isProject ? 'Mark done' : 'Finish',
                      onConfirm: markComplete,
                    })
                  }
                  sx={{ width: '100%' }}
                >
                  {isProject ? 'Mark done' : 'Mark complete'}
                </InkButton>
              ) : (
                <>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 1,
                      borderRadius: 0,
                      bgcolor: 'action.hover',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'text.secondary',
                      textAlign: 'center',
                    }}
                  >
                    {statusLabel}
                    {item.completedAt
                      ? ` on ${formatDate(item.completedAt)}`
                      : ''}
                  </Box>
                  <InkButton
                    tone="outline"
                    onClick={reopen}
                    sx={{ width: '100%' }}
                  >
                    Reopen
                  </InkButton>
                </>
              )}
              <InkButton
                tone="ghost"
                size="sm"
                onClick={() =>
                  openConfirm({
                    title: isProject ? 'Delete project' : 'Delete activity',
                    message: `"${item.title}" will be permanently removed.`,
                    confirmLabel: 'Delete',
                    danger: true,
                    onConfirm: deleteItem,
                  })
                }
                sx={{ color: 'error.main', alignSelf: 'flex-start', ml: -1 }}
              >
                Delete {entityLabel}
              </InkButton>
            </Stack>
          </Panel>
        </Stack>

        <Panel label="Team">
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {teamMembers.map((member) => (
              <Chip
                key={member}
                label={member}
                onDelete={
                  itemReadOnly ? undefined : () => removeTeamMember(member)
                }
                avatar={
                  <Avatar
                    sx={{
                      bgcolor: accentColor,
                      color: '#fff',
                      fontSize: '0.6rem',
                      fontWeight: 800,
                    }}
                  >
                    {initialsFor(member)}
                  </Avatar>
                }
                sx={{ fontWeight: 700 }}
              />
            ))}
            {!itemReadOnly &&
              (addingTeam ? (
                <InputBase
                  autoFocus
                  placeholder="Name…"
                  value={teamInput}
                  onChange={(e) => setTeamInput(e.target.value)}
                  onBlur={addTeamMember}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addTeamMember()
                    if (e.key === 'Escape') {
                      setTeamInput('')
                      setAddingTeam(false)
                    }
                  }}
                  sx={{ fontSize: '0.85rem', minWidth: 120 }}
                />
              ) : (
                <Chip
                  label="+ Add"
                  onClick={() => setAddingTeam(true)}
                  variant="outlined"
                  sx={{
                    fontWeight: 700,
                    borderStyle: 'dashed',
                    color: 'text.secondary',
                  }}
                />
              ))}
            {teamMembers.length === 0 && itemReadOnly && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No team members.
              </Typography>
            )}
          </Stack>
        </Panel>
      </Box>

      <ConfirmDialog {...confirm} onCancel={closeConfirm} />

      {canHaveChildren && (
        <AddActivityDialog
          open={addSubOpen}
          onClose={() => setAddSubOpen(false)}
          onAdd={addSubActivity}
          streams={streamConfig?.streams || []}
          activities={data.activities}
          defaultParentId={item.id}
        />
      )}
    </Box>
  )
}

export default ActivityDetailsPage
