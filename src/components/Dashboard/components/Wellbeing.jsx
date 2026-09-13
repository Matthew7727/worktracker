import React from 'react'
import { Box, Typography } from '@mui/material'
import { FONT, RULE } from '../../../styles/tokens'

const Tile = ({ value, label, color }) => (
  <Box
    sx={{
      border: `${RULE.base}px solid`,
      borderColor: 'text.primary',
      bgcolor: 'background.paper',
      p: 2.5,
    }}
  >
    <Typography
      sx={{
        fontFamily: FONT.data,
        fontWeight: 700,
        fontSize: 34,
        lineHeight: 1,
        color,
      }}
    >
      {value}
    </Typography>
    <Typography
      sx={{
        fontWeight: 800,
        fontSize: 11,
        opacity: 0.6,
        mt: 1,
      }}
    >
      {label}
    </Typography>
  </Box>
)

/**
 * Time-off recorded via day statuses (PTO / Sick / Volunteering) for the
 * current cycle — previously only a legend on the contribution heatmap.
 */
const Wellbeing = ({ counts }) => (
  <Box
    sx={{
      display: 'grid',
      gap: 2,
      gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' },
    }}
  >
    <Tile value={counts.pto} label="PTO days" color="#4dabf7" />
    <Tile value={counts.sick} label="Sick days" color="#ff6b6b" />
    <Tile value={counts.volunteering} label="Volunteering" color="#9c6ade" />
  </Box>
)

export default Wellbeing
