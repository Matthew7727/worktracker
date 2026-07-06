import React from 'react'
import { Box, Typography, Stack, LinearProgress, Skeleton } from '@mui/material'
import WeeklyChart from '../WeeklyChart'
import { useAppContext } from '../../../context/AppContext'

const StreamBar = ({ label, value, total, color, targetPct }) => {
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
      <Box sx={{ position: 'relative' }}>
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
        {targetPct != null && (
          <Box
            sx={{
              position: 'absolute',
              top: -3,
              bottom: -3,
              left: `${targetPct}%`,
              width: 3,
              bgcolor: 'text.primary',
              borderRadius: 1,
              transform: 'translateX(-50%)',
            }}
          />
        )}
      </Box>
      <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.6 }}>
        {value.toLocaleString()} words total
        {targetPct != null && (
          <Typography
            component="span"
            variant="caption"
            sx={{ fontWeight: 700, opacity: 0.5, ml: 1 }}
          >
            · target {targetPct}%
          </Typography>
        )}
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

const StreamAlignment = ({ entries, stats, utilisationTarget, loading }) => {
  const { streamConfig, streams, mainFocusStream } = useAppContext()
  const utilisationEnabled = !!streamConfig?.features?.utilisation

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
          ) : stats.totalWords === 0 ? (
            <Typography variant="body2" sx={{ fontWeight: 700, opacity: 0.4 }}>
              No entries logged yet.
            </Typography>
          ) : (
            streams.map((stream) => (
              <StreamBar
                key={stream.id}
                label={stream.name}
                value={stats.streamBreakdown[stream.id] || 0}
                total={stats.totalWords}
                color={stream.color}
                targetPct={
                  utilisationEnabled && stream.id === mainFocusStream?.id
                    ? utilisationTarget
                    : null
                }
              />
            ))
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default StreamAlignment
