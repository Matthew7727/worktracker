import React from 'react'
import { Box, Paper, Typography } from '@mui/material'
import { PushPin } from '@mui/icons-material'
import { FONT, hardShadow, OFFSET, RULE } from '../../../styles/tokens'

const formatDate = (isoStr) => {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

const StreamSignal = ({ stream, label }) => {
  const color = stream?.color || '#9e9e9e'
  const text = label || stream?.abbrev || '—'

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1,
        py: 0.25,
        border: `${RULE.hair}px solid`,
        borderColor: color,
        color,
        fontSize: '0.64rem',
        fontWeight: 800,
        flexShrink: 0,
      }}
    >
      <Box
        component="span"
        sx={{
          width: 7,
          height: 7,
          bgcolor: color,
          flexShrink: 0,
        }}
      />
      {text}
    </Box>
  )
}

const NoteCard = ({ note, stream, onOpen, onOpenActivity }) => (
  <Paper
    elevation={0}
    onClick={onOpen}
    sx={{
      p: 2.25,
      mb: 2,
      breakInside: 'avoid',
      border: `${RULE.base}px solid`,
      borderColor: 'text.primary',
      boxShadow: (theme) => hardShadow(OFFSET.base, theme.palette.text.primary),
      cursor: 'pointer',
      transition:
        'border-color 0.12s ease, transform 0.12s ease, box-shadow 0.12s ease',
      '&:hover': {
        borderColor: 'text.primary',
        transform: `translate(-${OFFSET.press}px, -${OFFSET.press}px)`,
        boxShadow: (theme) =>
          hardShadow(OFFSET.lift, theme.palette.text.primary),
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
        <StreamSignal stream={stream} label={stream.abbrev || stream.name} />
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
          fontFamily: FONT.data,
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
