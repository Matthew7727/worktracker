import React, { useState } from 'react'
import { Box, Typography, Button, Paper } from '@mui/material'
import { FolderOpen } from '@mui/icons-material'
import { useAppContext } from '../../context/AppContext'
import { RULE, OFFSET, hardShadow } from '../../styles/tokens'

const WelcomeScreen = () => {
  const { setProjectDirectory } = useAppContext()
  const [error, setError] = useState(null)

  const handleSelectDirectory = async () => {
    try {
      const path = await window.electronAPI.selectDirectory()
      if (path) {
        setProjectDirectory(path)
      }
    } catch (err) {
      console.error('Failed to select directory:', err)
      setError('Failed to select directory. Please try again.')
    }
  }

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 4,
      }}
    >
      <Paper
        sx={{
          p: 8,
          maxWidth: '600px',
          border: `${RULE.base}px solid`,
          borderColor: 'text.primary',
          boxShadow: (theme) =>
            hardShadow(OFFSET.lift, theme.palette.text.primary),
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h1"
          sx={{ mb: 2, fontWeight: 800, letterSpacing: '-0.05em' }}
        >
          Welcome to Work Tracker
        </Typography>
        <Typography variant="h5" sx={{ mb: 6, opacity: 0.7, fontWeight: 700 }}>
          Select a directory to establish your work intelligence archive.
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<FolderOpen />}
          onClick={handleSelectDirectory}
          sx={{
            px: 6,
            py: 2,
            fontSize: '1.25rem',
            fontWeight: 800,
            backgroundImage: 'none',
            border: `${RULE.hair}px solid`,
            borderColor: 'text.primary',
            boxShadow: (theme) =>
              hardShadow(OFFSET.base, theme.palette.text.primary),
            '&:hover': {
              transform: `translate(${OFFSET.press}px, ${OFFSET.press}px)`,
              boxShadow: (theme) =>
                hardShadow(OFFSET.press, theme.palette.text.primary),
            },
          }}
        >
          SELECT DIRECTORY
        </Button>

        {error && (
          <Typography sx={{ color: 'error.main', mt: 4, fontWeight: 800 }}>
            {error}
          </Typography>
        )}

        <Box
          sx={{
            mt: 8,
            pt: 4,
            borderTop: `${RULE.hair}px solid`,
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.4 }}>
            v0.1.0 • Instrument panel edition
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default WelcomeScreen
