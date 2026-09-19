import React, { useRef, useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  InputBase,
} from '@mui/material'
import { MoreHoriz, DragIndicator, Star } from '@mui/icons-material'
import ConfirmDialog from '../../components/ActivitiesBoard/components/ConfirmDialog'
import TodoDueChip from '../../components/shared/TodoDueChip'
import TodoAgeChip from '../../components/shared/TodoAgeChip'
import { sortTasksByUrgency } from '../../utils/taskUrgency'
import { useFilofaxTokens } from '../../styles/useUiStyle'
import { Slip, StreamMark, TickBox, PenLink } from '../paper'
import { LINE, ruled } from '../paperStyles'

const MAX_VISIBLE_TODOS = 4
const DETAIL_NAVIGATION_DELAY_MS = 260

const EMPTY_CONFIRM = {
  open: false,
  title: '',
  message: '',
  confirmLabel: 'Confirm',
  danger: false,
  onConfirm: null,
}

// Write a new todo straight onto the next ruled line of the sheet.
const WriteLine = ({ onAdd }) => {
  const ff = useFilofaxTokens()
  const [text, setText] = useState('')
  const submit = () => {
    const value = text.trim()
    if (value) onAdd(value)
    setText('')
  }
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        minHeight: LINE,
        borderBottom: `1px solid ${ff.rule}`,
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: 16,
          height: 16,
          flexShrink: 0,
          border: `1.25px dashed ${ff.ruleStrong}`,
          borderRadius: '2px',
        }}
      />
      <InputBase
        fullWidth
        value={text}
        placeholder="Add a todo…"
        onChange={(e) => setText(e.target.value)}
        onBlur={submit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
          if (e.key === 'Escape') setText('')
        }}
        inputProps={{ 'aria-label': 'Add a todo' }}
        sx={{
          fontSize: '0.88rem',
          color: ff.ink,
          '& input::placeholder': { fontStyle: 'italic', opacity: 0.7 },
        }}
      />
    </Box>
  )
}

/**
 * An activity as a punched "Things to do" refill: its stream on the tab,
 * the most pressing open todos on ruled lines, and a blank line to add more.
 */
