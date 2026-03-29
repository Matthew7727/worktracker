import React from 'react'
import { Box, Typography } from '@mui/material'
import { flowStyles } from '../DailyEditor.styles'

const StartView = ({ onStart }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      mt: 4,
    }}
  >
    <Typography variant="h3" sx={{ fontWeight: 900 }}>
      Ready to log your achievements?
    </Typography>
    <Box component="button" onClick={onStart} sx={flowStyles.startButton}>
      START FLOW
      <Box className="shine-layer" sx={flowStyles.shineLayer} />
    </Box>
  </Box>
)

export default StartView
