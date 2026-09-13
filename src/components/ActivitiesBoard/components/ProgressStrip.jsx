import { Box, Typography } from '@mui/material'
import { MONO } from '../../shared/ui'

/** Bordered progress bar + "done/total" fraction. */
const ProgressStrip = ({ done, total, color = 'primary.main' }) => {
  if (!total) return null
  const pct = Math.round((done / total) * 100)

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <Box
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        sx={{
          flex: 1,
          height: 10,
          border: '2px solid',
          borderColor: 'text.primary',
          bgcolor: 'background.paper',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: `${pct}%`,
            height: '100%',
            bgcolor: color,
            borderRight: pct > 0 && pct < 100 ? '2px solid' : 'none',
            borderColor: 'text.primary',
            transition: 'width 0.3s ease',
          }}
        />
      </Box>
      <Typography
        component="span"
        sx={{
          fontFamily: MONO,
          fontSize: '0.75rem',
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {done}/{total}
      </Typography>
    </Box>
  )
}

export default ProgressStrip
