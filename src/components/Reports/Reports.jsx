import React, { useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Stack,
  Fade,
} from '@mui/material'
import { Download } from '@mui/icons-material'
import { useAppContext } from '../../context/AppContext'
import { loadAllEntries } from '../../utils/DataManager'

const Reports = () => {
  const { selectedDirectory, showNotification } = useAppContext()
  const [range, setRange] = useState('all')
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState('')

  const handleExport = async (format) => {
    if (!selectedDirectory) return
    setIsExporting(true)
    setExportStatus('Loading entries...')

    try {
      const entries = await loadAllEntries(selectedDirectory)
      let filteredEntries = await entries

      const now = new Date()
      if (range === 'last30') {
        const cutoff = new Date()
        cutoff.setDate(now.getDate() - 30)
        filteredEntries = filteredEntries.filter((e) => e.dateObj >= cutoff)
      } else if (range === 'thisYear') {
        const startOfYear = new Date(now.getFullYear(), 0, 1)
        filteredEntries = filteredEntries.filter(
          (e) => e.dateObj >= startOfYear
        )
      }

      setExportStatus(`Processing ${filteredEntries.length} entries...`)

      let content = ''
      let extension = ''

      if (format === 'json') {
        content = JSON.stringify(filteredEntries, null, 2)
        extension = 'json'
      } else {
        content = `# Work Tracker Export\n\nGenerated: ${now.toLocaleDateString()}\nRange: ${range}\n\n`
        filteredEntries.forEach((e) => {
          const timeHeader = e.time ? ` [${e.time}]` : ''
          content += `### ${e.date}${timeHeader}\n\n`
          if (e.tags && e.tags.length > 0) {
            content += `**Tags:** ${e.tags.join(', ')}\n\n`
          }
          content += `${e.content}\n\n`
        })
        content += `---\n\n`
        extension = 'md'
      }

      if (window.electronAPI) {
        const { canceled, filePath } = await window.electronAPI.saveFile({
          title: `Export ${format.toUpperCase()}`,
          defaultPath: `work-tracker-export-${now.toISOString().split('T')[0]}.${extension}`,
          buttonLabel: 'Export',
          filters: [{ name: format.toUpperCase(), extensions: [extension] }],
        })

        if (canceled || !filePath) {
          showNotification('Export canceled', 'info')
        } else {
          setExportStatus('Saving file...')
          const result = await window.electronAPI.writeFile(filePath, content)
          if (result.success) {
            showNotification('Export successful!', 'success')
          } else {
            showNotification(`Export Error: ${result.error}`, 'error')
          }
        }
      }
    } catch (error) {
      console.error('Export failed:', error)
      showNotification('Export system failure', 'error')
    } finally {
      setIsExporting(false)
      setExportStatus('')
    }
  }

  return (
    <Fade in={true} timeout={600}>
      <Box
        className="reports-page"
        sx={{
          maxWidth: '1200px',
          mx: 'auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h1">Reports & Export</Typography>
          <Typography
            variant="h5"
            sx={{ mt: 2, fontWeight: 700, opacity: 0.7 }}
          >
            Generate and distribute your work intelligence.
          </Typography>
        </Box>

        <Grid container spacing={6} justifyContent="center">
          <Grid item xs={12} md={7}>
            <Paper
              sx={{ p: 6, borderRadius: '24px', border: '3px solid black' }}
            >
              <Typography variant="h4" sx={{ mb: 4 }}>
                Configuration
              </Typography>

              <FormControl fullWidth variant="outlined" sx={{ mb: 4 }}>
                <InputLabel
                  id="export-range-label"
                  sx={{ fontWeight: 900, color: 'black' }}
                >
                  DATE RANGE
                </InputLabel>
                <Select
                  labelId="export-range-label"
                  value={range}
                  label="DATE RANGE"
                  onChange={(e) => setRange(e.target.value)}
                  sx={{
                    borderRadius: '16px',
                    fontWeight: 900,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderWidth: '3px',
                      borderColor: 'black',
                    },
                  }}
                >
                  <MenuItem value="all" sx={{ fontWeight: 800 }}>
                    All Time
                  </MenuItem>
                  <MenuItem value="thisYear" sx={{ fontWeight: 800 }}>
                    This Year
                  </MenuItem>
                  <MenuItem value="last30" sx={{ fontWeight: 800 }}>
                    Last 30 Days
                  </MenuItem>
                </Select>
              </FormControl>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} mt={4}>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={() => handleExport('md')}
                  disabled={isExporting}
                  sx={{ px: 4, py: 1.5 }}
                >
                  EXPORT MARKDOWN
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={() => handleExport('json')}
                  disabled={isExporting}
                  sx={{ px: 4, py: 1.5 }}
                >
                  EXPORT JSON
                </Button>
              </Stack>

              <Box sx={{ mt: 4, height: '24px' }}>
                {isExporting && (
                  <Stack direction="row" spacing={2} alignItems="center">
                    <CircularProgress size={20} color="secondary" />
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 900, color: 'secondary.main' }}
                    >
                      {exportStatus}
                    </Typography>
                  </Stack>
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper
              sx={{
                p: 6,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px dashed black',
                borderRadius: '24px',
                bgcolor: 'rgba(0,0,0,0.02)',
              }}
            >
              <Typography
                variant="h6"
                sx={{ textAlign: 'center', lineHeight: 1.8, fontWeight: 800 }}
              >
                Data is exported as a single file. Markdown is optimized for{' '}
                <br />
                <Box
                  component="span"
                  sx={{ color: 'primary.main', fontWeight: 950 }}
                >
                  NOTION & OBSIDIAN.
                </Box>
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  )
}

export default Reports
