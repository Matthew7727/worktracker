import React from 'react'
import { Box, Typography, Stack, Chip } from '@mui/material'
import { Schedule, Warning } from '@mui/icons-material'

const STALE_THRESHOLD = 30
const COLORS = { CW: '#80b621', PD: '#4a6b13', BD: '#eb8449' }

const ProjectDurationsWidget = ({ projects }) => {
  const allActive = [
    ...projects.clientProjects
      .filter((p) => p.status === 'active')
      .map((p) => ({ ...p, category: 'CW' })),
    ...projects.activities
      .filter((a) => a.status === 'active')
      .map((a) => ({ ...a, category: a.type })),
  ]
    .map((item) => ({
      ...item,
      age: Math.floor((new Date() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24)),
    }))
    .sort((a, b) => b.age - a.age)

  if (allActive.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
        No active work items.
      </Typography>
    )
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Schedule sx={{ fontSize: 20, opacity: 0.7 }} />
        <Typography
          variant="body1"
          sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}
        >
          Work Lifecycle
        </Typography>
      </Stack>
      <Stack spacing={1.5}>
        {allActive.map((item) => {
          const isStale = item.age >= STALE_THRESHOLD
          const color = COLORS[item.category] || '#888'
          // Bar width relative to 90 days max
          const barWidth = Math.min((item.age / 90) * 100, 100)
          return (
            <Box key={item.id}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 0.5 }}
              >
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  {isStale && <Warning sx={{ fontSize: 14, color: 'error.main' }} />}
                  <Chip
                    label={item.category}
                    size="small"
                    sx={{
                      fontWeight: 900,
                      fontSize: '0.6rem',
                      bgcolor: isStale ? 'error.main' : color,
                      color: 'white',
                      border: '1.5px solid black',
                      height: 18,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: isStale ? 'error.main' : 'text.primary',
                    }}
                  >
                    {item.title}
                  </Typography>
                </Stack>
                <Typography variant="caption" sx={{ fontWeight: 900, opacity: 0.7 }}>
                  {item.age}d
                </Typography>
              </Stack>
              <Box
                sx={{
                  height: 6,
                  borderRadius: 3,
                  border: '1.5px solid black',
                  bgcolor: 'white',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    width: `${barWidth}%`,
                    bgcolor: isStale ? 'error.main' : color,
                    borderRadius: 3,
                  }}
                />
              </Box>
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}

export default ProjectDurationsWidget
