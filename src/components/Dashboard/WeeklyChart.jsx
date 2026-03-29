import React from 'react'
import { Box, Typography, Stack, Tooltip } from '@mui/material'

const STREAM_COLORS = {
  clientWork: '#80b621',
  practiceDevelopment: '#ffd166',
  businessDevelopment: '#eb8449',
}

const getCurrentWeekDays = () => {
  const today = new Date()
  const dow = today.getDay() // 0=Sun, 1=Mon, ...
  const daysFromMonday = dow === 0 ? 6 : dow - 1
  const monday = new Date(today)
  monday.setDate(today.getDate() - daysFromMonday)

  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return {
      dateStr: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      isToday:
        d.toISOString().split('T')[0] === today.toISOString().split('T')[0],
    }
  })
}

const WeeklyChart = ({ entries }) => {
  const weekDays = getCurrentWeekDays()
  const dateMap = new Map(weekDays.map((d, i) => [d.dateStr, i]))

  const streamTally = weekDays.map(() => ({
    clientWork: 0,
    practiceDevelopment: 0,
    businessDevelopment: 0,
  }))

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
  const hasAnyData = dailyTotals.some((t) => t > 0)

  if (!hasAnyData) {
    return (
      <Box
        sx={{
          height: '220px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 3,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700, opacity: 0.4 }}>
          No sessions logged this week yet.
        </Typography>
      </Box>
    )
  }

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
                  {weekDays[index].label}
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
                maxWidth: '55px',
                height:
                  dailyTotals[index] > 0
                    ? `${(dailyTotals[index] / maxTotal) * 100}%`
                    : '6px',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '10px 10px 0 0',
                overflow: 'hidden',
                border: dailyTotals[index] > 0 ? '3px solid' : '2px dashed',
                borderColor:
                  dailyTotals[index] > 0 ? 'text.primary' : 'divider',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scaleY(1.05)',
                  filter: 'brightness(1.1)',
                },
              }}
            >
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
              opacity: weekDays[index].isToday ? 1 : 0.6,
              color: weekDays[index].isToday
                ? 'text.primary'
                : 'text.secondary',
              fontSize: '0.75rem',
            }}
          >
            {weekDays[index].label}
          </Typography>
        </Stack>
      ))}
    </Box>
  )
}

export default WeeklyChart
