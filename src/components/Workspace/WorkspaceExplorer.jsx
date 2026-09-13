import React, { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { useAppContext } from '../../context/AppContext'
import DirectoryTree from './components/DirectoryTree'
import EntryViewer from './components/EntryViewer'
import { InkButton, PageHeader } from '../shared/ui'

const WorkspaceExplorer = () => {
  const { selectedDirectory, setProjectDirectory } = useAppContext()
  const [selectedEntry, setSelectedEntry] = useState(null)

  return (
    <Box
      sx={{
        maxWidth: 1280,
        mx: 'auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 9.5rem)',
      }}
    >
      <PageHeader title="Workspace" meta="Every day you've logged, by month">
        <InkButton tone="outline" onClick={() => setProjectDirectory(null)}>
          Switch workspace
        </InkButton>
      </PageHeader>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '340px minmax(0, 1fr)' },
          border: '3px solid',
          borderColor: 'text.primary',
          bgcolor: 'background.paper',
          boxShadow: (t) => `8px 8px 0 ${t.palette.text.primary}`,
        }}
      >
        <Box
          component="nav"
          aria-label="Archive"
          sx={{
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            borderRight: { md: '3px solid' },
            borderColor: { md: 'text.primary' },
            bgcolor: 'background.subtle',
          }}
        >
          <DirectoryTree
            rootDir={selectedDirectory}
            selectedEntry={selectedEntry}
            onSelectEntry={setSelectedEntry}
          />
        </Box>

        <Box sx={{ minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
          {selectedEntry ? (
            <EntryViewer
              entry={selectedEntry}
              onClose={() => setSelectedEntry(null)}
            />
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                px: 6,
                py: 4,
              }}
            >
              <Typography
                sx={{
                  fontSize: '2rem',
                  fontWeight: 900,
                  letterSpacing: '-0.035em',
                  lineHeight: 1.05,
                  maxWidth: '18ch',
                }}
              >
                Pick a day from the archive to read it.
              </Typography>
              <Typography
                sx={{ mt: 1.5, color: 'text.secondary', maxWidth: '52ch' }}
              >
                Entries are plain Markdown files in{' '}
                <Box
                  component="span"
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.9em',
                  }}
                >
                  {selectedDirectory}
                </Box>
                , so you can also open them in any editor.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default WorkspaceExplorer