const ActivitySheet = ({
  activity,
  stream,
  onAddTask,
  onToggleTask,
  onFinish,
  onRename,
  onDelete,
  onOpenDetails,
  recentlyCompletedIds,
  dragHandle,
}) => {
  const ff = useFilofaxTokens()
  const [anchorEl, setAnchorEl] = useState(null)
  const [renaming, setRenaming] = useState(false)
  const [renameText, setRenameText] = useState(activity.title)
  const [confirm, setConfirm] = useState(EMPTY_CONFIRM)
  const clickTimer = useRef(null)
  const openConfirm = (o) => setConfirm({ ...EMPTY_CONFIRM, ...o, open: true })

  const tasks = activity.tasks || []
  const done = tasks.filter((t) => t.completed).length
  const open = sortTasksByUrgency(
    tasks.filter((t) => !t.completed || recentlyCompletedIds?.has?.(t.id))
  )
  const visible = open.slice(0, MAX_VISIBLE_TODOS)
  const hidden = open.length - visible.length

  const saveRename = () => {
    const next = renameText.trim()
    if (next && next !== activity.title) onRename(next)
    else setRenameText(activity.title)
    setRenaming(false)
  }

  const openWithDelay = () => {
    if (renaming) return
    clearTimeout(clickTimer.current)
    clickTimer.current = setTimeout(onOpenDetails, DETAIL_NAVIGATION_DELAY_MS)
  }

  return (
    <Slip
      band={stream?.color}
      sx={{
        px: 2,
        pt: 1.5,
        pb: 1.25,
        '&:hover .sheet-tools': { opacity: 1 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mt: 0.5,
        }}
      >
        <StreamMark stream={stream} label={stream?.name || activity.type} />
        <Box
          className="sheet-tools"
          sx={{
            display: 'flex',
            opacity: 0,
            transition: 'opacity 0.15s',
            '&:focus-within': { opacity: 1 },
          }}
        >
          {dragHandle && (
            <IconButton
              size="small"
              aria-label="Drag to reorder"
              {...dragHandle.attributes}
              {...dragHandle.listeners}
              sx={{
                p: 0.25,
                cursor: 'grab',
                touchAction: 'none',
                color: ff.inkSoft,
              }}
            >
              <DragIndicator fontSize="small" />
            </IconButton>
          )}
          <IconButton
            size="small"
            aria-label="Sheet options"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ p: 0.25, color: ff.inkSoft }}
          >
            <MoreHoriz fontSize="small" />
          </IconButton>
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          disableRestoreFocus
        >
          <MenuItem
            onClick={() => {
              setAnchorEl(null)
              setRenameText(activity.title)
              setRenaming(true)
            }}
          >
            Rename
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAnchorEl(null)
              openConfirm({
                title: 'Finish activity',
                message: `"${activity.title}" will be filed as completed.`,
                confirmLabel: 'Finish',
                onConfirm: onFinish,
              })
            }}
          >
            Finish activity
          </MenuItem>
          <Divider />
          <MenuItem
            sx={{ color: 'error.main' }}
            onClick={() => {
              setAnchorEl(null)
              openConfirm({
                title: 'Delete activity',
                message: `"${activity.title}" will be permanently removed.`,
                confirmLabel: 'Delete',
                danger: true,
                onConfirm: onDelete,
              })
            }}
          >
            Delete
          </MenuItem>
        </Menu>
      </Box>

      {renaming ? (
        <InputBase
          autoFocus
          fullWidth
          value={renameText}
          onChange={(e) => setRenameText(e.target.value)}
          onBlur={saveRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveRename()
            if (e.key === 'Escape') {
              setRenameText(activity.title)
              setRenaming(false)
            }
          }}
          inputProps={{ 'aria-label': 'Activity title' }}
          sx={{
            mt: 0.5,
            fontSize: '1.15rem',
            color: ff.ink,
            borderBottom: `1px solid ${ff.print}`,
          }}
        />
      ) : (
        <Typography
          component="h3"
          title="Open. Double-click to rename."
          onClick={openWithDelay}
          onDoubleClick={() => {
            clearTimeout(clickTimer.current)
            setRenameText(activity.title)
            setRenaming(true)
          }}
          sx={{
            mt: 0.5,
            fontSize: '1.15rem',
            lineHeight: 1.3,
            color: ff.ink,
            cursor: 'pointer',
            wordBreak: 'break-word',
            '&:hover': { color: ff.print },
          }}
        >
          {activity.title}
        </Typography>
      )}

      <Typography
        sx={{
          fontStyle: 'italic',
          fontSize: '0.78rem',
          color: 'text.secondary',
          mb: 0.75,
        }}
      >
        {tasks.length ? `${done} of ${tasks.length} done` : 'No todos yet'}
      </Typography>

      <Box sx={{ borderTop: `1px solid ${ff.ruleStrong}` }}>
        {visible.map((task) => (
          <Box
            key={task.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              minHeight: LINE,
              borderBottom: `1px solid ${ff.rule}`,
            }}
          >
            <TickBox
              checked={task.completed}
              onChange={() => onToggleTask(task.id)}
              label={`${task.completed ? 'Reopen' : 'Complete'} ${task.text}`}
            />
            {task.important && !task.completed && (
              <Star
                aria-label="Important"
                sx={{ fontSize: '0.8rem', color: ff.gold }}
              />
            )}
            <Typography
              onClick={onOpenDetails}
              sx={{
                flex: 1,
                minWidth: 0,
                fontSize: '0.88rem',
                color: task.completed ? 'text.secondary' : ff.ink,
                textDecoration: task.completed ? 'line-through' : 'none',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              {task.text}
            </Typography>
            {!task.completed && <TodoDueChip item={task} />}
            {!task.completed && !task.dueDate && <TodoAgeChip item={task} />}
          </Box>
        ))}
        <WriteLine onAdd={onAddTask} />
        {/* A couple of empty ruled lines finish the refill */}
        <Box aria-hidden sx={{ ...ruled(ff), height: LINE }} />
      </Box>

      {hidden > 0 && (
        <PenLink onClick={onOpenDetails} sx={{ mt: 0.5, fontSize: '0.8rem' }}>
          {hidden} more open on the full sheet
        </PenLink>
      )}

      <ConfirmDialog {...confirm} onCancel={() => setConfirm(EMPTY_CONFIRM)} />
    </Slip>
  )
}

export default ActivitySheet
