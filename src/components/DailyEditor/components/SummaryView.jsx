import React from 'react'
import { Box, Typography, Fade } from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'
import { resolveEntryStreamId } from '../../../utils/markdownParser'
import { InkButton, MONO } from '../../shared/ui'

const markdownSx = {
  fontSize: '1.02rem',
  lineHeight: 1.65,
  color: 'text.primary',
  maxWidth: '68ch',
  '& p': { mt: 0, mb: 1 },
  '& p:last-child': { mb: 0 },
  '& ul, & ol': { pl: 3, my: 0.5 },
  '& code': {
    fontFamily: MONO,
    fontSize: '0.88em',
    bgcolor: 'action.hover',
    px: 0.5,
  },
}

export const DaySheet = ({ status, onEdit, children }) => (
  <Fade in={true}>
    <Box
      sx={{
        border: '3px solid',
        borderColor: 'text.primary',
        bgcolor: 'background.paper',
        boxShadow: (t) => `8px 8px 0 ${t.palette.text.primary}`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          px: 3,
          py: 2,
          borderBottom: '3px solid',
          borderColor: 'text.primary',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 14,
              height: 14,
              bgcolor: 'primary.main',
              border: '2px solid',
              borderColor: 'text.primary',
            }}
          />
          <Typography sx={{ fontWeight: 900, fontSize: '1.1rem' }}>
            {status}
          </Typography>
        </Box>
        <InkButton
          tone="outline"
          size="sm"
          startIcon={<EditIcon />}
          onClick={onEdit}
        >
          Edit day
        </InkButton>
      </Box>
      {children}
    </Box>
  </Fade>
)

const StreamRow = ({ stream, children, first }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: '220px minmax(0, 1fr)' },
      borderTop: first ? 'none' : '3px solid',
      borderColor: 'text.primary',
    }}
  >
    <Box
      sx={{
        px: 3,
        py: 2.5,
        borderLeft: '10px solid',
        borderLeftColor: stream.color,
        borderRight: { md: '2px solid' },
        borderRightColor: { md: 'divider' },
        bgcolor: 'background.subtle',
      }}
    >
      <Typography sx={{ fontWeight: 900, lineHeight: 1.2 }}>
        {stream.name}
      </Typography>
    </Box>
    <Box
      sx={{
        px: 3,
        py: 2.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
      }}
    >
      {children}
    </Box>
  </Box>
)

const SummaryView = ({ streams, streamDefs = [], projectEntries, onEdit }) => {
  const hasProjectEntries = projectEntries?.some((p) => p.content?.trim())

  if (hasProjectEntries) {
    const rows = streamDefs
      .map((stream) => ({
        stream,
        entries: projectEntries.filter(
          (p) => resolveEntryStreamId(p) === stream.id && p.content?.trim()
        ),
      }))
      .filter((r) => r.entries.length > 0)
    const entryCount = rows.reduce((n, r) => n + r.entries.length, 0)

    return (
      <DaySheet
        onEdit={onEdit}
        status={`Logged ${entryCount} ${entryCount === 1 ? 'entry' : 'entries'} across ${rows.length} ${rows.length === 1 ? 'stream' : 'streams'}`}
      >
        {rows.map(({ stream, entries }, i) => (
          <StreamRow key={stream.id} stream={stream} first={i === 0}>
            {entries.map((project) => (
              <Box key={project.title}>
                <Typography
                  sx={{ fontWeight: 900, fontSize: '1.05rem', mb: 0.75 }}
                >
                  {project.title}
                </Typography>
                <Box sx={markdownSx}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {project.content}
                  </ReactMarkdown>
                </Box>
              </Box>
            ))}
          </StreamRow>
        ))}
      </DaySheet>
    )
  }

  return (
    <DaySheet onEdit={onEdit} status="Logged in the older stream format">
      {streamDefs.map((stream, i) => (
        <StreamRow key={stream.id} stream={stream} first={i === 0}>
          {streams[stream.id] ? (
            <Box sx={markdownSx}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeRaw]}
              >
                {streams[stream.id]}
              </ReactMarkdown>
            </Box>
          ) : (
            <Typography sx={{ color: 'text.disabled' }}>
              Nothing logged for this stream.
            </Typography>
          )}
        </StreamRow>
      ))}
    </DaySheet>
  )
}

export default SummaryView
