import React from 'react'
import { Box, Typography } from '@mui/material'
import { RULE, FONT } from '../../../styles/tokens'

// One reading on the panel: the figure set in the data face, the thing it
// measures underneath it.
const Tile = ({ value, label, sub, valueColor, subColor }) => (
  <Box
    sx={{
      bgcolor: 'background.paper',
      p: 2.5,
      display: 'flex',
      flexDirection: 'column',
      gap: 0.5,
      minWidth: 0,
    }}
  >
    <Typography
      sx={{
        fontFamily: FONT.data,
        fontWeight: 700,
        fontSize: 40,
        lineHeight: 1,
        letterSpacing: '-0.04em',
        color: valueColor || 'text.primary',
      }}
    >
      {value}
    </Typography>
    <Typography
      sx={{
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: '-0.01em',
        color: 'text.secondary',
        mt: 0.5,
      }}
    >
      {label}
    </Typography>
    {sub && (
      <Typography
        sx={{
          fontFamily: FONT.data,
          fontWeight: 400,
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
        gap: `${RULE.base}px`,
        bgcolor: 'text.primary',
        border: `${RULE.base}px solid`,
        borderColor: 'text.primary',
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
