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
} from '@mui/material'
import { ArrowBack, Add, Delete } from '@mui/icons-material'
import { useAppContext } from '../../context/AppContext'
import {
  loadProjects,
  saveProjects,
  createTask,
  getActivityStreamId,
} from '../../utils/projectsManager'
import { getStreamAbbrev } from '../../utils/streamConfig'
import TaskList from './components/TaskList'

const ActivityDetailsPage = () => {
  const { itemType, itemId } = useParams()
  const navigate = useNavigate()
  const { selectedDirectory, streamConfig, mainFocusStream } = useAppContext()
  const [data, setData] = useState({ activities: [], clientProjects: [] })
  const [teamInput, setTeamInput] = useState('')

  const streamById = useMemo(
    () =>
      Object.fromEntries(
        (streamConfig?.streams || []).map((s) => [s.id, { ...s, abbrev: getStreamAbbrev(s) }])
      ),
    [streamConfig]
  )

  useEffect(() => {
    if (!selectedDirectory) return
    loadProjects(selectedDirectory).then(setData)
  }, [selectedDirectory])

  const listKey = itemType === 'project' ? 'clientProjects' : 'activities'
  const item = data[listKey].find((entry) => entry.id === itemId) || null
  const itemReadOnly =
    (itemType === 'project' && item?.status === 'done') ||
    (itemType === 'activity' && item?.status === 'archived')

  const stream =
    itemType === 'project'
      ? mainFocusStream
      : streamById[getActivityStreamId(item || {})]
  const streamAbbrev = stream ? getStreamAbbrev(stream) : null

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
    if (!name || teamMembers.includes(name)) return
    updateItem({ teamMembers: [...teamMembers, name] })
    setTeamInput('')
  }

  const removeTeamMember = (name) => {
    updateItem({ teamMembers: teamMembers.filter((member) => member !== name) })
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

  return (
    <Box sx={{ pb: 6 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/todos')}
          sx={{ fontWeight: 900 }}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>
          {item.title}
        </Typography>
        {streamAbbrev && (
          <Chip
            label={streamAbbrev}
            size="small"
            sx={{
              fontWeight: 900,
              bgcolor: stream.color,
              color: '#fff',
            }}
          />
        )}
      </Stack>

      <Stack spacing={3}>
        <Paper
          elevation={0}
          sx={{ p: 3, borderRadius: '20px', border: '3px solid', borderColor: 'divider' }}
        >
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
            Description
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={4}
            placeholder="Add full context for this activity..."
            value={item.description || ''}
            onChange={(e) => updateItem({ description: e.target.value })}
          />
        </Paper>

        <Paper
          elevation={0}
          sx={{ p: 3, borderRadius: '20px', border: '3px solid', borderColor: 'divider' }}
        >
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
            Team
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Add teammate name..."
              value={teamInput}
              onChange={(e) => setTeamInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTeamMember()}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={addTeamMember}
              disabled={!teamInput.trim()}
              sx={{ fontWeight: 900 }}
            >
              Add
            </Button>
          </Stack>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {teamMembers.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No team members added yet.
              </Typography>
            ) : (
              teamMembers.map((member) => (
                <Chip
                  key={member}
                  label={member}
                  onDelete={() => removeTeamMember(member)}
                  deleteIcon={<Delete />}
                  sx={{ fontWeight: 700 }}
                />
              ))
            )}
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{ p: 3, borderRadius: '20px', border: '3px solid', borderColor: 'divider' }}
        >
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
            Todos
          </Typography>
          <TaskList
            tasks={item.tasks || []}
            accentColor={stream?.color || 'primary.main'}
            readOnly={itemReadOnly}
            onAddTask={itemReadOnly ? undefined : taskHandlers.onAddTask}
            onToggleTask={itemReadOnly ? undefined : taskHandlers.onToggleTask}
            onDeleteTask={itemReadOnly ? undefined : taskHandlers.onDeleteTask}
            onToggleTaskImportant={
              itemReadOnly ? undefined : taskHandlers.onToggleTaskImportant
            }
            onAddSubtask={itemReadOnly ? undefined : taskHandlers.onAddSubtask}
            onToggleSubtask={itemReadOnly ? undefined : taskHandlers.onToggleSubtask}
            onDeleteSubtask={itemReadOnly ? undefined : taskHandlers.onDeleteSubtask}
          />
        </Paper>
      </Stack>
    </Box>
  )
}

export default ActivityDetailsPage
