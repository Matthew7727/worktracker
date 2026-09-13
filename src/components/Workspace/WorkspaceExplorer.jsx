import React, { useState } from 'react'
import { Box, Paper, Typography, Fade } from '@mui/material'
import { useAppContext } from '../../context/AppContext'
import DirectoryTree from './components/DirectoryTree'
import EntryViewer from './components/EntryViewer'
import { hardShadow, OFFSET, RULE } from '../../styles/tokens'

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
            fontWeight: 800,
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
            fontSize: '0.85rem',
            fontWeight: 800,
            px: 2.5,
            py: 1,
            border: `${RULE.base}px solid`,
            borderColor: 'text.primary',
            color: 'text.primary',
            bgcolor: 'background.paper',
            cursor: 'pointer',
            transition:
              'transform 0.12s ease, box-shadow 0.12s ease, background-color 0.12s ease, color 0.12s ease',
            '&:hover': {
              bgcolor: 'text.primary',
              color: 'background.paper',
              transform: `translate(-${OFFSET.press}px, -${OFFSET.press}px)`,
              boxShadow: (theme) =>
                hardShadow(OFFSET.press, theme.palette.text.primary),
            },
          }}
        >
          SWITCH WORKSPACE
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
            transition: 'width 0.2s ease',
            flexShrink: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'none',
            border: `${RULE.base}px solid`,
            borderColor: 'text.primary',
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
