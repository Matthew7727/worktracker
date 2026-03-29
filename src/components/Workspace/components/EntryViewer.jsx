import React from 'react'
import { Box, Paper, Typography, IconButton } from '@mui/material'
import { Close } from '@mui/icons-material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

const ACCENT = '#00d2ff'

const STREAM_COLORS = {
  'client work': '#80b621',
  'practice development': '#4a6b13',
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
        fontSize: '0.9rem',
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        borderBottom: `2px solid ${getH1Color(children)}`,
        paddingBottom: '4px',
        marginTop: '20px',
        marginBottom: '10px',
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
        borderRadius: '24px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          py: 1.25,
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.65rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: 'text.secondary',
            fontFamily: '"JetBrains Mono", monospace',
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
          '& h2': {
            fontSize: '0.82rem',
            fontWeight: 800,
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
            lineHeight: 1.75,
            marginBottom: '10px',
          },
          '& ul, & ol': { paddingLeft: '20px', marginBottom: '10px' },
          '& li': { fontSize: '0.82rem', lineHeight: 1.7, marginBottom: '2px' },
          '& strong': { fontWeight: 800 },
          '& em': { fontStyle: 'italic' },
          '& code': {
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.72rem',
            bgcolor: 'action.hover',
            px: '4px',
            py: '1px',
            border: '1px solid',
            borderColor: 'divider',
          },
          '& pre': {
            bgcolor: 'action.hover',
            border: '2px solid black',
            p: '12px',
            overflowX: 'auto',
            mb: '12px',
            '& code': { border: 'none', bgcolor: 'transparent', p: 0 },
          },
          '& blockquote': {
            borderLeft: `3px solid ${ACCENT}`,
            paddingLeft: '12px',
            marginLeft: 0,
            color: 'text.secondary',
          },
          '& hr': { border: 'none', borderTop: '2px solid black', my: '16px' },
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
