import React, { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Stack,
  Checkbox,
  Tooltip,
} from '@mui/material'
import {
  Add,
  Delete,
  ChevronRight,
  ExpandMore,
  Star,
  StarBorder,
} from '@mui/icons-material'
import TodoAgeChip from '../../shared/TodoAgeChip'
import GhostAddRow from './GhostAddRow'

const AddRow = ({ placeholder, onAdd, size = 'small', indent = 0 }) => {
  const [text, setText] = useState('')

  const submit = () => {
    if (!text.trim()) return
    onAdd(text.trim())
    setText('')
  }

  return (
    <Box sx={{ display: 'flex', gap: 1, pl: indent }}>
      <TextField
        size="small"
        fullWidth
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        sx={{
          '& .MuiInputBase-root': {
            borderRadius: '10px',
            fontSize: size === 'small' ? '0.85rem' : undefined,
          },
        }}
        autoComplete="off"
      />
      <IconButton
        size="small"
        onClick={submit}
        disabled={!text.trim()}
        sx={{
          border: '2px solid',
          borderColor: 'divider',
          borderRadius: '10px',
          width: 38,
          height: 38,
          flexShrink: 0,
          '&:hover': { borderColor: 'text.primary' },
        }}
      >
        <Add fontSize="small" />
      </IconButton>
    </Box>
  )
}

