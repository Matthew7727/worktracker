import React from 'react'
import { Box, Typography, LinearProgress } from '@mui/material'
import { Lock } from '@mui/icons-material'
import { FONT, RULE } from '../../../styles/tokens'

/**
 * Placeholder for widgets that unlock as the workspace grows.
 * Shows how close the user is to unlocking it.
 */
const LockedTile = ({ title, requirement, current, target }) => {
  const progress = Math.min(100, Math.round((current / target) * 100))
  return (
    <Box
      sx={{
        py: 5,
        px: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
        border: `${RULE.hair}px dashed`,
        borderColor: 'divider',
        opacity: 0.8,
      }}
    >
      <Lock sx={{ fontSize: 28, opacity: 0.4 }} />
      <Typography variant="body1" sx={{ fontWeight: 800, opacity: 0.7 }}>
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontWeight: 700, opacity: 0.5, textAlign: 'center' }}
      >
        {requirement}
      </Typography>
      <Box sx={{ width: '100%', maxWidth: 280 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 10,
            border: `${RULE.hair}px solid`,
            borderColor: 'text.primary',
            bgcolor: 'background.paper',
            '& .MuiLinearProgress-bar': { borderRadius: 0 },
          }}
        />
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            mt: 0.5,
            fontFamily: FONT.data,
            fontWeight: 800,
            opacity: 0.6,
          }}
        >
          {current}/{target}
        </Typography>
      </Box>
    </Box>
  )
}

export default LockedTile
