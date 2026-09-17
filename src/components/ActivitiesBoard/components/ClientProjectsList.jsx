import React, { useRef, useState } from 'react'
import { Box, Typography, IconButton, TextField } from '@mui/material'
import { Delete } from '@mui/icons-material'
import ConfirmDialog from './ConfirmDialog'
import ProgressStrip from './ProgressStrip'
import { EmptyState, MONO } from '../../shared/ui'
import { useIsFilofax } from '../../../styles/useUiStyle'

const DETAIL_NAVIGATION_DELAY_MS = 180
const COLUMNS = {
  xs: '84px minmax(0, 1fr) 32px',
  md: '84px minmax(0, 1fr) 150px 170px 32px',
}
const MONTHS = [
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

const formatDate = (dateStr) => {
  if (!dateStr) return null
  const [year, month, day] = dateStr.split('-')
  return `${parseInt(day)} ${MONTHS[parseInt(month) - 1]} '${year.slice(2)}`
}

const headCell = {
  fontSize: '0.78rem',
  fontWeight: 800,
  color: 'text.secondary',
}

const StatusToggle = ({ isDone, accentColor, onClick }) => {
  const isFx = useIsFilofax()
  if (isFx) {
    return (
      <Box
        component="button"
        type="button"
        onClick={onClick}
        title={isDone ? 'Reopen project' : 'Mark project done'}
        sx={{
          fontFamily: 'inherit',
          fontStyle: 'italic',
          fontSize: '0.78rem',
          py: 0.2,
          cursor: 'pointer',
          borderRadius: '3px',
          border: '1.25px solid',
          borderColor: isDone ? 'divider' : 'primary.main',
          bgcolor: 'transparent',
          color: isDone ? 'text.secondary' : 'primary.main',
          '&:hover': { borderColor: 'primary.main' },
        }}
      >
        {isDone ? 'Done' : 'Active'}
      </Box>
    )
  }
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      title={isDone ? 'Reopen project' : 'Mark project done'}
      sx={{
        fontFamily: 'inherit',
        fontSize: '0.78rem',
        fontWeight: 800,
        py: 0.4,
        cursor: 'pointer',
        border: '2px solid',
        borderColor: isDone ? 'divider' : 'text.primary',
        bgcolor: isDone ? 'transparent' : accentColor,
        color: isDone ? 'text.secondary' : '#000',
        '&:hover': { borderColor: 'text.primary' },
      }}
    >
      {isDone ? 'Done' : 'Active'}
    </Box>
  )
}

const ProjectRow = ({
  project,
  accentColor,
  onToggleStatus,
  onDelete,
  onRename,
  onOpenDetails,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(project.title)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const clickTimerRef = useRef(null)
  const isFx = useIsFilofax()
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
    <Box
      role="row"
      sx={{
        display: 'grid',
        gridTemplateColumns: COLUMNS,
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 1.25,
        borderTop: '2px solid',
        borderColor: 'divider',
        '&:hover': { bgcolor: 'action.hover' },
        '&:hover .row-delete': { opacity: 1 },
      }}
    >
      <StatusToggle
        isDone={isDone}
        accentColor={accentColor}
        onClick={onToggleStatus}
      />

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
        />
      ) : (
        <Typography
          onDoubleClick={() => {
            if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
            setIsEditing(true)
          }}
          onClick={openDetailsWithClickDelay}
          title="Open project. Double-click to rename."
          sx={{
            fontSize: '1rem',
            fontWeight: isFx ? 400 : 800,
            color: isDone ? 'text.secondary' : 'text.primary',
            cursor: 'pointer',
            userSelect: 'none',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            '&:hover': {
              textDecoration: 'underline',
              textDecorationThickness: 2,
            },
          }}
        >
          {project.title}
        </Typography>
      )}

      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        {tasks.length > 0 ? (
          <ProgressStrip
            done={completedCount}
            total={tasks.length}
            color={isDone ? 'text.disabled' : accentColor}
          />
        ) : (
          <Typography sx={{ ...headCell, fontWeight: 600 }}>
            No todos
          </Typography>
        )}
      </Box>

      <Typography
        sx={{
          display: { xs: 'none', md: 'block' },
          fontFamily: isFx ? 'inherit' : MONO,
          fontStyle: isFx ? 'italic' : 'normal',
          fontSize: '0.78rem',
          color: 'text.secondary',
          whiteSpace: 'nowrap',
        }}
      >
        {formatDate(project.createdAt)} to{' '}
        {isDone ? formatDate(project.completedAt) : 'now'}
      </Typography>

      <IconButton
        size="small"
        className="row-delete"
        aria-label={`Delete ${project.title}`}
        onClick={() => setConfirmOpen(true)}
        sx={{
          opacity: 0,
          transition: 'opacity 0.15s',
          p: 0.25,
          '&:focus-visible': { opacity: 1 },
        }}
      >
        <Delete fontSize="small" />
      </IconButton>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete project"
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
  )
}

const ClientProjectsList = ({
  projects,
  accentColor = 'primary.main',
  onToggleStatus,
  onDelete,
  onRename,
  onOpenDetails,
}) => {
  const isFx = useIsFilofax()
  const sorted = [
    ...projects.filter((p) => p.status === 'active'),
    ...projects.filter((p) => p.status === 'done'),
  ]

  if (sorted.length === 0) {
    return (
      <EmptyState title="No projects yet.">
        Create one from New to track an engagement end to end.
      </EmptyState>
    )
  }

  return (
    <Box
      role="table"
      aria-label="Projects"
      sx={
        isFx
          ? { borderTop: '1px solid', borderColor: 'divider' }
          : {
              border: '3px solid',
              borderColor: 'text.primary',
              borderLeft: '10px solid',
              borderLeftColor: accentColor,
              bgcolor: 'background.paper',
            }
      }
    >
      <Box
        role="row"
        sx={{
          display: 'grid',
          gridTemplateColumns: COLUMNS,
          gap: 2,
          px: 2,
          py: 1,
          bgcolor: isFx ? 'transparent' : 'background.subtle',
        }}
      >
        <Typography sx={headCell}>Status</Typography>
        <Typography sx={headCell}>Project</Typography>
        <Typography sx={{ ...headCell, display: { xs: 'none', md: 'block' } }}>
          Todos
        </Typography>
        <Typography sx={{ ...headCell, display: { xs: 'none', md: 'block' } }}>
          Dates
        </Typography>
        <span />
      </Box>
      {sorted.map((project) => (
        <ProjectRow
          key={project.id}
          project={project}
          accentColor={accentColor}
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
