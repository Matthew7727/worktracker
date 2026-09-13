import React from 'react'
import { Box, Paper, Typography, IconButton, Stack, Chip } from '@mui/material'
import { Close } from '@mui/icons-material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { FONT, RULE } from '../../../styles/tokens'

const ACCENT = '#00d2ff'

const STREAM_COLORS = {
  'client work': '#80b621',
  'practice development': '#ffd166',
  'business development': '#eb8449',
}

const getH1Color = (children) => {
  const text = String(children).toLowerCase().trim()
  return STREAM_COLORS[text] ?? ACCENT
}

const markdownComponents = {
  h1: ({ children }) => (
    <h1
      style={{
        fontSize: '1rem',
        fontWeight: 800,
        letterSpacing: '-0.01em',
        borderBottom: `${RULE.hair}px solid ${getH1Color(children)}`,
        paddingBottom: '4px',
        marginTop: '20px',
        marginBottom: '10px',
        lineHeight: 1.2,
      }}
    >
      {children}
    </h1>
  ),
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'Unknown Date'
  const d = new Date(dateStr + 'T12:00:00')
  return d
    .toLocaleDateString('default', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    .toUpperCase()
}

const EntryViewer = ({ entry, onClose }) => {
  return (
    <Paper
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'none',
        border: `${RULE.base}px solid`,
        borderColor: 'text.primary',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 1.25,
          borderBottom: `${RULE.hair}px solid`,
          borderColor: 'text.primary',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography
            sx={{
              fontSize: '0.65rem',
              fontWeight: 700,
              color: 'text.secondary',
              fontFamily: FONT.data,
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {formatDate(entry.date)}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        {(() => {
          const clientProjects = entry.metadata?.clientProjects || []
          const pdActivities = entry.metadata?.pdActivities || []
          const bdActivities = entry.metadata?.bdActivities || []
          const allTags = [
            ...clientProjects.map((t) => ({
              label: t,
              color: STREAM_COLORS['client work'],
            })),
            ...pdActivities.map((t) => ({
              label: t,
              color: STREAM_COLORS['practice development'],
            })),
            ...bdActivities.map((t) => ({
              label: t,
              color: STREAM_COLORS['business development'],
            })),
          ]
          if (allTags.length === 0) return null
          return (
            <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1 }}>
              {allTags.map(({ label, color }) => (
                <Chip
                  key={label}
                  label={label}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.6rem',
                    height: 18,
                    border: `${RULE.hair}px solid`,
                    borderColor: color,
                    bgcolor: 'transparent',
                    color: color,
                    '& .MuiChip-label': { px: '6px' },
                  }}
                />
              ))}
            </Stack>
          )
        })()}
      </Box>

      {/* Markdown content */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 3,
          py: 2.5,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: ACCENT },
          // Markdown typography
          '& h1, & h2, & h3, & p, & ul, & ol, & blockquote': {
            maxWidth: '68ch',
          },
          '& h2': {
            fontSize: '0.82rem',
            fontWeight: 800,
            letterSpacing: '-0.01em',
            marginTop: '14px',
            marginBottom: '6px',
          },
          '& h3': {
            fontSize: '0.78rem',
            fontWeight: 700,
            marginTop: '10px',
            marginBottom: '4px',
          },
          '& p': {
            fontSize: '0.82rem',
            lineHeight: 1.6,
            fontWeight: 400,
            marginBottom: '10px',
          },
          '& ul, & ol': { paddingLeft: '20px', marginBottom: '10px' },
          '& li': { fontSize: '0.82rem', lineHeight: 1.6, marginBottom: '2px' },
          '& strong': { fontWeight: 800 },
          '& em': { fontStyle: 'italic' },
          '& code': {
            fontFamily: FONT.data,
            fontSize: '0.72rem',
            bgcolor: 'action.hover',
            px: '4px',
            py: '1px',
            border: `${RULE.hair}px solid`,
            borderColor: 'divider',
          },
          '& pre': {
            bgcolor: 'action.hover',
            border: `${RULE.base}px solid`,
            borderColor: 'text.primary',
            p: '12px',
            overflowX: 'auto',
            mb: '12px',
            '& code': { border: 'none', bgcolor: 'transparent', p: 0 },
          },
          '& blockquote': {
            borderLeft: `${RULE.base}px solid ${ACCENT}`,
            paddingLeft: '12px',
            marginLeft: 0,
            color: 'text.secondary',
          },
          '& hr': {
            border: 'none',
            borderTop: `${RULE.hair}px solid`,
            borderColor: 'text.primary',
            my: '16px',
          },
          '& a': { color: ACCENT, textDecoration: 'underline' },
        }}
      >
        {entry.content ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={markdownComponents}
          >
            {entry.content}
          </ReactMarkdown>
        ) : (
          <Typography sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
            No content
          </Typography>
        )}
      </Box>
    </Paper>
  )
}

export default EntryViewer
