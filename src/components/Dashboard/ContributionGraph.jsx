import React from 'react'
import { Tooltip, Box, Typography, Stack } from '@mui/material'
import { getStreamAbbrev } from '../../utils/streamConfig'

const NEUTRAL_COLORS = {
  mixed: '#777',
  empty: '#f0f0f0',
}

const DAY_STATUS_COLORS = {
  pto: '#4dabf7',
  sick: '#ff6b6b',
  volunteering: '#9c6ade',
}

const DAY_STATUS_LABELS = {
  pto: 'PTO',
  sick: 'Sick',
  volunteering: 'Volunteering',
}

const ContributionGraph = ({ entries, streams = [] }) => {
  // 1. Generate last 365 days
  const today = new Date()
  const days = []
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d)
  }

  // 2. Map entries for quick lookup
  const entryMap = new Map()
  entries.forEach((e) => {
    entryMap.set(e.date, e)
  })

  // 3. Group by weeks
  const weeks = []
  let currentWeek = new Array(7).fill(null)
  const firstDayOfWeek = days[0].getDay()

  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek[i] = null
  }

  for (const date of days) {
    const dayOfWeek = date.getDay()
    currentWeek[dayOfWeek] = date

    if (dayOfWeek === 6) {
      weeks.push(currentWeek)
      currentWeek = new Array(7).fill(null)
    }
  }
  if (currentWeek.some((d) => d !== null)) {
    weeks.push(currentWeek)
  }

  const blockSize = 12
  const blockGap = 4

  const getDayInfo = (date) => {
    if (!date) return { color: 'transparent', title: '' }
    const dateStr = date.toISOString().split('T')[0]
    const entry = entryMap.get(dateStr)

    if (!entry)
      return { color: NEUTRAL_COLORS.empty, title: `${dateStr}: No logs` }

    const dayStatus = entry.metadata?.dayStatus
    if (dayStatus && dayStatus !== 'working') {
      return {
        color: DAY_STATUS_COLORS[dayStatus] || NEUTRAL_COLORS.mixed,
        title: `${dateStr}: ${DAY_STATUS_LABELS[dayStatus] || dayStatus}`,
      }
    }

    const counts = streams.map((s) => entry.streamCounts?.[s.id] || 0)
    const total = counts.reduce((a, b) => a + b, 0)

    if (total === 0)
      return { color: NEUTRAL_COLORS.empty, title: `${dateStr}: Empty log` }

    // Determine dominant stream (strictly greater than all others)
    let color = NEUTRAL_COLORS.mixed
    let dominant = 'Mixed Activity'
    streams.forEach((s, i) => {
      if (counts[i] > 0 && counts.every((c, j) => j === i || counts[i] > c)) {
        color = s.color
        dominant = `${s.name} Focused`
      }
    })

    return {
      color,
      title: `${dateStr}: ${dominant} (${total} words)`,
    }
  }

  if (entries.length === 0) {
    return (
      <Box
        sx={{
          py: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 3,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700, opacity: 0.4 }}>
          Your journey starts when you log your first session.
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'auto',
        py: 2,
        alignItems: 'center',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      <Box sx={{ display: 'flex', gap: `${blockGap}px` }}>
        {weeks.map((week, wIndex) => (
          <Box
            key={wIndex}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: `${blockGap}px`,
            }}
          >
            {week.map((date, dIndex) => {
              const info = getDayInfo(date)
              return (
                <Tooltip key={dIndex} title={info.title} arrow placement="top">
                  <Box
                    sx={{
                      width: `${blockSize}px`,
                      height: `${blockSize}px`,
                      backgroundColor: info.color,
                      borderRadius: '3px',
                      border: date ? '1px solid rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.1s',
                      '&:hover': {
                        transform: 'scale(1.4)',
                        zIndex: 1,
                        boxShadow: date ? '0 0 8px rgba(0,0,0,0.3)' : 'none',
                        borderColor: 'text.primary',
                      },
                    }}
                  />
                </Tooltip>
              )
            })}
          </Box>
        ))}
      </Box>
      <Stack
        direction="row"
        spacing={2}
        sx={{ mt: 3, opacity: 0.8 }}
        flexWrap="wrap"
        useFlexGap
      >
        {streams.map((s) => (
          <LegendItem key={s.id} color={s.color} label={getStreamAbbrev(s)} />
        ))}
        <LegendItem color={NEUTRAL_COLORS.mixed} label="Mixed" />
        <LegendItem color={DAY_STATUS_COLORS.pto} label="PTO" />
        <LegendItem color={DAY_STATUS_COLORS.sick} label="Sick" />
        <LegendItem color={DAY_STATUS_COLORS.volunteering} label="Vol." />
      </Stack>
    </Box>
  )
}

const LegendItem = ({ color, label }) => (
  <Stack direction="row" alignItems="center" spacing={0.5}>
    <Box
      sx={{
        width: 12,
        height: 12,
        borderRadius: '2px',
        bgcolor: color,
        border: '1px solid',
        borderColor: 'text.primary',
      }}
    />
    <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '0.65rem' }}>
      {label}
    </Typography>
  </Stack>
)

export default ContributionGraph
