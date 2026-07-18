import React from 'react'
import { Box, Typography, Stack, LinearProgress } from '@mui/material'

const cardSx = {
  border: '3px solid',
  borderColor: 'text.primary',
  borderRadius: '24px',
  bgcolor: 'background.paper',
  p: 3,
  flex: 1,
}

const MiniStat = ({ value, label, color }) => (
  <Box>
    <Typography
      sx={{
        fontFamily: '"JetBrains Mono", monospace',
        fontWeight: 700,
        fontSize: 26,
        lineHeight: 1,
        color: color || 'text.primary',
      }}
    >
      {value}
    </Typography>
    <Typography
      sx={{
        fontWeight: 700,
        textTransform: 'uppercase',
        fontSize: 10,
        letterSpacing: '0.05em',
        opacity: 0.6,
        mt: 0.5,
      }}
    >
      {label}
    </Typography>
  </Box>
)

/**
 * Task velocity: how many tasks were closed each week, and how the aggregate
 * subtask backlog on active work is progressing — throughput signal the
 * per-project priorities list never showed.
 */
const TaskThroughput = ({ perWeek, totals }) => {
  const max = Math.max(...perWeek.map((w) => w.count), 1)
  const subPct =
    totals.subtasksTotal > 0
      ? Math.round((totals.subtasksDone / totals.subtasksTotal) * 100)
      : 0

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2.5,
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      <Box sx={cardSx}>
        <Typography sx={{ fontWeight: 900, fontSize: 16, mb: 2 }}>
          Tasks closed / week
        </Typography>
        <Box
          sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 110 }}
        >
          {perWeek.map((w, i) => {
            const empty = w.count <= 0
            return (
              <Box
                key={i}
                title={`w/c ${w.weekStart.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                })}: ${w.count} closed`}
                sx={{
                  flex: 1,
                  height: empty
                    ? '5px'
                    : `${Math.max((w.count / max) * 100, 10)}%`,
                  bgcolor: empty ? 'transparent' : '#80b621',
                  border: empty ? '2px dashed' : '2px solid',
                  borderColor: empty ? 'divider' : 'text.primary',
                  borderRadius: '6px 6px 0 0',
                }}
              />
            )
          })}
        </Box>
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, opacity: 0.5 }}>
            {perWeek.length}w ago
          </Typography>
          <Typography sx={{ fontSize: 10, fontWeight: 700, opacity: 0.5 }}>
            this week
          </Typography>
        </Stack>
      </Box>

      <Box sx={cardSx}>
        <Typography sx={{ fontWeight: 900, fontSize: 16, mb: 2 }}>
          Backlog health
        </Typography>
        <Stack direction="row" spacing={3} sx={{ mb: 2.5 }}>
          <MiniStat value={totals.open} label="Open tasks" />
          <MiniStat
            value={totals.closedThisCycle}
            label="Closed this cycle"
            color="#80b621"
          />
        </Stack>
        {totals.subtasksTotal > 0 && (
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mb: 0.75 }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                Subtasks on active work
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 13, opacity: 0.6 }}>
                {totals.subtasksDone}/{totals.subtasksTotal}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={subPct}
              sx={{
                height: 12,
                borderRadius: 6,
                border: '2px solid',
                borderColor: 'text.primary',
                bgcolor: 'background.paper',
                '& .MuiLinearProgress-bar': { bgcolor: '#80b621' },
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default TaskThroughput
