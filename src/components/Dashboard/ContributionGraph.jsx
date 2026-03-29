import React from 'react'
import { Tooltip, Box, Typography, Stack } from '@mui/material'

const STREAM_COLORS = {
  clientWork: '#80b621',
  practiceDevelopment: '#ffd166',
  businessDevelopment: '#eb8449',
  mixed: '#777',
  empty: '#f0f0f0',
}

const ContributionGraph = ({ entries }) => {
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
      return { color: STREAM_COLORS.empty, title: `${dateStr}: No logs` }

    const { clientWork, practiceDevelopment, businessDevelopment } =
      entry.streamCounts
    const total = clientWork + practiceDevelopment + businessDevelopment

    if (total === 0)
      return { color: STREAM_COLORS.empty, title: `${dateStr}: Empty log` }

    // Determine dominant stream
    let color = STREAM_COLORS.mixed
    let dominant = 'Mixed Activity'

    if (clientWork > practiceDevelopment && clientWork > businessDevelopment) {
      color = STREAM_COLORS.clientWork
      dominant = 'Client Work Focused'
    } else if (
      practiceDevelopment > clientWork &&
      practiceDevelopment > businessDevelopment
    ) {
      color = STREAM_COLORS.practiceDevelopment
      dominant = 'Practice Dev Focused'
    } else if (
      businessDevelopment > clientWork &&
      businessDevelopment > practiceDevelopment
    ) {
      color = STREAM_COLORS.businessDevelopment
      dominant = 'Business Dev Focused'
    }

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
      <Stack direction="row" spacing={2} sx={{ mt: 3, opacity: 0.8 }}>
        <LegendItem color={STREAM_COLORS.clientWork} label="CW" />
        <LegendItem color={STREAM_COLORS.practiceDevelopment} label="PD" />
        <LegendItem color={STREAM_COLORS.businessDevelopment} label="BD" />
        <LegendItem color={STREAM_COLORS.mixed} label="Mixed" />
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
        border: '1px solid', borderColor: 'text.primary',
      }}
    />
    <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '0.65rem' }}>
      {label}
    </Typography>
  </Stack>
)

export default ContributionGraph
