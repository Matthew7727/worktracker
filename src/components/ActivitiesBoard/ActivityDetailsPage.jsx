import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
  FormControlLabel,
  Switch,
} from '@mui/material'
import { ArrowBack, Add, Check } from '@mui/icons-material'
import { InkButton, StatStrip, MONO } from '../shared/ui'
import { useAppContext } from '../../context/AppContext'
import {
  loadProjects,
  saveProjects,
  createTask,
  createActivity,
  getActivityStreamId,
  getChildActivities,
} from '../../utils/projectsManager'
import { getStreamAbbrev } from '../../utils/streamConfig'
import {
  loadNotes,
  saveNote,
  deleteNote,
  createNote,
  getNotesForActivity,
} from '../../utils/notesManager'
import TaskList from './components/TaskList'
import ConfirmDialog from './components/ConfirmDialog'
import ProgressStrip from './components/ProgressStrip'
import AddActivityDialog from './components/AddActivityDialog'
import NoteCard from '../Notes/components/NoteCard'
import NoteEditorInline from '../Notes/components/NoteEditorInline'

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

const EMPTY_CONFIRM = {
  open: false,
  title: '',
  message: '',
  confirmLabel: 'Confirm',
  danger: false,
  onConfirm: null,
}

const ActivityDetailsPage = () => {
  const { itemType, itemId } = useParams()
  const navigate = useNavigate()
  const { selectedDirectory, streamConfig, mainFocusStream } = useAppContext()
  const [data, setData] = useState({ activities: [], clientProjects: [] })
  const [teamInput, setTeamInput] = useState('')
  const [addingTeam, setAddingTeam] = useState(false)
  const [addSubOpen, setAddSubOpen] = useState(false)
  const [confirm, setConfirm] = useState(EMPTY_CONFIRM)
  const [notes, setNotes] = useState([])
  // null = no editor open; 'new' = creating a fresh note; a note object =
  // editing that note in place, right where its card would be.
  const [noteEditorTarget, setNoteEditorTarget] = useState(null)
  const openConfirm = (options) =>
    setConfirm({ ...EMPTY_CONFIRM, ...options, open: true })
  const closeConfirm = () => setConfirm(EMPTY_CONFIRM)

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

  useEffect(() => {
    if (!selectedDirectory) return
    loadProjects(selectedDirectory).then(setData)
  }, [selectedDirectory])

  const refreshNotes = () => {
    if (!selectedDirectory) return
    loadNotes(selectedDirectory).then(setNotes)
  }

  useEffect(() => {
    refreshNotes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDirectory])

  const isProject = itemType === 'project'
  const listKey = isProject ? 'clientProjects' : 'activities'
  const item = data[listKey].find((entry) => entry.id === itemId) || null
  const itemReadOnly =
    (isProject && item?.status === 'done') ||
    (!isProject && item?.status === 'archived')

  const stream = isProject
    ? mainFocusStream
    : streamById[getActivityStreamId(item || {})]

  const parentActivity =
    !isProject && item?.parentId
      ? data.activities.find((a) => a.id === item.parentId) || null
      : null
  const childActivities =
    !isProject && item ? getChildActivities(data.activities, item.id) : []

  const save = (nextData) => {
    setData(nextData)
    saveProjects(selectedDirectory, nextData)
  }

  const addSubActivity = (title, streamIdArg, options) => {
    save({
      ...data,
      activities: [
        ...data.activities,
        createActivity(title, streamIdArg, options),
      ],
    })
  }

  const updateItem = (patchOrUpdater) => {
    save({
      ...data,
      [listKey]: data[listKey].map((entry) => {
        if (entry.id !== itemId) return entry
        if (typeof patchOrUpdater === 'function') return patchOrUpdater(entry)
        return { ...entry, ...patchOrUpdater }
      }),
    })
  }

  const updateTasks = (updateFn) => {
    updateItem((entry) => ({ ...entry, tasks: updateFn(entry.tasks || []) }))
  }

  const taskHandlers = {
    onAddTask: (text) => updateTasks((tasks) => [...tasks, createTask(text)]),
    onToggleTask: (taskId) =>
      updateTasks((tasks) =>
        tasks.map((t) => {
          if (t.id !== taskId) return t
          const nextCompleted = !t.completed
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted
              ? new Date().toISOString().split('T')[0]
              : null,
          }
        })
      ),
    onDeleteTask: (taskId) =>
      updateTasks((tasks) => tasks.filter((t) => t.id !== taskId)),
    onToggleTaskImportant: (taskId) =>
      updateTasks((tasks) =>
        tasks.map((t) =>
          t.id === taskId ? { ...t, important: !t.important } : t
        )
      ),
    onSetTaskDueDate: (taskId, dueDate) =>
      updateTasks((tasks) =>
        tasks.map((t) => (t.id === taskId ? { ...t, dueDate } : t))
      ),
    onAddSubtask: (taskId, text) =>
      updateTasks((tasks) =>
        tasks.map((t) =>
          t.id === taskId
            ? { ...t, subtasks: [...(t.subtasks || []), createTask(text)] }
            : t
        )
      ),
    onToggleSubtask: (taskId, subtaskId) =>
      updateTasks((tasks) =>
        tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                subtasks: (t.subtasks || []).map((s) =>
                  s.id === subtaskId ? { ...s, completed: !s.completed } : s
                ),
              }
            : t
        )
      ),
    onDeleteSubtask: (taskId, subtaskId) =>
      updateTasks((tasks) =>
        tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                subtasks: (t.subtasks || []).filter((s) => s.id !== subtaskId),
              }
            : t
        )
      ),
  }

  const teamMembers = item?.teamMembers || []
  const addTeamMember = () => {
    const name = teamInput.trim()
    if (!name || teamMembers.includes(name)) {
      setTeamInput('')
      setAddingTeam(false)
      return
    }
    updateItem({ teamMembers: [...teamMembers, name] })
    setTeamInput('')
  }

  const removeTeamMember = (name) => {
    updateItem({ teamMembers: teamMembers.filter((member) => member !== name) })
  }

  // ── Lifecycle actions ────────────────────────────────────────────────

  const today = () => new Date().toISOString().split('T')[0]

  const markComplete = () => {
    if (isProject) {
      updateItem({ status: 'done', completedAt: today() })
    } else {
      updateItem({ status: 'archived', completedAt: today() })
    }
  }

  const reopen = () => {
    if (isProject) {
      updateItem({ status: 'active', completedAt: null })
    } else {
      updateItem({ status: 'active', completedAt: null })
    }
  }

  const deleteItem = () => {
    save({
      ...data,
      [listKey]: data[listKey].filter((entry) => entry.id !== itemId),
    })
    navigate('/todos')
  }

  // ── Linked notes ─────────────────────────────────────────────────────

  const linkedNotes = getNotesForActivity(notes, itemId)

  const openNewNote = () => {
    setNoteEditorTarget('new')
  }

  const openExistingNote = (note) => {
    setNoteEditorTarget(note)
  }

  const closeNoteEditor = () => setNoteEditorTarget(null)

  const editingNote = noteEditorTarget === 'new' ? null : noteEditorTarget

  const handleSaveNote = async (fields) => {
    const base = editingNote || createNote()
    const updated = {
      ...base,
      ...fields,
      activityId: itemId,
      activityTitle: item?.title || null,
      updatedAt: new Date().toISOString(),
    }
    await saveNote(selectedDirectory, updated, editingNote?.filePath)
    closeNoteEditor()
    refreshNotes()
  }

  const handleDeleteNote = async () => {
    if (!editingNote) return
    await deleteNote(selectedDirectory, editingNote)
    closeNoteEditor()
    refreshNotes()
  }

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
        </Stack>

        <Stack spacing={2}>
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

          {!isProject && (
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
                        lockActivityId={itemId}
                        onSave={handleSaveNote}
                        onDelete={handleDeleteNote}
                        onClose={closeNoteEditor}
                      />
                    ) : (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onOpen={() => openExistingNote(note)}
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
                    lockActivityId={itemId}
                    onSave={handleSaveNote}
                    onClose={closeNoteEditor}
                  />
                </Box>
              )}
              {noteEditorTarget === null && (
                <AddLink onClick={openNewNote}>Add note</AddLink>
              )}
            </Panel>
          )}

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
