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
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useAppContext } from '../../context/AppContext'
import {
  loadProjects,
  saveProjects,
  createTask,
  getActivityStreamId,
} from '../../utils/projectsManager'
import { getStreamAbbrev } from '../../utils/streamConfig'
import TaskList from './components/TaskList'
import StreamTag from './components/StreamTag'
import ConfirmDialog from './components/ConfirmDialog'

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

const ProgressRing = ({ done, total, color }) => {
  const r = 26
  const circumference = 2 * Math.PI * r
  const pct = total > 0 ? done / total : 0

  return (
    <Box sx={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
      <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          strokeWidth="7"
          style={{
            stroke: 'var(--mui-palette-action-hover, rgba(0,0,0,0.06))',
          }}
        />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${pct * circumference} ${circumference}`}
        />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.7rem',
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {done}/{total}
      </Box>
    </Box>
  )
}

const Panel = ({ label, children, sx = {} }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: '18px',
      border: '1.5px solid',
      borderColor: 'divider',
      ...sx,
    }}
  >
    <Typography
      sx={{
        fontSize: '0.66rem',
        fontWeight: 800,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'text.secondary',
        mb: 1.5,
      }}
    >
      {label}
    </Typography>
    {children}
  </Paper>
)

const StatusPill = ({ label, tone }) => (
  <Box
    component="span"
    sx={{
      fontSize: '0.68rem',
      fontWeight: 800,
      px: 1.5,
      py: 0.4,
      borderRadius: '999px',
      flexShrink: 0,
      ...(tone === 'active'
        ? { bgcolor: 'primary.main', color: '#fff' }
        : {
            bgcolor: 'transparent',
            border: '1.5px solid',
            borderColor: 'divider',
            color: 'text.disabled',
          }),
    }}
  >
    {label}
  </Box>
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
  const [confirm, setConfirm] = useState(EMPTY_CONFIRM)
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

  const isProject = itemType === 'project'
  const listKey = isProject ? 'clientProjects' : 'activities'
  const item = data[listKey].find((entry) => entry.id === itemId) || null
  const itemReadOnly =
    (isProject && item?.status === 'done') ||
    (!isProject && item?.status === 'archived')

  const stream = isProject
    ? mainFocusStream
    : streamById[getActivityStreamId(item || {})]

  const save = (nextData) => {
    setData(nextData)
    saveProjects(selectedDirectory, nextData)
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
        tasks.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        )
      ),
    onDeleteTask: (taskId) =>
      updateTasks((tasks) => tasks.filter((t) => t.id !== taskId)),
    onToggleTaskImportant: (taskId) =>
      updateTasks((tasks) =>
        tasks.map((t) =>
          t.id === taskId ? { ...t, important: !t.important } : t
        )
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

  return (
    <Box sx={{ pb: 6 }}>
      {/* ── Header ── */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/todos')}
          sx={{
            fontWeight: 900,
            borderRadius: '999px',
            borderWidth: '2px',
            borderColor: 'text.primary',
            color: 'text.primary',
            px: 2,
            '&:hover': { borderWidth: '2px' },
          }}
        >
          Back
        </Button>
        {stream && (
          <StreamTag stream={stream} label={stream.name} size="medium" />
        )}
        <StatusPill label={statusLabel} tone={isActive ? 'active' : 'muted'} />
      </Stack>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 3,
          mb: 3,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 260 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 900, letterSpacing: '-0.02em', mb: 0.75 }}
          >
            {item.title}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.7rem',
              color: 'text.secondary',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {item.createdAt && (
              <span>Started {formatDate(item.createdAt)}</span>
            )}
            <span>
              {itemReadOnly && item.completedAt
                ? `Completed ${formatDate(item.completedAt)}`
                : 'Ongoing'}
            </span>
            {tasks.length > 0 && (
              <span>
                {tasks.length} todos · {doneCount} done
              </span>
            )}
          </Box>
        </Box>
        {tasks.length > 0 && (
          <ProgressRing
            done={doneCount}
            total={tasks.length}
            color={accentColor}
          />
        )}
      </Box>

      {/* ── Main grid ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 320px' },
          gap: 2.5,
          alignItems: 'start',
        }}
      >
        <Panel label="Todos">
          <TaskList
            tasks={tasks}
            accentColor={accentColor}
            readOnly={itemReadOnly}
            ghostAdd
            divided
            collapseCompleted
            onAddTask={itemReadOnly ? undefined : taskHandlers.onAddTask}
            onToggleTask={itemReadOnly ? undefined : taskHandlers.onToggleTask}
            onDeleteTask={itemReadOnly ? undefined : taskHandlers.onDeleteTask}
            onToggleTaskImportant={
              itemReadOnly ? undefined : taskHandlers.onToggleTaskImportant
            }
            onAddSubtask={itemReadOnly ? undefined : taskHandlers.onAddSubtask}
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

        <Stack spacing={2}>
          <Panel label="Notes">
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
              {isActive ? (
                <Button
                  fullWidth
                  onClick={() =>
                    openConfirm({
                      title: isProject
                        ? 'Mark Project Done'
                        : 'Finish Activity',
                      message: `"${item.title}" will be marked as ${
                        isProject ? 'done' : 'completed'
                      }.`,
                      confirmLabel: isProject ? 'Mark done' : 'Finish',
                      onConfirm: markComplete,
                    })
                  }
                  sx={{
                    fontWeight: 800,
                    borderRadius: '12px',
                    bgcolor: 'primary.main',
                    color: '#fff',
                    py: 1.1,
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                >
                  {isProject ? 'Mark done' : 'Mark complete'}
                </Button>
              ) : (
                <>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 1,
                      borderRadius: '10px',
                      bgcolor: 'action.hover',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'text.secondary',
                      textAlign: 'center',
                    }}
                  >
                    {statusLabel}
                    {item.completedAt
                      ? ` · ${formatDate(item.completedAt)}`
                      : ''}
                  </Box>
                  <Button
                    fullWidth
                    onClick={reopen}
                    sx={{
                      fontWeight: 800,
                      borderRadius: '12px',
                      border: '1.5px solid',
                      borderColor: 'divider',
                      color: 'text.primary',
                      py: 1,
                    }}
                  >
                    Reopen
                  </Button>
                </>
              )}
              <Button
                fullWidth
                onClick={() =>
                  openConfirm({
                    title: isProject ? 'Delete Project' : 'Delete Activity',
                    message: `"${item.title}" will be permanently removed.`,
                    confirmLabel: 'Delete',
                    danger: true,
                    onConfirm: deleteItem,
                  })
                }
                sx={{
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  color: 'error.main',
                  '&:hover': {
                    bgcolor: 'transparent',
                    textDecoration: 'underline',
                  },
                }}
              >
                Delete {entityLabel}…
              </Button>
            </Stack>
          </Panel>
        </Stack>
      </Box>

      <ConfirmDialog {...confirm} onCancel={closeConfirm} />
    </Box>
  )
}

export default ActivityDetailsPage
