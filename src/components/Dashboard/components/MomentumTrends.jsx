import React from 'react'
import { Box, Typography, Stack, Tooltip } from '@mui/material'
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material'
import { useAppContext } from '../../../context/AppContext'

const WEEKS_SHOWN = 8

const getMonday = (date) => {
  const d = new Date(date)
  const dow = d.getDay()
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Longer-horizon view that unlocks once a few weeks of data exist:
 * words per week stacked by stream, plus a momentum indicator comparing
 * the last 4 weeks against the 4 before.
 */
const MomentumTrends = ({ entries }) => {
  const { streams } = useAppContext()

  const thisMonday = getMonday(new Date())
  const weeks = Array.from({ length: WEEKS_SHOWN }, (_, i) => {
    const start = new Date(thisMonday)
    start.setDate(start.getDate() - (WEEKS_SHOWN - 1 - i) * 7)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    return {
      start,
      end,
      tally: Object.fromEntries(streams.map((s) => [s.id, 0])),
    }
  })

  entries.forEach((entry) => {
    const d = new Date(entry.date)
    weeks.forEach((week) => {
      if (d >= week.start && d < week.end && entry.streamCounts) {
        streams.forEach((s) => {
          week.tally[s.id] += entry.streamCounts[s.id] || 0
        })
      }
    })
  })

  const weekTotals = weeks.map((w) =>
    Object.values(w.tally).reduce((a, b) => a + b, 0)
  )
  const maxTotal = Math.max(...weekTotals, 1)

  const recent = weekTotals.slice(-4).reduce((a, b) => a + b, 0)
  const previous = weekTotals.slice(0, 4).reduce((a, b) => a + b, 0)
  const deltaPct =
    previous > 0 ? Math.round(((recent - previous) / previous) * 100) : null

  const stackedStreams = [...streams].reverse()

  let TrendIcon = TrendingFlat
  let trendColor = '#888'
  let trendText = 'steady'
  if (deltaPct !== null && deltaPct >= 10) {
    TrendIcon = TrendingUp
    trendColor = '#80b621'
    trendText = `up ${deltaPct}% on the previous month`
  } else if (deltaPct !== null && deltaPct <= -10) {
    TrendIcon = TrendingDown
    trendColor = '#d32f2f'
    trendText = `down ${Math.abs(deltaPct)}% on the previous month`
  } else if (deltaPct !== null) {
    trendText = 'steady vs the previous month'
  }

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: 1,
            opacity: 0.7,
          }}
        >
          Momentum — last {WEEKS_SHOWN} weeks
        </Typography>
        {deltaPct !== null && (
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <TrendIcon sx={{ color: trendColor }} />
            <Typography
              variant="body2"
              sx={{ fontWeight: 900, color: trendColor }}
            >
              {trendText}
            </Typography>
          </Stack>
        )}
      </Stack>

      <Box
        sx={{
          height: 180,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1.5,
          px: 1,
        }}
      >
        {weeks.map((week, i) => (
          <Tooltip
            key={i}
            arrow
            placement="top"
            title={
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                  w/c{' '}
                  {week.start.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </Typography>
                {streams.map((s) => (
                  <Typography
                    key={s.id}
                    variant="body2"
                    sx={{ color: s.color }}
                  >
                    {s.name}: {week.tally[s.id]} words
                  </Typography>
                ))}
              </Box>
            }
          >
            <Box
              sx={{
                flex: 1,
                height:
                  weekTotals[i] > 0
                    ? `${(weekTotals[i] / maxTotal) * 100}%`
                    : '5px',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '8px 8px 0 0',
                overflow: 'hidden',
                border: weekTotals[i] > 0 ? '2px solid' : '2px dashed',
                borderColor: weekTotals[i] > 0 ? 'text.primary' : 'divider',
                transition: 'all 0.2s',
                '&:hover': { filter: 'brightness(1.1)' },
              }}
            >
              {stackedStreams.map((s) => (
                <Box
                  key={s.id}
                  sx={{ flex: week.tally[s.id], bgcolor: s.color }}
                />
              ))}
            </Box>
          </Tooltip>
        ))}
      </Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ px: 1, mt: 0.5 }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.5 }}>
          {WEEKS_SHOWN} weeks ago
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.5 }}>
          this week
        </Typography>
      </Stack>
    </Box>
  )
}

export default MomentumTrends
