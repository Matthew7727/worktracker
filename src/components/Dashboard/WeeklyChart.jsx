import React from 'react'
import { Box, Typography, Stack, Tooltip } from '@mui/material'

const STREAM_COLORS = {
  clientWork: '#80b621',
  practiceDevelopment: '#4a6b13',
  businessDevelopment: '#eb8449',
}

const WeeklyChart = ({ entries }) => {
  // Generate last 7 days (including today)
  const days = []
  const streamTally = new Array(7).fill(0).map(() => ({
    clientWork: 0,
    practiceDevelopment: 0,
    businessDevelopment: 0,
  }))
  const dateMap = new Map() // Map date string YYYY-MM-DD to index 0-6

  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const dayLabel = d
      .toLocaleDateString('en-US', { weekday: 'short' })
      .toUpperCase()

    days.push(dayLabel)
    dateMap.set(dateStr, 6 - i)
  }

  // Tally word counts per stream for each day
  entries.forEach((entry) => {
    if (dateMap.has(entry.date) && entry.streamCounts) {
      const index = dateMap.get(entry.date)
      streamTally[index].clientWork += entry.streamCounts.clientWork
      streamTally[index].practiceDevelopment +=
        entry.streamCounts.practiceDevelopment
      streamTally[index].businessDevelopment +=
        entry.streamCounts.businessDevelopment
    }
  })

  const dailyTotals = streamTally.map(
    (s) => s.clientWork + s.practiceDevelopment + s.businessDevelopment
  )
  const maxTotal = Math.max(...dailyTotals, 1)

  return (
    <Box
      sx={{
        height: '220px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 1.5,
        px: 2,
        pt: 2,
      }}
    >
      {streamTally.map((streams, index) => (
        <Stack
          key={index}
          spacing={1}
          alignItems="center"
          sx={{ flex: 1, height: '100%', justifyContent: 'flex-end' }}
        >
          <Tooltip
            title={
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                  {days[index]}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: STREAM_COLORS.clientWork }}
                >
                  CW: {streams.clientWork} words
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: STREAM_COLORS.practiceDevelopment }}
                >
                  PD: {streams.practiceDevelopment} words
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: STREAM_COLORS.businessDevelopment }}
                >
                  BD: {streams.businessDevelopment} words
                </Typography>
              </Box>
            }
            arrow
            placement="top"
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: '45px',
                height:
                  dailyTotals[index] > 0
                    ? `${(dailyTotals[index] / maxTotal) * 100}%`
                    : '6px',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '10px 10px 0 0',
                overflow: 'hidden',
                border:
                  dailyTotals[index] > 0
                    ? '3px solid black'
                    : '2px dashed #ccc',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scaleY(1.05)',
                  filter: 'brightness(1.1)',
                },
              }}
            >
              {/* Stacked segments */}
              <Box
                sx={{
                  flex: streams.businessDevelopment,
                  bgcolor: STREAM_COLORS.businessDevelopment,
                }}
              />
              <Box
                sx={{
                  flex: streams.practiceDevelopment,
                  bgcolor: STREAM_COLORS.practiceDevelopment,
                }}
              />
              <Box
                sx={{
                  flex: streams.clientWork,
                  bgcolor: STREAM_COLORS.clientWork,
                }}
              />
            </Box>
          </Tooltip>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 900,
              opacity: index === 6 ? 1 : 0.6,
              color: index === 6 ? 'black' : 'text.secondary',
              fontSize: '0.75rem',
            }}
          >
            {days[index]}
          </Typography>
        </Stack>
      ))}
    </Box>
  )
}

export default WeeklyChart
