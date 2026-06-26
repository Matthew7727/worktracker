import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Chip,
} from '@mui/material'
import { Delete, ChevronRight, ExpandMore } from '@mui/icons-material'
import ConfirmDialog from './ConfirmDialog'
import TaskList from './TaskList'

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

const ProjectRow = ({
  project,
  onToggleStatus,
  onDelete,
  onRename,
  taskHandlers,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(project.title)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [tasksExpanded, setTasksExpanded] = useState(false)
  const isDone = project.status === 'done'
  const tasks = project.tasks || []
  const completedCount = tasks.filter((t) => t.completed).length

  const saveEdit = () => {
    if (editText.trim() && editText !== project.title) {
      onRename(editText.trim())
    } else {
      setEditText(project.title)
    }
    setIsEditing(false)
  }

  return (
    <Box
      sx={{
        borderBottom: '2px solid',
        borderColor: 'divider',
        '&:last-of-type': { borderBottom: 'none' },
        bgcolor: isDone ? 'action.selected' : 'transparent',
        transition: 'background-color 0.2s',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          py: 0.75,
          px: 2,
          '&:hover .row-delete': { opacity: 1 },
        }}
      >
        {/* Expand tasks */}
        <IconButton
          size="small"
          onClick={() => setTasksExpanded((e) => !e)}
          sx={{ p: 0.25, color: 'text.secondary', flexShrink: 0 }}
        >
          {tasksExpanded ? (
            <ExpandMore fontSize="small" />
          ) : (
            <ChevronRight fontSize="small" />
          )}
        </IconButton>

        {/* Name */}
        {isEditing ? (
          <TextField
            size="small"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit()
              if (e.key === 'Escape') {
                setEditText(project.title)
                setIsEditing(false)
              }
            }}
            autoFocus
            sx={{ flex: 1 }}
          />
        ) : (
          <Typography
            variant="body2"
            onDoubleClick={() => setIsEditing(true)}
            title="Double-click to rename"
            sx={{
              flex: 1,
              fontWeight: 700,
              color: isDone ? 'text.secondary' : 'text.primary',
              cursor: 'text',
              userSelect: 'none',
            }}
          >
            {project.title}
          </Typography>
        )}

        {/* Dates */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            flexShrink: 0,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontWeight: 600 }}
          >
            {formatDate(project.createdAt)}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            →
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: isDone ? 'text.secondary' : 'text.disabled',
              fontWeight: isDone ? 600 : 400,
              fontStyle: isDone ? 'normal' : 'italic',
            }}
          >
            {isDone ? formatDate(project.completedAt) : 'ongoing'}
          </Typography>
        </Box>

        {/* Task count */}
        {tasks.length > 0 && (
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontWeight: 700, flexShrink: 0 }}
          >
            {completedCount}/{tasks.length} tasks
          </Typography>
        )}

        {/* Status chip */}
        <Chip
          label={isDone ? 'Done' : 'Active'}
          size="small"
          onClick={onToggleStatus}
          sx={{
            cursor: 'pointer',
            fontWeight: 900,
            fontSize: '0.65rem',
            flexShrink: 0,
            ...(isDone
              ? {
                  bgcolor: 'transparent',
                  border: '2px solid',
                  borderColor: 'divider',
                  color: 'text.disabled',
                }
              : {
                  bgcolor: 'primary.main',
                  color: '#fff',
                  border: 'none',
                }),
          }}
        />

        {/* Delete */}
        <IconButton
          size="small"
          className="row-delete"
          onClick={() => setConfirmOpen(true)}
          sx={{ opacity: 0, transition: 'opacity 0.15s', flexShrink: 0 }}
        >
          <Delete fontSize="small" />
        </IconButton>

        <ConfirmDialog
          open={confirmOpen}
          title="Delete Project"
          message={`"${project.title}" will be permanently removed.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => {
            setConfirmOpen(false)
            onDelete()
          }}
          onCancel={() => setConfirmOpen(false)}
        />
      </Box>

      {tasksExpanded && (
        <Box sx={{ px: 2, pb: 1.5, pl: 6 }}>
          <TaskList
            tasks={tasks}
            readOnly={isDone}
            onAddTask={
              isDone
                ? undefined
                : (text) => taskHandlers.onAddTask(project.id, text)
            }
            onToggleTask={(taskId) =>
              taskHandlers.onToggleTask(project.id, taskId)
            }
            onDeleteTask={(taskId) =>
              taskHandlers.onDeleteTask(project.id, taskId)
            }
            onAddSubtask={(taskId, text) =>
              taskHandlers.onAddSubtask(project.id, taskId, text)
            }
            onToggleSubtask={(taskId, subtaskId) =>
              taskHandlers.onToggleSubtask(project.id, taskId, subtaskId)
            }
            onDeleteSubtask={(taskId, subtaskId) =>
              taskHandlers.onDeleteSubtask(project.id, taskId, subtaskId)
            }
          />
        </Box>
      )}
    </Box>
  )
}

const ClientProjectsList = ({
  projects,
  onToggleStatus,
  onDelete,
  onRename,
  taskHandlers,
}) => {
  const sorted = [
    ...projects.filter((p) => p.status === 'active'),
    ...projects.filter((p) => p.status === 'done'),
  ]

  return (
    <Paper
      elevation={0}
      sx={{
        border: '3px solid',
        borderColor: 'divider',
        borderRadius: '20px',
        overflow: 'hidden',
      }}
    >
      {sorted.length === 0 ? (
        <Box sx={{ py: 2.5, px: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No client projects yet.
          </Typography>
        </Box>
      ) : (
        sorted.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
            onToggleStatus={() => onToggleStatus(project.id)}
            onDelete={() => onDelete(project.id)}
            onRename={(title) => onRename(project.id, title)}
            taskHandlers={taskHandlers}
          />
        ))
      )}
    </Paper>
  )
}

export default ClientProjectsList
