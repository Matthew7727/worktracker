import React, { useState } from 'react'
import { Box, Typography, IconButton } from '@mui/material'
import { Close } from '@mui/icons-material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { useAppContext } from '../../../context/AppContext'
import { MONO } from '../../shared/ui'
import GoalLinkPicker from '../../Goals/GoalLinkPicker'
import { writeFile } from '../../../services/fileSystem'
import { stringifyMarkdown } from '../../../utils/markdownParser'

// Older entries keep the three original stream names as H1 sections.
const LEGACY_STREAM_COLORS = {
  'client work': '#80b621',
  'practice development': '#ffd166',
  'business development': '#eb8449',
}

const EntryViewer = ({ entry, onClose }) => {
  const { streams = [] } = useAppContext()
  const [streamGoalIds, setStreamGoalIds] = useState(
    entry.metadata?.streamGoalIds || {}
  )
  const [linkingStream, setLinkingStream] = useState(null)

  const setStreamGoals = async (streamKey, nextGoalIds) => {
    const next = { ...streamGoalIds, [streamKey]: nextGoalIds }
    setStreamGoalIds(next)
    await writeFile(
      entry.path,
      stringifyMarkdown(entry.content || '', {
        ...(entry.metadata || {}),
        streamGoalIds: next,
        lastModified: new Date().toISOString(),
      })
    )
  }

  const colorForHeading = (children) => {
    const text = String(children).toLowerCase().trim()
    return (
      streams.find((s) => s.name.toLowerCase() === text)?.color ||
      LEGACY_STREAM_COLORS[text] ||
      'text.primary'
    )
  }

  const markdownComponents = {
    h1: ({ children }) => {
      const heading = String(children)
      const streamKey = heading.toLowerCase().trim()
      return (
        <Box
          component="h2"
          sx={{
            fontSize: '1.2rem',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            borderLeft: '8px solid',
            borderColor: colorForHeading(children),
            pl: 1.5,
            mt: 4,
            mb: 1.5,
            '&:first-of-type': { mt: 0 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="span" sx={{ flex: 1 }}>
              {children}
            </Box>
            <Box
              component="button"
              type="button"
              onClick={() =>
                setLinkingStream(linkingStream === streamKey ? null : streamKey)
              }
              sx={{
                border: '1.5px solid',
                borderColor: 'text.primary',
                bgcolor:
                  linkingStream === streamKey ? 'text.primary' : 'transparent',
                color:
                  linkingStream === streamKey
                    ? 'background.paper'
                    : 'text.primary',
                fontFamily: 'inherit',
                fontSize: '.68rem',
                fontWeight: 800,
                px: 0.8,
                py: 0.35,
                cursor: 'pointer',
              }}
            >
              Link
            </Box>
          </Box>
          {linkingStream === streamKey && (
            <Box sx={{ mt: 1.25, maxWidth: 420 }}>
              <GoalLinkPicker
                value={streamGoalIds[streamKey] || []}
                onChange={(goalIds) => setStreamGoals(streamKey, goalIds)}
                label={`Goals supported by ${heading}`}
              />
            </Box>
          )}
        </Box>
      )
    },
  }

  const d = entry.date ? new Date(entry.date + 'T12:00:00') : null
  const tags = [
    ...(entry.metadata?.clientProjects || []).map((t) => [
      t,
      LEGACY_STREAM_COLORS['client work'],
    ]),
    ...(entry.metadata?.pdActivities || []).map((t) => [
      t,
      LEGACY_STREAM_COLORS['practice development'],
    ]),
    ...(entry.metadata?.bdActivities || []).map((t) => [
      t,
      LEGACY_STREAM_COLORS['business development'],
    ]),
  ]

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        component="header"
        sx={{
          px: 4,
          pt: 3,
          pb: 2.25,
          borderBottom: '3px solid',
          borderColor: 'text.primary',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: MONO,
                fontWeight: 700,
                color: 'text.secondary',
                fontSize: '0.85rem',
              }}
            >
              {entry.date || 'Unknown date'}
            </Typography>
            <Typography
              component="h1"
              sx={{
                fontSize: '2.25rem',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 1,
              }}
            >
              {d
                ? d.toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })
                : 'Entry'}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            aria-label="Close entry"
            sx={{ border: '2.5px solid', borderColor: 'text.primary' }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
        {tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1.5 }}>
            {tags.map(([label, color]) => (
              <Box
                key={label}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  fontSize: '0.82rem',
                  fontWeight: 800,
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    bgcolor: color,
                    border: '1.5px solid',
                    borderColor: 'text.primary',
                  }}
                />
                {label}
              </Box>
            ))}
          </Box>
        )}
      </Box>
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 4,
          py: 3,
          '& > *': { maxWidth: '70ch' },
          '& h2, & h3': {
            fontSize: '1rem',
            fontWeight: 900,
            mt: 2.5,
            mb: 0.75,
          },
          '& p, & li': { fontSize: '1rem', lineHeight: 1.65 },
          '& p': { mt: 0, mb: 1.25 },
          '& ul, & ol': { pl: 3, mb: 1.25 },
          '& strong': { fontWeight: 800 },
          '& code': {
            fontFamily: MONO,
            fontSize: '0.88em',
            bgcolor: 'action.hover',
            px: 0.5,
          },
          '& pre': {
            bgcolor: 'background.subtle',
            border: '2px solid',
            borderColor: 'text.primary',
            p: 1.5,
            overflowX: 'auto',
            '& code': { bgcolor: 'transparent', p: 0 },
          },
          '& blockquote': {
            borderLeft: '4px solid',
            borderColor: 'text.primary',
            pl: 1.5,
            ml: 0,
            color: 'text.secondary',
          },
          '& hr': {
            border: 'none',
            borderTop: '3px solid',
            borderColor: 'text.primary',
            my: 3,
          },
          '& a': { color: 'text.primary', textDecorationThickness: '2px' },
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
          <Typography sx={{ color: 'text.secondary' }}>
            This day has no written content.
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default EntryViewer
