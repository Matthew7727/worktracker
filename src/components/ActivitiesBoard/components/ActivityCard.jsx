import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Chip,
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
  CheckCircle,
} from '@mui/icons-material'
import ConfirmDialog from './ConfirmDialog'
import TaskList from './TaskList'

const EMPTY_CONFIRM = {
  open: false,
  title: '',
  message: '',
  confirmLabel: 'Confirm',
  danger: false,
  onConfirm: null,
}

const useConfirm = () => {
  const [confirm, setConfirm] = useState(EMPTY_CONFIRM)
  const openConfirm = (options) =>
    setConfirm({ ...EMPTY_CONFIRM, ...options, open: true })
  const closeConfirm = () => setConfirm(EMPTY_CONFIRM)
  return { confirm, openConfirm, closeConfirm }
}

// ── Archived card ─────────────────────────────────────────────────────────────

const ArchivedCard = ({ activity, stream, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const { confirm, openConfirm, closeConfirm } = useConfirm()

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '20px',
        border: '2px dashed',
        borderColor: 'divider',
        bgcolor: 'background.subtle',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        opacity: 0.8,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <Chip
          label={stream?.abbrev || activity.type}
          size="small"
          sx={{
            fontWeight: 900,
            fontSize: '0.65rem',
            bgcolor: 'action.selected',
            color: 'text.secondary',
            border: 'none',
            flexShrink: 0,
            mt: 0.3,
          }}
        />
        <Typography
          variant="h6"
          sx={{
            flex: 1,
            fontWeight: 900,
            color: 'text.secondary',
            lineHeight: 1.3,
            wordBreak: 'break-word',
          }}
        >
          {activity.title}
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ flexShrink: 0 }}
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

      {/* Tasks — all shown as done */}
      {activity.tasks.length > 0 && (
        <TaskList tasks={activity.tasks} readOnly />
      )}

      {/* Completion footer */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pt: 1,
          borderTop: '1px dashed',
          borderColor: 'divider',
        }}
      >
        <CheckCircle sx={{ fontSize: '0.9rem', color: 'text.disabled' }} />
        <Typography
          variant="caption"
          sx={{ color: 'text.disabled', fontWeight: 700 }}
        >
          {stream?.abbrev || activity.type} activity completed
          {activity.completedAt ? ` · ${activity.completedAt}` : ''}
        </Typography>
      </Box>

      <ConfirmDialog {...confirm} onCancel={closeConfirm} />
    </Paper>
  )
}

// ── Active card ───────────────────────────────────────────────────────────────

const ActiveCard = ({
  activity,
  stream,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onToggleTaskImportant,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onFinish,
  onRename,
  onDelete,
}) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameText, setRenameText] = useState(activity.title)
  const { confirm, openConfirm, closeConfirm } = useConfirm()

  const accentColor =
    stream?.color || (activity.type === 'BD' ? '#eb8449' : '#ffd166')

  const saveRename = () => {
    if (renameText.trim() && renameText !== activity.title) {
      onRename(renameText.trim())
    } else {
      setRenameText(activity.title)
    }
    setIsRenaming(false)
  }

  const completedCount = activity.tasks.filter((t) => t.completed).length
  const totalCount = activity.tasks.length

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '20px',
        border: '3px solid',
        borderColor: 'divider',
        borderLeft: '5px solid',
        borderLeftColor: accentColor,
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Chip
          label={stream?.abbrev || activity.type}
          size="small"
          sx={{
            fontWeight: 900,
            fontSize: '0.65rem',
            bgcolor: accentColor,
            color: '#fff',
            border: 'none',
            flexShrink: 0,
            mt: 0.4,
          }}
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
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
              variant="h6"
              sx={{
                fontWeight: 900,
                lineHeight: 1.3,
                wordBreak: 'break-word',
              }}
            >
              {activity.title}
            </Typography>
          )}
        </Box>

        <IconButton
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ flexShrink: 0 }}
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

      {/* Task list */}
      <TaskList
        tasks={activity.tasks}
        accentColor={accentColor}
        onAddTask={onAddTask}
        onToggleTask={onToggleTask}
        onDeleteTask={onDeleteTask}
        onToggleTaskImportant={onToggleTaskImportant}
        onAddSubtask={onAddSubtask}
        onToggleSubtask={onToggleSubtask}
        onDeleteSubtask={onDeleteSubtask}
      />

      {/* Progress footer */}
      {totalCount > 0 && (
        <Box sx={{ pt: 1, borderTop: '2px solid', borderColor: 'divider' }}>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontWeight: 700 }}
          >
            {completedCount}/{totalCount} todos complete
          </Typography>
        </Box>
      )}

      <ConfirmDialog {...confirm} onCancel={closeConfirm} />
    </Paper>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────

const ActivityCard = (props) => {
  if (props.activity.status === 'archived') {
    return (
      <ArchivedCard
        activity={props.activity}
        stream={props.stream}
        onDelete={props.onDelete}
      />
    )
  }
  return <ActiveCard {...props} />
}

export default ActivityCard
