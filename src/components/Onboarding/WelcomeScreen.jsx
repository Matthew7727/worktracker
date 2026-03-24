import React, { useState } from 'react'
import { Box, Typography, Button, Paper, Stack } from '@mui/material'
import { FolderOpen } from '@mui/icons-material'
import { useAppContext } from '../../context/AppContext'

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
          borderRadius: '32px',
          border: '4px solid black',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" sx={{ mb: 2 }}>
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
            boxShadow: '0 8px 0 black',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 10px 0 black',
            },
          }}
        >
          SELECT DIRECTORY
        </Button>

        {error && (
          <Typography sx={{ color: 'error.main', mt: 4, fontWeight: 900 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ mt: 8, pt: 4, borderTop: '2px dashed rgba(0,0,0,0.1)' }}>
          <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.4 }}>
            v0.1.0 • PREMIUM BOLD EDITION
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default WelcomeScreen
