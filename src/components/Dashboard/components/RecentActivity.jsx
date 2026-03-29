import React from 'react'
import {
  Box,
  Typography,
  Stack,
  Chip,
  IconButton,
  Skeleton,
  Button,
  Tooltip,
} from '@mui/material'
import { Delete } from '@mui/icons-material'

const STREAM_COLORS = {
  clientWork: '#80b621',
  practiceDevelopment: '#ffd166',
  businessDevelopment: '#eb8449',
}

const STREAM_LABELS = {
  clientWork: 'CW',
  practiceDevelopment: 'PD',
  businessDevelopment: 'BD',
}

const getDominantStream = (streamCounts) => {
  return Object.entries(streamCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null
}

const StreamMiniBar = ({ streamCounts, totalWords }) => {
  if (totalWords === 0) return null
  return (
    <Box
      sx={{
        display: 'flex',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        border: '2px solid', borderColor: 'text.primary',
        width: '100%',
      }}
    >
      {Object.entries(streamCounts).map(([stream, count]) => {
        if (count === 0) return null
        return (
          <Tooltip key={stream} title={`${STREAM_LABELS[stream]}: ${count} words`} placement="top">
            <Box
              sx={{
                flex: count,
                bgcolor: STREAM_COLORS[stream],
              }}
            />
          </Tooltip>
        )
      })}
    </Box>
  )
}

const RecentActivityContent = ({ loading, recentEntries, onEntryClick, onDeleteClick }) => {
  if (loading) {
    return (
      <Stack spacing={2}>
        <Skeleton height={72} sx={{ borderRadius: 2 }} />
        <Skeleton height={72} sx={{ borderRadius: 2 }} />
        <Skeleton height={72} sx={{ borderRadius: 2 }} />
      </Stack>
    )
  }

  if (recentEntries.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', opacity: 0.5 }}>
        <Typography sx={{ mb: 2, fontWeight: 700 }}>No sessions logged yet.</Typography>
        <Button
          variant="outlined"
          sx={{ fontWeight: 700, border: '2px solid', borderColor: 'text.primary', color: 'text.primary' }}
          onClick={() => onEntryClick(new Date().toISOString().split('T')[0])}
        >
          Start Today
        </Button>
      </Box>
    )
  }

  return (
    <Stack spacing={1.5}>
      {recentEntries.map((entry) => {
        const dominant = entry.streamCounts ? getDominantStream(entry.streamCounts) : null
        const dominantColor = dominant ? STREAM_COLORS[dominant] : '#ccc'
        const dayLabel = new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', {
          weekday: 'short',
        })

        return (
          <Box
            key={entry.id}
            onClick={() => onEntryClick(entry.date)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              border: '2px solid', borderColor: 'text.primary',
              borderRadius: 2,
              boxShadow: '3px 3px 0px #000',
              borderLeft: `5px solid ${dominantColor}`,
              cursor: 'pointer',
              transition: 'all 0.15s',
              '&:hover': { transform: 'translate(-1px, -1px)', boxShadow: '4px 4px 0px #000' },
            }}
          >
            {/* Date */}
            <Box sx={{ minWidth: 90 }}>
              <Typography variant="body2" sx={{ fontWeight: 900, lineHeight: 1 }}>
                {entry.date}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.5 }}>
                {dayLabel}{entry.time ? ` · ${entry.time}` : ''}
              </Typography>
            </Box>

            {/* Stream bar + counts */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {entry.streamCounts && entry.totalWords > 0 ? (
                <>
                  <StreamMiniBar
                    streamCounts={entry.streamCounts}
                    totalWords={entry.totalWords}
                  />
                  <Stack direction="row" spacing={1.5} sx={{ mt: 0.75 }}>
                    {Object.entries(entry.streamCounts).map(([stream, count]) =>
                      count > 0 ? (
                        <Typography
                          key={stream}
                          variant="caption"
                          sx={{
                            fontWeight: 800,
                            color: STREAM_COLORS[stream],
                          }}
                        >
                          {STREAM_LABELS[stream]} {count}
                        </Typography>
                      ) : null
                    )}
                  </Stack>
                </>
              ) : (
                <Typography variant="caption" sx={{ opacity: 0.4, fontStyle: 'italic' }}>
                  Empty session
                </Typography>
              )}
            </Box>

            {/* Total words */}
            <Box sx={{ textAlign: 'right', minWidth: 60 }}>
              <Typography variant="body2" sx={{ fontWeight: 900 }}>
                {entry.totalWords?.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.5 }}>
                words
              </Typography>
            </Box>

            {/* Delete */}
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                onDeleteClick(entry)
              }}
              sx={{
                border: '2px solid', borderColor: 'text.primary',
                '&:hover': { bgcolor: 'error.main', color: 'background.paper', borderColor: 'error.main' },
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        )
      })}
    </Stack>
  )
}

export default RecentActivityContent
