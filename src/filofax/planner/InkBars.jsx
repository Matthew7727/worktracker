import React from 'react'
import { Box, Tooltip, Typography } from '@mui/material'
import { useFilofaxTokens } from '../../styles/useUiStyle'

/**
 * Stacked columns drawn on a printed baseline. Each column is
 * { key, label, title, segments: [{ value, color }] }.
 */
const InkBars = ({
  columns,
  height = 140,
  emptyLabel,
  startLabel,
  endLabel,
}) => {
  const ff = useFilofaxTokens()
  const totals = columns.map((c) => c.segments.reduce((n, s) => n + s.value, 0))
  const max = Math.max(...totals, 1)
  const empty = totals.every((t) => t === 0)

  if (empty && emptyLabel) {
    return (
      <Typography sx={{ fontStyle: 'italic', color: 'text.secondary', py: 3 }}>
        {emptyLabel}
      </Typography>
    )
  }

  return (
    <Box>
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-around',
          gap: '6px',
          borderBottom: `1.5px solid ${ff.print}`,
          // faint guide rules at quarters
          backgroundImage: `repeating-linear-gradient(to top, transparent 0, transparent ${height / 4 - 1}px, ${ff.rule} ${height / 4 - 1}px, ${ff.rule} ${height / 4}px)`,
        }}
      >
        {columns.map((col, i) => (
          <Tooltip
            key={col.key}
            title={col.title || ''}
            placement="top"
            disableInteractive
          >
            <Box
              sx={{
                flex: 1,
                maxWidth: 48,
                height: totals[i] ? `${(totals[i] / max) * 100}%` : '2px',
                display: 'flex',
                flexDirection: 'column-reverse',
                gap: '2px',
                borderRadius: '4px 4px 0 0',
                overflow: 'hidden',
                bgcolor: totals[i] ? 'transparent' : ff.ruleStrong,
              }}
            >
              {col.segments.map((seg, j) => (
                <Box
                  key={j}
                  sx={{ flex: seg.value, bgcolor: seg.color, opacity: 0.88 }}
                />
              ))}
            </Box>
          </Tooltip>
        ))}
      </Box>
      {columns.some((c) => c.label) ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            gap: '6px',
            mt: 0.5,
          }}
        >
          {columns.map((col) => (
            <Typography
              key={col.key}
              sx={{
                flex: 1,
                maxWidth: 48,
                textAlign: 'center',
                fontStyle: 'italic',
                fontSize: '0.72rem',
                color: 'text.secondary',
              }}
            >
              {col.label}
            </Typography>
          ))}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography
            sx={{
              fontStyle: 'italic',
              fontSize: '0.72rem',
              color: 'text.secondary',
            }}
          >
            {startLabel}
          </Typography>
          <Typography
            sx={{
              fontStyle: 'italic',
              fontSize: '0.72rem',
              color: 'text.secondary',
            }}
          >
            {endLabel}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default InkBars
