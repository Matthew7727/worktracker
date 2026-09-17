import { Box, Typography } from '@mui/material'
import { MONO } from '../../shared/ui'
import { useIsFilofax } from '../../../styles/useUiStyle'

/** Bordered progress bar + "done/total" fraction. */
const ProgressStrip = ({ done, total, color = 'primary.main' }) => {
  const isFx = useIsFilofax()
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
          height: isFx ? 4 : 10,
          borderRadius: isFx ? '2px' : 0,
          border: isFx ? 'none' : '2px solid',
          borderColor: 'text.primary',
          bgcolor: isFx ? 'divider' : 'background.paper',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: `${pct}%`,
            height: '100%',
            bgcolor: color,
            borderRight: !isFx && pct > 0 && pct < 100 ? '2px solid' : 'none',
            borderColor: 'text.primary',
            transition: 'width 0.3s ease',
          }}
        />
      </Box>
      <Typography
        component="span"
        sx={{
          fontFamily: isFx ? 'inherit' : MONO,
          fontStyle: isFx ? 'italic' : 'normal',
          fontSize: '0.75rem',
          fontWeight: isFx ? 400 : 700,
          flexShrink: 0,
        }}
      >
        {done}/{total}
      </Typography>
    </Box>
  )
}

export default ProgressStrip
