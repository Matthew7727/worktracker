import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Checkbox,
  IconButton,
  TextField,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material'
import {
  MoreVert,
  Delete,
  Edit,
  CheckCircleOutline,
  Star,
} from '@mui/icons-material'
import ConfirmDialog from './ConfirmDialog'
import StreamTag from './StreamTag'
import ProgressStrip from './ProgressStrip'
import GhostAddRow from './GhostAddRow'
import TodoAgeChip from '../../shared/TodoAgeChip'

// Cards show, detail manages: at most this many open todos per card.
const MAX_VISIBLE_TODOS = 3

const EMPTY_CONFIRM = {
  open: false,
  title: '',
  message: '',
  confirmLabel: 'Confirm',
  danger: false,
  onConfirm: null,
}

const ActivityCard = ({
  activity,
  stream,
  onAddTask,
  onToggleTask,
  onFinish,
  onRename,
  onDelete,
  onOpenDetails,
  recentlyCompletedIds,
}) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameText, setRenameText] = useState(activity.title)
  const [confirm, setConfirm] = useState(EMPTY_CONFIRM)
  const openConfirm = (options) =>
    setConfirm({ ...EMPTY_CONFIRM, ...options, open: true })
  const closeConfirm = () => setConfirm(EMPTY_CONFIRM)

  const accentColor = stream?.color || '#ffd166'
  const tasks = activity.tasks || []
  const completedCount = tasks.filter((t) => t.completed).length

  // Open todos, starred first; just-completed stay visible during the grace
  // period so a mis-click can be undone in place.
  const openTasks = tasks
    .filter((t) => !t.completed || recentlyCompletedIds?.has?.(t.id))
    .sort((a, b) => {
      if (a.important !== b.important) return a.important ? -1 : 1
      return 0
    })
  const visibleTasks = openTasks.slice(0, MAX_VISIBLE_TODOS)
  const hiddenCount = openTasks.length - visibleTasks.length

  const saveRename = () => {
    if (renameText.trim() && renameText !== activity.title) {
      onRename(renameText.trim())
    } else {
      setRenameText(activity.title)
    }
    setIsRenaming(false)
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: '18px',
        border: '1.5px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        transition: 'border-color 0.15s',
        '&:hover': { borderColor: 'text.secondary' },
        '&:hover .card-kebab': { opacity: 1 },
      }}
    >
      {/* Stream tag + kebab */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <StreamTag stream={stream} label={stream?.abbrev || activity.type} />
        <IconButton
          size="small"
          className="card-kebab"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            p: 0.25,
            opacity: 0,
            transition: 'opacity 0.15s',
            '&:focus-visible': { opacity: 1 },
          }}
        >
          <MoreVert fontSize="small" />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              setIsRenaming(true)
              setRenameText(activity.title)
              setAnchorEl(null)
            }}
          >
            <Edit fontSize="small" sx={{ mr: 1 }} /> Rename
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAnchorEl(null)
              openConfirm({
                title: 'Finish Activity',
                message: `"${activity.title}" will be archived as completed.`,
                confirmLabel: 'Finish',
                onConfirm: onFinish,
              })
            }}
          >
            <CheckCircleOutline fontSize="small" sx={{ mr: 1 }} /> Finish
            Activity
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              setAnchorEl(null)
              openConfirm({
                title: 'Delete Activity',
                message: `"${activity.title}" will be permanently removed.`,
                confirmLabel: 'Delete',
                danger: true,
                onConfirm: onDelete,
              })
            }}
            sx={{ color: 'error.main' }}
          >
            <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
          </MenuItem>
        </Menu>
      </Box>

      {/* Title */}
      {isRenaming ? (
        <TextField
          size="small"
          fullWidth
          value={renameText}
          onChange={(e) => setRenameText(e.target.value)}
          onBlur={saveRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveRename()
            if (e.key === 'Escape') {
              setRenameText(activity.title)
              setIsRenaming(false)
            }
          }}
          autoFocus
        />
      ) : (
        <Typography
          onClick={onOpenDetails}
          sx={{
            fontSize: '1.05rem',
            fontWeight: 800,
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
            wordBreak: 'break-word',
            cursor: onOpenDetails ? 'pointer' : 'default',
            '&:hover': onOpenDetails
              ? { textDecoration: 'underline' }
              : undefined,
          }}
        >
          {activity.title}
        </Typography>
      )}

      {/* Progress */}
      <ProgressStrip
        done={completedCount}
        total={tasks.length}
        color={accentColor}
      />

      {/* Top open todos */}
      {visibleTasks.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          {visibleTasks.map((task) => (
            <Box
              key={task.id}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
            >
              <Checkbox
                size="small"
                checked={task.completed}
                onChange={() => onToggleTask(task.id)}
                sx={{
                  p: 0.5,
                  color: 'text.secondary',
                  '&.Mui-checked': { color: accentColor },
                }}
              />
              {task.important && !task.completed && (
                <Star
                  sx={{ fontSize: '0.85rem', color: '#f59e0b', flexShrink: 0 }}
                />
              )}
              <Typography
                variant="body2"
                sx={{
                  flex: 1,
                  fontWeight: task.completed ? 400 : task.important ? 800 : 600,
                  textDecoration: task.completed ? 'line-through' : 'none',
                  color: task.completed ? 'text.secondary' : 'text.primary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {task.text}
              </Typography>
              {!task.completed && <TodoAgeChip item={task} />}
            </Box>
          ))}
          {hiddenCount > 0 && (
            <Typography
              onClick={onOpenDetails}
              variant="caption"
              sx={{
                fontWeight: 700,
                color: 'text.secondary',
                cursor: 'pointer',
                pl: 1,
                pt: 0.25,
                '&:hover': { color: 'text.primary' },
              }}
            >
              + {hiddenCount} more →
            </Typography>
          )}
        </Box>
      )}

      {/* Ghost add row */}
      <GhostAddRow
        label="Add todo"
        onAdd={onAddTask}
        sx={{
          borderTop: '1px dashed',
          borderColor: 'divider',
          pt: 1,
          mt: 'auto',
        }}
      />

      <ConfirmDialog {...confirm} onCancel={closeConfirm} />
    </Paper>
  )
}

export default ActivityCard
