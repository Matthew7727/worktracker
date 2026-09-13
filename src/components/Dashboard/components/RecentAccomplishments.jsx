import React from 'react'
import { Box, Typography, Stack, Chip } from '@mui/material'
import { EmojiEvents } from '@mui/icons-material'
import { useAppContext } from '../../../context/AppContext'
import { getActivityStreamId } from '../../../utils/projectsManager'
import { getStreamAbbrev } from '../../../utils/streamConfig'
import { FONT, OFFSET, RULE, hardShadow } from '../../../styles/tokens'

const RecentAccomplishments = ({ projects }) => {
  const { streamConfig, mainFocusStream } = useAppContext()
  const streamById = Object.fromEntries(
    (streamConfig?.streams || []).map((s) => [s.id, s])
  )

  const completed = [
    ...projects.clientProjects
      .filter((p) => p.status === 'archived' || p.status === 'completed')
      .map((p) => ({ ...p, stream: mainFocusStream })),
    ...projects.activities
      .filter((a) => a.status === 'archived' || a.status === 'completed')
      .map((a) => ({ ...a, stream: streamById[getActivityStreamId(a)] })),
  ]
    .sort((a, b) => {
      const dateA = new Date(a.completedAt || a.createdAt)
      const dateB = new Date(b.completedAt || b.createdAt)
      return dateB - dateA
    })
    .slice(0, 6)

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <EmojiEvents sx={{ fontSize: 20, opacity: 0.7 }} />
        <Typography
          variant="body1"
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.02em',
            opacity: 0.7,
          }}
        >
          Recent accomplishments
        </Typography>
      </Stack>
      {completed.length === 0 ? (
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', fontStyle: 'italic' }}
        >
          No completed work yet — keep going!
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {completed.map((item) => {
            const color = item.stream?.color || '#888'
            const label = item.stream ? getStreamAbbrev(item.stream) : '—'
            const dateStr = item.completedAt || null
            return (
              <Box
                key={item.id}
                sx={{
                  p: 1.5,
                  border: `${RULE.hair}px solid`,
                  borderColor: 'text.primary',
                  boxShadow: (theme) =>
                    hardShadow(OFFSET.base, theme.palette.text.primary),
                  borderLeft: `${RULE.heavy}px solid ${color}`,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Chip
                      label={label}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.65rem',
                        bgcolor: color,
                        color: 'background.paper',
                        border: `${RULE.hair}px solid`,
                        borderColor: 'text.primary',
                        height: 20,
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {item.title}
                    </Typography>
                  </Stack>
                  {dateStr && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: FONT.data,
                        fontWeight: 700,
                        opacity: 0.5,
                      }}
                    >
                      {dateStr}
                    </Typography>
                  )}
                </Stack>
              </Box>
            )
          })}
        </Stack>
      )}
    </Box>
  )
}

export default RecentAccomplishments
