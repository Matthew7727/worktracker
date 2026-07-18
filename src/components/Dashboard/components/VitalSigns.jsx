import React from 'react'
import { Box, Typography } from '@mui/material'

const Tile = ({ value, label, sub, valueColor, subColor }) => (
  <Box
    sx={{
      border: '3px solid',
      borderColor: 'text.primary',
      borderRadius: '14px',
      bgcolor: 'background.paper',
      p: 2.5,
      display: 'flex',
      flexDirection: 'column',
      gap: 0.5,
    }}
  >
    <Typography
      sx={{
        fontFamily: '"JetBrains Mono", monospace',
        fontWeight: 700,
        fontSize: 34,
        lineHeight: 1,
        color: valueColor || 'text.primary',
      }}
    >
      {value}
    </Typography>
    <Typography
      sx={{
        fontWeight: 700,
        textTransform: 'uppercase',
        fontSize: 11,
        letterSpacing: '0.06em',
        opacity: 0.6,
        mt: 0.5,
      }}
    >
      {label}
    </Typography>
    {sub && (
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: 12,
          color: subColor || 'text.secondary',
        }}
      >
        {sub}
      </Typography>
    )}
  </Box>
)

/**
 * The vital-signs strip: a row of headline numbers distilled from the
 * workspace. Tiles with no data (e.g. utilisation when disabled) are omitted.
 */
const VitalSigns = ({ tiles }) => {
  const visible = tiles.filter(Boolean)
  if (visible.length === 0) return null
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(auto-fit, minmax(150px, 1fr))',
        },
      }}
    >
      {visible.map((t) => (
        <Tile key={t.label} {...t} />
      ))}
    </Box>
  )
}

export default VitalSigns
