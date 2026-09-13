import React, { useEffect } from 'react'
import { Box } from '@mui/material'
import { RULE, OFFSET, hardShadow } from '../../styles/tokens'

const flowStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    m: 0,
    p: `${OFFSET.press}px`,
    bgcolor: 'transparent',
    overflow: 'hidden',
  },
  startButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: `calc(100vw - ${OFFSET.lift}px)`,
    height: `calc(100vh - ${OFFSET.lift}px)`,
    appearance: 'none',
    fontSize: '1.25rem',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    px: 3,
    py: 1.5,
    borderRadius: 0,
    border: `${RULE.base}px solid`,
    borderColor: 'text.primary',
    color: 'background.paper',
    bgcolor: 'text.primary',
    boxShadow: (theme) => hardShadow(OFFSET.press, theme.palette.primary.main),
    cursor: 'pointer',
    transition:
      'background-color 120ms linear, color 120ms linear, box-shadow 120ms linear, transform 120ms linear',
    '&:hover': {
      color: 'text.primary',
      bgcolor: 'background.paper',
      boxShadow: (theme) => hardShadow(OFFSET.base, theme.palette.text.primary),
      transform: `translate(${OFFSET.press}px, ${OFFSET.press}px)`,
    },
  },
}

const TrayWidget = () => {
  useEffect(() => {
    document.body.style.backgroundColor = 'transparent'
    return () => {
      document.body.style.backgroundColor = ''
    }
  }, [])

  const handleClick = async () => {
    if (window.electronAPI && window.electronAPI.triggerGlobalStartFlow) {
      await window.electronAPI.triggerGlobalStartFlow()
    }
  }

  return (
    <Box sx={flowStyles.container}>
      <Box component="button" onClick={handleClick} sx={flowStyles.startButton}>
        START FLOW
      </Box>
    </Box>
  )
}

export default TrayWidget
