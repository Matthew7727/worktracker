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
        <Button
          variant="outlined"
          size="small"
          onClick={() => setProjectDirectory(null)}
          sx={{ py: 0.5, px: 1.5, fontSize: '0.7rem' }}
        >
          SWITCH WORKSPACE
        </Button>
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
