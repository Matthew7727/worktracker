import React from 'react'
import { Box, Typography, Stack } from '@mui/material'

const cardSx = {
  border: '3px solid',
  borderColor: 'text.primary',
  borderRadius: '24px',
  bgcolor: 'background.paper',
  p: 3,
}

const label = {
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: 1,
  opacity: 0.7,
  fontSize: 12,
}

/**
 * Utilisation cycle progress (June -> May fiscal year) plus the raw STAFFIT
 * hours declared each week — data that previously only lived inside a single
 * hero sentence.
 */
const UtilisationCycle = ({
  cycleWeeks,
  standardWeeklyHours,
  utilisationTarget,
  utilisationPrediction,
}) => {
  const { weeks, weekNumber, totalWeeks } = cycleWeeks
  const start = weeks[0]?.weekStart
  const cycleYear = start ? start.getFullYear() : new Date().getFullYear()

  const diff =
    utilisationPrediction !== null && utilisationTarget !== null
      ? utilisationPrediction - utilisationTarget
      : null
  const diffColor = diff === null ? '#888' : diff >= 0 ? '#80b621' : '#d32f2f'

  const capacity =
    standardWeeklyHours || Math.max(...weeks.map((w) => w.hours), 1)
  const maxHours = Math.max(capacity, ...weeks.map((w) => w.hours), 1)

  return (
    <Box sx={cardSx}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="baseline"
        sx={{ mb: 1.5 }}
      >
        <Typography sx={{ fontWeight: 900, fontSize: 17 }}>
          Fiscal cycle · Jun {cycleYear} → May {cycleYear + 1}
        </Typography>
        <Typography sx={{ ...label, opacity: 0.5 }}>
          week {weekNumber} of {totalWeeks}
        </Typography>
      </Stack>

      {utilisationPrediction !== null && utilisationTarget !== null && (
        <>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Typography sx={{ fontWeight: 700, color: 'text.secondary' }}>
              Predicted{' '}
              <Box
                component="span"
                sx={{ color: 'text.primary', fontWeight: 900 }}
              >
                {utilisationPrediction}%
              </Box>{' '}
              · Target {utilisationTarget}%
            </Typography>
            <Typography sx={{ fontWeight: 900, color: diffColor }}>
              {diff >= 0 ? `▲ +${diff}% ahead` : `▼ ${Math.abs(diff)}% behind`}
            </Typography>
          </Stack>
          <Box
            sx={{
              position: 'relative',
              height: 20,
              borderRadius: 2,
              border: '2px solid',
              borderColor: 'text.primary',
              bgcolor: 'background.subtle',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                width: `${Math.min(100, utilisationPrediction)}%`,
                bgcolor: diffColor,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: -3,
                bottom: -3,
                left: `${Math.min(100, utilisationTarget)}%`,
                width: 3,
                bgcolor: 'text.primary',
              }}
            />
          </Box>
        </>
      )}

      <Typography sx={{ ...label, mt: 3, mb: 1.5 }}>
        STAFFIT hours declared per week
      </Typography>
      {weeks.length === 0 ? (
        <Typography sx={{ fontWeight: 700, opacity: 0.4 }}>
          No hours declared yet this cycle.
        </Typography>
      ) : (
        <>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 0.75,
              height: 90,
            }}
          >
            {weeks.map((w, i) => {
              const pct = maxHours > 0 ? (w.hours / maxHours) * 100 : 0
              const full = standardWeeklyHours && w.hours >= standardWeeklyHours
              const empty = w.hours <= 0
              return (
                <Box
                  key={i}
                  title={`w/c ${w.weekStart.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}: ${w.hours}h`}
                  sx={{
                    flex: 1,
                    minWidth: 6,
                    height: empty ? '5px' : `${Math.max(pct, 8)}%`,
                    bgcolor: empty
                      ? 'transparent'
                      : full
                        ? '#80b621'
                        : '#aedd4d',
                    border: empty ? '2px dashed' : '2px solid',
                    borderColor: empty ? 'divider' : 'text.primary',
                    borderRadius: '6px 6px 0 0',
                  }}
                />
              )
            })}
          </Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ mt: 0.5 }}
          >
            <Typography sx={{ fontSize: 10, fontWeight: 700, opacity: 0.5 }}>
              start of cycle
            </Typography>
            <Typography sx={{ fontSize: 10, fontWeight: 700, opacity: 0.5 }}>
              this week
            </Typography>
          </Stack>
        </>
      )}
    </Box>
  )
}

export default UtilisationCycle
