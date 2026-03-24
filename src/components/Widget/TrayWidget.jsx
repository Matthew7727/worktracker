import React, { useEffect } from 'react'
import { Box } from '@mui/material'

const flowStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    m: 0,
    p: 0,
    bgcolor: 'transparent',
    overflow: 'hidden',
  },
  startButton: {
    fontSize: '1.5rem',
    fontWeight: 950,
    px: 4,
    py: 2,
    borderRadius: '25px',
    border: '4px solid black',
    color: 'black',
    bgcolor: 'white',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: '10px 10px 0px black',
      '& .shine-layer': {
        opacity: 1,
        transform: 'translateX(100%) skewX(-15deg)',
      },
    },
  },
  shineLayer: {
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '200%',
    height: '100%',
    opacity: 0,
    transition: 'all 0.8s ease',
    background:
      'linear-gradient(90deg, transparent, #80b621, #00d2ff, #eb8449, transparent)',
    pointerEvents: 'none',
    zIndex: 1,
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
        <Box className="shine-layer" sx={flowStyles.shineLayer} />
      </Box>
    </Box>
  )
}

export default TrayWidget