const TaskRow = ({
  task,
  accentColor,
  readOnly,
  hideCompleted,
  recentlyCompletedIds,
  divided,
  onToggle,
  onDelete,
  onToggleImportant,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}) => {
  const [expanded, setExpanded] = useState(false)
  const subtasks = task.subtasks || []
  const visibleSubtasks = hideCompleted
    ? subtasks.filter((s) => !s.completed || recentlyCompletedIds?.has?.(s.id))
    : subtasks
  const subDoneCount = subtasks.filter((s) => s.completed).length
  const hasSubtasks = visibleSubtasks.length > 0

  return (
    <Box
      sx={{
        borderBottom: divided ? '1px solid' : 'none',
        borderColor: 'divider',
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          py: divided ? 0.75 : 0.25,
          '&:hover .task-delete': { opacity: 1 },
          '&:hover .task-expand': { visibility: 'visible' },
          '&:hover .task-star': { visibility: 'visible' },
        }}
      >
        <Checkbox
          size="small"
          checked={task.completed}
          disabled={readOnly}
          onChange={() => onToggle?.()}
          sx={{
            p: 0.5,
            color: 'text.secondary',
            '&.Mui-checked': { color: accentColor },
          }}
        />
        {task.important && !task.completed && (
          <Star sx={{ fontSize: '0.85rem', color: '#f59e0b', flexShrink: 0 }} />
        )}
        <Typography
          variant="body2"
          onClick={() => !readOnly && setExpanded((e) => !e)}
          sx={{
            flex: 1,
            textDecoration: task.completed ? 'line-through' : 'none',
            color: task.completed ? 'text.secondary' : 'text.primary',
            fontWeight: task.completed ? 400 : task.important ? 800 : 600,
            cursor: readOnly ? 'default' : 'pointer',
          }}
        >
          {task.text}
        </Typography>
        {subtasks.length > 0 && (
          <Typography
            variant="caption"
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: '0.64rem',
              flexShrink: 0,
            }}
          >
            {subDoneCount}/{subtasks.length}
          </Typography>
        )}
        {!task.completed && <TodoAgeChip item={task} />}
        {!readOnly && (
          <Tooltip
            title={task.important ? 'Unpin' : 'Mark as important'}
            placement="top"
          >
            <IconButton
              size="small"
              className="task-star"
              onClick={() => onToggleImportant?.()}
              sx={{
                p: 0.25,
                visibility: task.important ? 'visible' : 'hidden',
                color: task.important ? '#f59e0b' : 'text.disabled',
                '&:hover': { color: '#f59e0b' },
                '&:focus-visible': { visibility: 'visible' },
              }}
            >
              {task.important ? (
                <Star sx={{ fontSize: '0.9rem' }} />
              ) : (
                <StarBorder sx={{ fontSize: '0.9rem' }} />
              )}
            </IconButton>
          </Tooltip>
        )}
        {!readOnly && (
          <IconButton
            size="small"
            className="task-delete"
            onClick={() => onDelete?.()}
            sx={{ opacity: 0, transition: 'opacity 0.15s', p: 0.25 }}
          >
            <Delete sx={{ fontSize: '0.9rem' }} />
          </IconButton>
        )}
        <IconButton
          size="small"
          className="task-expand"
          onClick={() => setExpanded((e) => !e)}
          sx={{
            p: 0.25,
            color: 'text.secondary',
            visibility: hasSubtasks || expanded ? 'visible' : 'hidden',
            '&:focus-visible': { visibility: 'visible' },
          }}
        >
          {expanded ? (
            <ExpandMore fontSize="small" />
          ) : (
            <ChevronRight fontSize="small" />
          )}
        </IconButton>
      </Box>

      {expanded && (
        <Box sx={{ pl: 4.5, pr: 0.5, pb: 1 }}>
          {visibleSubtasks.length > 0 && (
            <Stack spacing={0.5} sx={{ mb: 0.5 }}>
              {visibleSubtasks.map((subtask) => (
                <Box
                  key={subtask.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.25,
                    '&:hover .subtask-delete': { opacity: 1 },
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={subtask.completed}
                    disabled={readOnly}
                    onChange={() => onToggleSubtask?.(subtask.id)}
                    sx={{
                      p: 0.4,
                      color: 'text.disabled',
                      '&.Mui-checked': { color: accentColor },
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      flex: 1,
                      fontSize: '0.85rem',
                      textDecoration: subtask.completed
                        ? 'line-through'
                        : 'none',
                      color: subtask.completed
                        ? 'text.secondary'
                        : 'text.primary',
                    }}
                  >
                    {subtask.text}
                  </Typography>
                  {!readOnly && (
                    <IconButton
                      size="small"
                      className="subtask-delete"
                      onClick={() => onDeleteSubtask?.(subtask.id)}
                      sx={{ opacity: 0, transition: 'opacity 0.15s', p: 0.2 }}
                    >
                      <Delete sx={{ fontSize: '0.8rem' }} />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Stack>
          )}
          {!readOnly && (
            <AddRow
              placeholder="Add a subtask..."
              onAdd={(text) => onAddSubtask?.(text)}
            />
          )}
        </Box>
      )}
    </Box>
  )
}

const sortTasks = (tasks) =>
  [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    if (a.important !== b.important) return a.important ? -1 : 1
    return 0
  })

const TaskList = ({
  tasks,
  accentColor = 'primary.main',
  readOnly = false,
  hideCompleted = false,
  collapseCompleted = false,
  divided = false,
  ghostAdd = false,
  recentlyCompletedIds,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onToggleTaskImportant,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}) => {
  const [showCompleted, setShowCompleted] = useState(false)

  // Pin important incomplete tasks to the top for display; order in the store
  // is updated separately via ActivitiesBoard so index-based ops stay valid.
  const sorted = sortTasks(tasks)

  const graceVisible = (task) =>
    !task.completed || recentlyCompletedIds?.has?.(task.id)
  let visibleTasks = hideCompleted ? sorted.filter(graceVisible) : sorted
  let completedTasks = []
  if (collapseCompleted) {
    completedTasks = sorted.filter((t) => t.completed && !graceVisible(t))
    visibleTasks = sorted.filter(graceVisible)
  }

  const renderRow = (task) => (
    <TaskRow
      key={task.id}
      task={task}
      accentColor={accentColor}
      readOnly={readOnly}
      hideCompleted={hideCompleted}
      recentlyCompletedIds={recentlyCompletedIds}
      divided={divided}
      onToggle={() => onToggleTask?.(task.id)}
      onDelete={() => onDeleteTask?.(task.id)}
      onToggleImportant={() => onToggleTaskImportant?.(task.id)}
      onAddSubtask={(text) => onAddSubtask?.(task.id, text)}
      onToggleSubtask={(subtaskId) => onToggleSubtask?.(task.id, subtaskId)}
      onDeleteSubtask={(subtaskId) => onDeleteSubtask?.(task.id, subtaskId)}
    />
  )

  return (
    <Box>
      {!readOnly && onAddTask && ghostAdd && (
        <GhostAddRow
          label="Add a todo"
          onAdd={onAddTask}
          sx={{
            borderBottom: '1px dashed',
            borderColor: 'divider',
            pb: 0.75,
            mb: 0.5,
          }}
        />
      )}

      {visibleTasks.length > 0 && (
        <Stack spacing={divided ? 0 : readOnly ? 0.75 : 1}>
          {visibleTasks.map(renderRow)}
        </Stack>
      )}

      {collapseCompleted && completedTasks.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Box
            component="button"
            onClick={() => setShowCompleted((s) => !s)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              border: 'none',
              background: 'none',
              p: 0.5,
              fontFamily: 'inherit',
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: 'text.secondary',
              cursor: 'pointer',
            }}
          >
            {showCompleted ? (
              <ExpandMore sx={{ fontSize: '0.9rem' }} />
            ) : (
              <ChevronRight sx={{ fontSize: '0.9rem' }} />
            )}
            COMPLETED
            <Typography
              component="span"
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.66rem',
                fontWeight: 400,
                color: 'text.disabled',
              }}
            >
              {completedTasks.length}
            </Typography>
          </Box>
          {showCompleted && (
            <Stack spacing={divided ? 0 : 0.75} sx={{ mt: 0.5 }}>
              {completedTasks.map(renderRow)}
            </Stack>
          )}
        </Box>
      )}

      {!readOnly && onAddTask && !ghostAdd && (
        <Box sx={{ mt: tasks.length > 0 ? 1.5 : 0 }}>
          <AddRow placeholder="Add a todo..." onAdd={onAddTask} />
        </Box>
      )}
    </Box>
  )
}

export default TaskList
