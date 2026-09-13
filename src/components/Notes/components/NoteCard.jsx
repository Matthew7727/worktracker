import React from 'react'
import { Box, Typography } from '@mui/material'
import { MONO } from '../../shared/ui'

const formatDate = (isoStr) => {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// An index card pinned to the board. Linked notes carry their stream's colour
// as the card's top band; free-standing notes stay plain.
const NoteCard = ({ note, stream, onOpen, onOpenActivity }) => (
  <Box
    component="article"
    role="button"
    tabIndex={0}
    onClick={onOpen}
    onKeyDown={(e) => {
      if (e.key === 'Enter') onOpen?.()
    }}
    sx={{
      p: 2.25,
      pt: 1.75,
      mb: 3,
      breakInside: 'avoid',
      bgcolor: 'background.paper',
      border: '2.5px solid',
      borderColor: 'text.primary',
      borderTop: '10px solid',
      borderTopColor: stream?.color || 'text.primary',
      boxShadow: (t) => `4px 4px 0 ${t.palette.text.primary}`,
      cursor: 'pointer',
      '&:focus-visible': {
        outline: '3px solid',
        outlineColor: 'primary.main',
        outlineOffset: 3,
      },
    }}
  >
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: 1,
        mb: 1,
      }}
    >
      <Typography
        sx={{ fontSize: '0.78rem', fontWeight: 800, color: 'text.secondary' }}
      >
        {stream?.name || (note.activityId ? '' : 'Unfiled')}
      </Typography>
      <Typography
        sx={{ fontFamily: MONO, fontSize: '0.75rem', color: 'text.secondary' }}
      >
        {formatDate(note.updatedAt)}
      </Typography>
    </Box>

    {note.title && (
      <Typography
        component="h2"
        sx={{
          fontWeight: 900,
          fontSize: '1.2rem',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
          mb: 0.75,
        }}
      >
        {note.title}
      </Typography>
    )}

    <Typography
      sx={{
        fontSize: '0.95rem',
        lineHeight: 1.55,
        whiteSpace: 'pre-wrap',
        display: '-webkit-box',
        WebkitLineClamp: 10,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}
    >
      {note.content}
    </Typography>

    {note.activityId && (
      <Box
        component="button"
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onOpenActivity?.(note.activityId)
        }}
        sx={{
          mt: 1.75,
          pt: 1.25,
          width: '100%',
          textAlign: 'left',
          border: 'none',
          borderTop: '2px solid',
          borderColor: 'divider',
          background: 'none',
          fontFamily: 'inherit',
          fontSize: '0.82rem',
          fontWeight: 800,
          color: 'text.primary',
          cursor: 'pointer',
          '&:hover': { textDecoration: 'underline' },
        }}
      >
        {note.activityTitle || 'Linked activity'}
      </Box>
    )}
  </Box>
)

export default NoteCard
