import React from 'react'
import { Box, Typography } from '@mui/material'
import { brandStyles, brandCellStyles } from '../MainLayout.styles'

// The wordmark occupies the first cell of the rail: ink block, tracker set in
// the accent, split by a slash that reads as a ruled edge.
const Brand = ({ onClick }) => (
  <Box onClick={onClick} sx={brandCellStyles}>
    <Typography variant="h6" component="span" sx={brandStyles}>
      WORK<span>/TRACKER</span>
    </Typography>
  </Box>
)

export default Brand
