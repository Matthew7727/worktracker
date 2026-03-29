import React from 'react'
import { Box, Typography, Stack, Chip } from '@mui/material'
import { EmojiEvents } from '@mui/icons-material'

const COLORS = { CW: '#80b621', PD: '#4a6b13', BD: '#eb8449' }

const RecentAccomplishments = ({ projects }) => {
  const completed = [
    ...projects.clientProjects
      .filter((p) => p.status === 'archived' || p.status === 'completed')
      .map((p) => ({ ...p, category: 'CW' })),
    ...projects.activities
      .filter((a) => a.status === 'archived' || a.status === 'completed')
      .map((a) => ({ ...a, category: a.type })),
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
          sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}
        >
          Recent Accomplishments
        </Typography>
      </Stack>
      {completed.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          No completed work yet — keep going!
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {completed.map((item) => {
            const color = COLORS[item.category] || '#888'
            const dateStr = item.completedAt || null
            return (
              <Box
                key={item.id}
                sx={{
                  p: 1.5,
                  border: '2px solid black',
                  borderRadius: 2,
                  boxShadow: '3px 3px 0px #000',
                  borderLeft: `5px solid ${color}`,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Chip
                      label={item.category}
                      size="small"
                      sx={{
                        fontWeight: 900,
                        fontSize: '0.65rem',
                        bgcolor: color,
                        color: 'white',
                        border: '1.5px solid black',
                        height: 20,
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {item.title}
                    </Typography>
                  </Stack>
                  {dateStr && (
                    <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.5 }}>
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
