import React, { useState } from 'react'
import { Box, Paper, Typography, Button, Fade } from '@mui/material'
import { useAppContext } from '../../context/AppContext'
import DirectoryTree from './components/DirectoryTree'
import EntryViewer from './components/EntryViewer'

const WorkspaceExplorer = () => {
  const { selectedDirectory, setProjectDirectory } = useAppContext()
  const [selectedEntry, setSelectedEntry] = useState(null)

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 9rem)',
        overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 3,
          flexShrink: 0,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 950,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
          }}
        >
          Workspace
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Box
          component="button"
          onClick={() => setProjectDirectory(null)}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            mr: 1.5,
            fontFamily: 'inherit',
            fontSize: '0.85rem',
            fontWeight: 900,
            px: 2.5,
            py: 1,
            borderRadius: '25px',
            border: '3px solid',
            borderColor: 'text.primary',
            color: 'text.primary',
            bgcolor: 'background.paper',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: (theme) => `6px 6px 0px ${theme.palette.text.primary}`,
              '& .shine-layer': {
                opacity: 1,
                transform: 'translateX(100%) skewX(-15deg)',
              },
            },
          }}
        >
          SWITCH WORKSPACE
          <Box
            className="shine-layer"
            sx={{
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
            }}
          />
        </Box>
      </Box>

      {/* Split pane */}
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          gap: 3,
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* Tree panel — animates width on entry select */}
        <Paper
          sx={{
            width: selectedEntry ? '35%' : '100%',
            transition: 'width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            flexShrink: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'none',
            borderRadius: '24px',
          }}
        >
          <DirectoryTree
            rootDir={selectedDirectory}
            selectedEntry={selectedEntry}
            onSelectEntry={setSelectedEntry}
          />
        </Paper>

        {/* Entry viewer — slides in when an entry is selected */}
        <Fade in={!!selectedEntry} timeout={350}>
          <Box
            sx={{
              flex: 1,
              overflow: 'hidden',
              minWidth: 0,
              visibility: selectedEntry ? 'visible' : 'hidden',
              pointerEvents: selectedEntry ? 'auto' : 'none',
            }}
          >
            {selectedEntry && (
              <EntryViewer
                entry={selectedEntry}
                onClose={() => setSelectedEntry(null)}
              />
            )}
          </Box>
        </Fade>
      </Box>
    </Box>
  )
}

export default WorkspaceExplorer
