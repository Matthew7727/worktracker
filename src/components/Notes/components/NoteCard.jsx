import React from 'react'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import { Edit } from '@mui/icons-material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { MONO } from '../../shared/ui'
import { useIsFilofax, useFilofaxTokens } from '../../../styles/useUiStyle'
import { LINE, ruled, inkMarkdown } from '../../../filofax/paperStyles'

const formatDate = (isoStr) => {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// An index card pinned to the board. Linked notes carry their stream's colour
// as the card's top band; free-standing notes stay plain.
const NoteCard = ({
  note,
  stream,
  onOpen,
  onEdit,
  onOpenLinkedItem,
  draggable = false,
}) => {
  const isFx = useIsFilofax()
  const ff = useFilofaxTokens()
  return (
    <Box
      component="article"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen?.()
        }
      }}
      sx={{
        p: 2.25,
        pt: 1.75,
        mb: 3,
        breakInside: 'avoid',
        bgcolor: 'background.paper',
        ...(isFx
          ? {
              border: `1px solid ${ff.rule}`,
              borderRadius: '6px',
              borderTop: `5px solid ${stream?.color || ff.ruleStrong}`,
              boxShadow: `0 1px 0 ${ff.pageShade}, 0 6px 14px rgba(42,10,13,0.08)`,
            }
          : {
              border: '2.5px solid',
              borderColor: 'text.primary',
              borderTop: '10px solid',
              borderTopColor: stream?.color || 'text.primary',
              boxShadow: (t) => `4px 4px 0 ${t.palette.text.primary}`,
            }),
        cursor: draggable ? 'grab' : 'pointer',
        ...(draggable && { '&:active': { cursor: 'grabbing' } }),
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
          sx={{
            fontSize: '0.78rem',
            fontWeight: isFx ? 400 : 800,
            fontStyle: isFx ? 'italic' : 'normal',
            color: isFx ? 'primary.main' : 'text.secondary',
          }}
        >
          {stream?.name || (note.activityId || note.projectId ? '' : 'Unfiled')}
        </Typography>
        <Typography
          sx={{
            fontFamily: isFx ? 'inherit' : MONO,
            fontStyle: isFx ? 'italic' : 'normal',
            fontSize: '0.75rem',
            color: 'text.secondary',
          }}
        >
          {formatDate(note.updatedAt)}
        </Typography>
        {onEdit && (
          <Tooltip title="Edit note">
            <IconButton
              size="small"
              aria-label={`Edit ${note.title || 'note'}`}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              sx={{ ml: -0.5, p: 0.5 }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {note.title && (
        <Typography
          component="h2"
          sx={{
            fontWeight: isFx ? 400 : 900,
            fontSize: isFx ? '1.1rem' : '1.2rem',
            letterSpacing: isFx ? 0 : '-0.02em',
            lineHeight: 1.2,
            mb: 0.75,
          }}
        >
          {note.title}
        </Typography>
      )}

      <Box
        sx={
          isFx
            ? {
                ...ruled(ff),
                ...inkMarkdown(ff),
                fontSize: '0.9rem',
                maxHeight: LINE * 9,
                overflow: 'hidden',
              }
            : {
                fontSize: '0.95rem',
                lineHeight: 1.55,
                maxHeight: '15.5em',
                overflow: 'hidden',
                '& p': { m: 0, mb: 0.75, '&:last-child': { mb: 0 } },
                '& ul, & ol': { my: 0.5, pl: 2.5 },
                '& li': { mb: 0.2 },
                '& code': { fontFamily: MONO, fontSize: '0.88em' },
              }
        }
      >
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
          {note.content}
        </ReactMarkdown>
      </Box>

      {(note.activityId || note.projectId) && (
        <Box
          component="button"
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onOpenLinkedItem?.(
              note.projectId ? 'project' : 'activity',
              note.projectId || note.activityId
            )
          }}
          sx={{
            mt: 1.75,
            pt: 1.25,
            width: '100%',
            textAlign: 'left',
            border: 'none',
            borderTop: isFx ? '1px solid' : '2px solid',
            borderColor: 'divider',
            background: 'none',
            fontFamily: 'inherit',
            fontSize: '0.82rem',
            fontWeight: isFx ? 400 : 800,
            fontStyle: isFx ? 'italic' : 'normal',
            color: 'text.primary',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {note.projectTitle || note.activityTitle || 'Linked item'}
        </Box>
      )}
    </Box>
  )
}

export default NoteCard
