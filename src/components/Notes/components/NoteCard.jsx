import React from 'react'
import { Box, Paper, Typography } from '@mui/material'
import { PushPin } from '@mui/icons-material'
import StreamTag from '../../ActivitiesBoard/components/StreamTag'

const formatDate = (isoStr) => {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

// A single "pinned" note on the board. Rotation alternates slightly so the
// board reads like a real corkboard without undermining the app's look.
const NoteCard = ({ note, stream, onOpen, onOpenActivity, rotation = 0 }) => (
  <Paper
    elevation={0}
    onClick={onOpen}
    sx={{
      p: 2.25,
      mb: 2,
      breakInside: 'avoid',
      borderRadius: '16px',
      border: '1.5px solid',
      borderColor: 'divider',
      cursor: 'pointer',
      transform: `rotate(${rotation}deg)`,
      transition: 'border-color 0.15s, transform 0.15s',
      '&:hover': {
        borderColor: 'text.secondary',
        transform: `rotate(0deg)`,
      },
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 1,
      }}
    >
      <PushPin sx={{ fontSize: '1rem', color: 'text.disabled' }} />
      {stream && (
        <StreamTag stream={stream} label={stream.abbrev || stream.name} />
      )}
    </Box>

    {note.title && (
      <Typography
        sx={{ fontWeight: 800, fontSize: '1rem', mb: 0.75, lineHeight: 1.3 }}
      >
        {note.title}
      </Typography>
    )}

    <Typography
      variant="body2"
      sx={{
        color: 'text.secondary',
        whiteSpace: 'pre-wrap',
        display: '-webkit-box',
        WebkitLineClamp: 8,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}
    >
      {note.content}
    </Typography>

    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mt: 1.5,
      }}
    >
      {note.activityId ? (
        <Typography
          onClick={(e) => {
            e.stopPropagation()
            onOpenActivity?.(note.activityId)
          }}
          sx={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'text.secondary',
            cursor: 'pointer',
            '&:hover': { color: 'text.primary', textDecoration: 'underline' },
          }}
        >
          {note.activityTitle || 'Linked activity'}
        </Typography>
      ) : (
        <span />
      )}
      <Typography
        sx={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.66rem',
          color: 'text.disabled',
        }}
      >
        {formatDate(note.updatedAt)}
      </Typography>
    </Box>
  </Paper>
)

export default NoteCard
