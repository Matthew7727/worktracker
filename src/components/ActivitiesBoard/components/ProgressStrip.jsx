import { Box, Typography } from '@mui/material'

/** Thin progress bar + "done/total" fraction. Replaces the "1/3 todos complete" sentence. */
const ProgressStrip = ({ done, total, color = 'primary.main' }) => {
  if (!total) return null
  const pct = Math.round((done / total) * 100)

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <Box
        sx={{
          flex: 1,
          height: 5,
          borderRadius: '3px',
          bgcolor: 'action.hover',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: '3px',
            bgcolor: color,
            transition: 'width 0.3s ease',
          }}
        />
      </Box>
      <Typography
        component="span"
        sx={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.68rem',
          fontWeight: 600,
          color: 'text.secondary',
          fontVariantNumeric: 'tabular-nums',
          flexShrink: 0,
        }}
      >
        {done}/{total}
      </Typography>
    </Box>
  )
}

export default ProgressStrip
