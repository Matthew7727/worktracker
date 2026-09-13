import React, { useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import { ArrowForward } from '@mui/icons-material'
import { InkButton } from '../shared/ui'

const TrayWidget = () => {
  useEffect(() => {
    document.body.style.backgroundColor = 'transparent'
    return () => {
      document.body.style.backgroundColor = ''
    }
  }, [])

  const handleClick = async () => {
    if (window.electronAPI?.triggerGlobalStartFlow) {
      await window.electronAPI.triggerGlobalStartFlow()
    }
  }

  const today = new Date()

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        bgcolor: 'transparent',
      }}
    >
      <Box
        sx={{
          bgcolor: 'background.paper',
          border: '3px solid',
          borderColor: 'text.primary',
          borderLeft: '10px solid',
          borderLeftColor: 'primary.main',
          width: 'calc(100vw - 16px)',
          boxSizing: 'border-box',
          pl: 2,
          pr: 1.5,
          py: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Typography
          sx={{
            fontWeight: 900,
            fontSize: '1.5rem',
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          {today.toLocaleDateString('en-GB', { weekday: 'long' })}
        </Typography>
        <InkButton
          color="primary.main"
          endIcon={<ArrowForward />}
          onClick={handleClick}
        >
          Log today
        </InkButton>
      </Box>
    </Box>
  )
}

export default TrayWidget
