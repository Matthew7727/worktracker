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
import { useIsFilofax } from '../../../styles/useUiStyle'

const GlobalSearch = ({ rootDir, onResultClick, renderTrigger }) => {
  const isFx = useIsFilofax()
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
          sx: isFx ? { p: 2 } : searchDialogStyles,
          'data-testid': 'search-dialog',
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: isFx ? 400 : 900,
            fontSize: '1.75rem',
            letterSpacing: isFx ? 0 : '-0.035em',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: isFx ? '1px solid' : '2px solid',
            borderColor: isFx ? 'secondary.main' : 'text.primary',
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
        <DialogContent>
          <TextField
            fullWidth
            autoFocus
            placeholder="Search every day you've logged"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            variant="outlined"
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                fontSize: '1.5rem',
                height: '4rem',
                borderRadius: 0,
                '& fieldset': isFx
                  ? {}
                  : {
                      borderWidth: '3px',
                      borderColor: 'text.primary !important',
                    },
              },
            }}
          />
          <Box sx={{ mt: 5, maxHeight: '500px', overflowY: 'auto', pr: 2 }}>
            {isSearching ? (
              <Typography sx={{ textAlign: 'center', p: 4, fontWeight: 800 }}>
                Searching…
              </Typography>
            ) : results.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {results.map((res, i) => (
                  <Paper
                    key={i}
                    onClick={() => handleSelect(res.date)}
                    data-testid={`search-result-${res.date}`}
                    sx={
                      isFx
                        ? {
                            p: 2.5,
                            cursor: 'pointer',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: '6px',
                            '&:hover': { borderColor: 'primary.main' },
                          }
                        : {
                            p: 3,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            border: '3px solid',
                            borderColor: 'text.primary',
                            borderRadius: 0,
                            '&:hover': {
                              transform: 'translate(-2px, -2px)',
                              boxShadow: (theme) =>
                                `6px 6px 0 ${theme.palette.text.primary}`,
                            },
                            boxShadow: (theme) =>
                              `3px 3px 0 ${theme.palette.text.primary}`,
                          }
                    }
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
                          fontWeight: isFx ? 400 : 900,
                          color: isFx ? 'primary.main' : 'inherit',
                          fontFamily: isFx
                            ? 'inherit'
                            : '"JetBrains Mono", monospace',
                          fontSize: '1.1rem',
                        }}
                      >
                        {res.date}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          opacity: 0.5,
                        }}
                      >
                        {res.fileName}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: isFx ? '0.98rem' : '1.1rem',
                        fontWeight: isFx ? 400 : 600,
                        lineHeight: '1.5',
                      }}
                    >
                      {res.snippet}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Typography
                sx={{
                  opacity: 0.6,
                  textAlign: 'center',
                  p: 4,
                  fontWeight: 800,
                }}
              >
                {query.length >= 3
                  ? `No days mention "${query}".`
                  : 'Type at least 3 characters to search.'}
              </Typography>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default GlobalSearch
