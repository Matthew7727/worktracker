import React from 'react'
import { Box, Typography, Stack } from '@mui/material'
import { FONT, RULE } from '../../../styles/tokens'

const cardSx = {
  border: `${RULE.base}px solid`,
  borderColor: 'text.primary',
  bgcolor: 'background.paper',
  p: 3,
}

const label = {
  fontWeight: 800,
  letterSpacing: '-0.02em',
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
  const diffColor =
    diff === null ? 'text.secondary' : diff >= 0 ? 'success.main' : 'error.main'

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
        <Typography
          sx={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em' }}
        >
          Fiscal cycle · Jun {cycleYear} → May {cycleYear + 1}
        </Typography>
        <Typography sx={{ ...label, fontFamily: FONT.data, opacity: 0.5 }}>
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
                sx={{
                  color: 'text.primary',
                  fontFamily: FONT.data,
                  fontWeight: 800,
                }}
              >
                {utilisationPrediction}%
              </Box>{' '}
              · Target {utilisationTarget}%
            </Typography>
            <Typography
              sx={{ fontFamily: FONT.data, fontWeight: 800, color: diffColor }}
            >
              {diff >= 0 ? `▲ +${diff}% ahead` : `▼ ${Math.abs(diff)}% behind`}
            </Typography>
          </Stack>
          <Box
            sx={{
              position: 'relative',
              height: 20,
              border: `${RULE.hair}px solid`,
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
                width: RULE.base,
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
                    border: empty
                      ? `${RULE.hair}px dashed`
                      : `${RULE.hair}px solid`,
                    borderColor: empty ? 'divider' : 'text.primary',
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
