import React from 'react'
import { Box, Typography, LinearProgress } from '@mui/material'
import { Lock } from '@mui/icons-material'

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
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 3,
        opacity: 0.8,
      }}
    >
      <Lock sx={{ fontSize: 28, opacity: 0.4 }} />
      <Typography variant="body1" sx={{ fontWeight: 900, opacity: 0.7 }}>
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
            borderRadius: 5,
            border: '2px solid',
            borderColor: 'text.primary',
            bgcolor: 'background.paper',
          }}
        />
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            mt: 0.5,
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
