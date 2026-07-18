import React from 'react'
import { Box, Typography, Stack, LinearProgress, Skeleton } from '@mui/material'
import WeeklyChart from '../WeeklyChart'
import { useAppContext } from '../../../context/AppContext'

const StreamBar = ({ label, value, total, color }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 900 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 900 }}>
          {Math.round(percentage)}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 12,
          borderRadius: 6,
          border: '2px solid',
          borderColor: 'text.primary',
          bgcolor: 'background.paper',
          '& .MuiLinearProgress-bar': { bgcolor: color },
        }}
      />
      <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.6 }}>
        {value.toLocaleString()} {value === 1 ? 'entry' : 'entries'}
      </Typography>
    </Box>
  )
}

const sectionLabel = {
  fontWeight: 900,
  mb: 3,
  textTransform: 'uppercase',
  letterSpacing: 1,
  opacity: 0.7,
}

const StreamAlignment = ({ entries, stats, loading }) => {
  const { streams } = useAppContext()
  const totalMentions = Object.values(stats.mentionsByStream || {}).reduce(
    (a, b) => a + b,
    0
  )

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 6,
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'flex-start',
      }}
    >
      {/* Weekly Intensity */}
      <Box sx={{ flex: 2, width: '100%' }}>
        <Typography variant="h6" sx={sectionLabel}>
          Weekly Intensity
        </Typography>
        <Box sx={{ minHeight: 250 }}>
          {loading ? (
            <Skeleton
              variant="rectangular"
              height={250}
              sx={{ borderRadius: 4 }}
            />
          ) : (
            <WeeklyChart entries={entries} streams={streams} />
          )}
        </Box>
      </Box>

      {/* Stream Alignment */}
      <Box sx={{ flex: 1, width: '100%' }}>
        <Typography variant="h6" sx={sectionLabel}>
          Stream Alignment
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {loading ? (
            <Skeleton
              variant="rectangular"
              height={150}
              sx={{ borderRadius: 2 }}
            />
          ) : totalMentions === 0 ? (
            <Typography variant="body2" sx={{ fontWeight: 700, opacity: 0.4 }}>
              No entries logged yet.
            </Typography>
          ) : (
            streams.map((stream) => (
              <StreamBar
                key={stream.id}
                label={stream.name}
                value={stats.mentionsByStream?.[stream.id] || 0}
                total={totalMentions}
                color={stream.color}
              />
            ))
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default StreamAlignment
