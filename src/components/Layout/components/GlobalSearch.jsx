import React, { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Paper,
  Box,
  TextField,
  Tooltip,
} from '@mui/material'
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material'
import { searchDialogStyles, toolbarIconStyles } from '../MainLayout.styles'
import { RULE, FONT } from '../../../styles/tokens'

const GlobalSearch = ({ rootDir, onResultClick, renderTrigger }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const performSearch = useCallback(
    async (q) => {
      if (!q || q.length < 3 || !rootDir) return
      setIsSearching(true)
      try {
        const response = await window.electronAPI.searchEntries({
          rootDir,
          query: q,
        })
        if (response.success) {
          setResults(response.results)
        }
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setIsSearching(false)
      }
    },
    [rootDir]
  )

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length >= 3) performSearch(query)
      else setResults([])
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [query, performSearch])

  // Global shortcut (Ctrl+F)
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        setIsOpen(true)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const handleSelect = (date) => {
    setIsOpen(false)
    setQuery('')
    onResultClick(date)
  }

  return (
    <>
      {renderTrigger ? (
        renderTrigger(() => setIsOpen(true))
      ) : (
        <Tooltip title="Search Archive (Ctrl+F)" arrow>
          <IconButton
            onClick={() => setIsOpen(true)}
            sx={toolbarIconStyles}
            aria-label="Open search"
          >
            <SearchIcon />
          </IconButton>
        </Tooltip>
      )}

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: searchDialogStyles,
          'data-testid': 'search-dialog',
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            fontSize: '2rem',
            letterSpacing: '-0.03em',
            px: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `${RULE.base}px solid`,
            borderColor: 'text.primary',
            mb: 2,
          }}
        >
          Search entries
          <IconButton
            onClick={() => setIsOpen(false)}
            aria-label="Close search"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 0 }}>
          <TextField
            fullWidth
            autoFocus
            placeholder="Search every entry"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            variant="outlined"
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                fontSize: '1.5rem',
                fontWeight: 600,
                height: '4rem',
                '& fieldset': {
                  borderWidth: RULE.base,
                  borderColor: 'text.primary !important',
                },
              },
            }}
          />
          <Box sx={{ mt: 5, maxHeight: '500px', overflowY: 'auto', pr: 2 }}>
            {isSearching ? (
              <Typography sx={{ p: 4, fontWeight: 700 }}>Searching…</Typography>
            ) : results.length > 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderTop: `${RULE.base}px solid`,
                  borderColor: 'text.primary',
                }}
              >
                {results.map((res, i) => (
                  <Paper
                    key={i}
                    onClick={() => handleSelect(res.date)}
                    data-testid={`search-result-${res.date}`}
                    sx={{
                      p: 2.5,
                      cursor: 'pointer',
                      border: 0,
                      borderBottom: `${RULE.hair}px solid`,
                      borderColor: 'divider',
                      transition: 'background-color 0.1s linear',
                      '&:hover': { bgcolor: 'background.subtle' },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: FONT.data,
                          fontWeight: 700,
                          fontSize: '1.1rem',
                        }}
                      >
                        {res.date}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: FONT.data,
                          fontSize: '0.8rem',
                          fontWeight: 400,
                          color: 'text.secondary',
                        }}
                      >
                        {res.fileName}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '1rem',
                        fontWeight: 400,
                        lineHeight: 1.55,
                        maxWidth: '68ch',
                      }}
                    >
                      "{res.snippet}"
                    </Typography>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Typography
                sx={{
                  py: 4,
                  fontWeight: 600,
                  color: 'text.secondary',
                  maxWidth: '68ch',
                }}
              >
                {query.length >= 3
                  ? `No entry mentions “${query}”. Try a shorter or different word.`
                  : 'Type at least three characters to search every entry in your workspace.'}
              </Typography>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default GlobalSearch
