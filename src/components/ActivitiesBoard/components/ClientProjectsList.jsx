import React, { useRef, useState } from 'react'
import { Box, Paper, Typography, IconButton, TextField } from '@mui/material'
import { Delete } from '@mui/icons-material'
import ConfirmDialog from './ConfirmDialog'
import ProgressStrip from './ProgressStrip'

const DETAIL_NAVIGATION_DELAY_MS = 180

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

const StatusPill = ({ isDone, onClick }) => (
  <Box
    component="button"
    onClick={onClick}
    title={isDone ? 'Click to reopen' : 'Click to mark done'}
    sx={{
      fontFamily: 'inherit',
      fontSize: '0.66rem',
      fontWeight: 800,
      px: 1.5,
      py: 0.4,
      borderRadius: '999px',
      cursor: 'pointer',
      flexShrink: 0,
      ...(isDone
        ? {
            bgcolor: 'transparent',
            border: '1.5px solid',
            borderColor: 'divider',
            color: 'text.disabled',
          }
        : {
            bgcolor: 'primary.main',
            border: '1.5px solid transparent',
            color: '#fff',
          }),
    }}
  >
    {isDone ? 'Done' : 'Active'}
  </Box>
)

const ProjectCard = ({
  project,
  onToggleStatus,
  onDelete,
  onRename,
  onOpenDetails,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(project.title)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const clickTimerRef = useRef(null)
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

  const openDetailsWithClickDelay = () => {
    if (!onOpenDetails) return
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
    clickTimerRef.current = setTimeout(() => {
      onOpenDetails()
      clickTimerRef.current = null
    }, DETAIL_NAVIGATION_DELAY_MS)
  }

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2.5,
        py: 1.5,
        borderRadius: '16px',
        border: '1.5px solid',
        borderColor: 'divider',
        opacity: isDone ? 0.6 : 1,
        transition: 'border-color 0.15s, opacity 0.2s',
        '&:hover': { borderColor: 'text.secondary' },
        '&:hover .row-delete': { opacity: 1 },
      }}
    >
      <StatusPill isDone={isDone} onClick={onToggleStatus} />

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
          onDoubleClick={() => {
            if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
            setIsEditing(true)
          }}
          onClick={openDetailsWithClickDelay}
          title="Double-click to rename"
          sx={{
            flex: 1,
            fontSize: '0.95rem',
            fontWeight: 800,
            color: isDone ? 'text.secondary' : 'text.primary',
            cursor: 'pointer',
            userSelect: 'none',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {project.title}
        </Typography>
      )}

      {tasks.length > 0 && (
        <Box sx={{ width: 130, flexShrink: 0 }}>
          <ProgressStrip
            done={completedCount}
            total={tasks.length}
            color={isDone ? 'text.disabled' : 'primary.main'}
          />
        </Box>
      )}

      <Typography
        sx={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.68rem',
          color: 'text.secondary',
          fontVariantNumeric: 'tabular-nums',
          flexShrink: 0,
          fontStyle: isDone ? 'normal' : 'italic',
        }}
      >
        {formatDate(project.createdAt)} →{' '}
        {isDone ? formatDate(project.completedAt) : 'ongoing'}
      </Typography>

      <IconButton
        size="small"
        className="row-delete"
        onClick={() => setConfirmOpen(true)}
        sx={{ opacity: 0, transition: 'opacity 0.15s', flexShrink: 0, p: 0.25 }}
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
    </Paper>
  )
}

const ClientProjectsList = ({
  projects,
  onToggleStatus,
  onDelete,
  onRename,
  onOpenDetails,
}) => {
  const sorted = [
    ...projects.filter((p) => p.status === 'active'),
    ...projects.filter((p) => p.status === 'done'),
  ]

  if (sorted.length === 0) {
    return (
      <Box
        sx={{
          py: 2.5,
          px: 2,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: '16px',
        }}
      >
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No client projects yet.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      {sorted.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onToggleStatus={() => onToggleStatus(project.id)}
          onDelete={() => onDelete(project.id)}
          onRename={(title) => onRename(project.id, title)}
          onOpenDetails={() => onOpenDetails?.(project.id)}
        />
      ))}
    </Box>
  )
}

export default ClientProjectsList
