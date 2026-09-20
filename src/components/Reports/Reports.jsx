import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Download } from '@mui/icons-material'
import { useAppContext } from '../../context/AppContext'
import { loadAllEntries } from '../../utils/DataManager'
import { loadProjects } from '../../utils/projectsManager'
import { loadGoals } from '../../utils/goalsManager'
import { buildExport, filterEntries } from '../../utils/exportEntries'

const Reports = () => {
  const { selectedDirectory, showNotification, streamConfig, refreshTrigger } =
    useAppContext()
  const [filters, setFilters] = useState({
    range: 'all',
    startDate: '',
    endDate: '',
    tag: '',
    workId: '',
    goalId: '',
  })
  const [entries, setEntries] = useState([])
  const [work, setWork] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const [entryData, projectData, goalData] = await Promise.all([
        loadAllEntries(selectedDirectory, streamConfig?.streams),
        loadProjects(selectedDirectory),
        loadGoals(selectedDirectory),
      ])
      if (cancelled) return
      setEntries(entryData)
      setWork([
        ...(projectData.clientProjects || []),
        ...(projectData.activities || []),
      ])
      setGoals(goalData)
      setLoading(false)
    }
    if (selectedDirectory) load()
    return () => {
      cancelled = true
    }
  }, [selectedDirectory, streamConfig, refreshTrigger])

  const tags = useMemo(
    () => [...new Set(entries.flatMap((entry) => entry.tags || []))].sort(),
    [entries]
  )
  const filteredEntries = useMemo(() => {
    const selectedWork = work.find((item) => item.id === filters.workId)
    return filterEntries(entries, {
      ...filters,
      workTitle: selectedWork?.title,
    })
  }, [entries, filters, work])
  const update = (key) => (event) =>
    setFilters((current) => ({ ...current, [key]: event.target.value }))

  const handleExport = async (format) => {
    setIsExporting(true)
    try {
      const now = new Date()
      const selectedWork = work.find((item) => item.id === filters.workId)
      const selectedGoal = goals.find((item) => item.id === filters.goalId)
      const { content, extension } = buildExport(
        filteredEntries,
        format,
        {
          ...filters,
          work: selectedWork?.title || '',
          goal: selectedGoal?.title || '',
        },
        now
      )
      const { canceled, filePath } = await window.electronAPI.saveFile({
        title: `Export ${format.toUpperCase()} report`,
        defaultPath: `work-tracker-report-${now.toISOString().split('T')[0]}.${extension}`,
        buttonLabel: 'Export',
        filters: [{ name: format.toUpperCase(), extensions: [extension] }],
      })
      if (canceled || !filePath) {
        showNotification('Export canceled', 'info')
      } else {
        const result = await window.electronAPI.writeFile(filePath, content)
        showNotification(
          result.success ? 'Report exported' : `Export error: ${result.error}`,
          result.success ? 'success' : 'error'
        )
      }
    } catch (error) {
      console.error('Export failed:', error)
      showNotification('Export system failure', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const dateRange = filteredEntries.length
    ? `${filteredEntries[filteredEntries.length - 1].date} – ${filteredEntries[0].date}`
    : 'No matching entries'

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%', pb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1">Reports</Typography>
        <Typography variant="h6" sx={{ mt: 1, color: 'text.secondary' }}>
          Filter your work evidence, review it, then export a focused summary.
        </Typography>
      </Box>
      <Paper sx={{ p: 3, border: '3px solid', borderColor: 'text.primary' }}>
        <Typography sx={{ fontWeight: 900, mb: 2 }}>Filters</Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          <FormControl fullWidth>
            <InputLabel id="report-range">Period</InputLabel>
            <Select
              labelId="report-range"
              label="Period"
              value={filters.range}
              onChange={update('range')}
            >
              <MenuItem value="all">All time</MenuItem>
              <MenuItem value="thisYear">This year</MenuItem>
              <MenuItem value="last30">Last 30 days</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="From"
            type="date"
            value={filters.startDate}
            onChange={update('startDate')}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="To"
            type="date"
            value={filters.endDate}
            onChange={update('endDate')}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <FormControl fullWidth>
            <InputLabel id="report-tag">Tag</InputLabel>
            <Select
              labelId="report-tag"
              label="Tag"
              value={filters.tag}
              onChange={update('tag')}
            >
              <MenuItem value="">Any tag</MenuItem>
              {tags.map((tag) => (
                <MenuItem key={tag} value={tag}>
                  {tag}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="report-work">Project / activity</InputLabel>
            <Select
              labelId="report-work"
              label="Project / activity"
              value={filters.workId}
              onChange={update('workId')}
            >
              <MenuItem value="">Any work</MenuItem>
              {work.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="report-goal">Goal</InputLabel>
            <Select
              labelId="report-goal"
              label="Goal"
              value={filters.goalId}
              onChange={update('goalId')}
            >
              <MenuItem value="">Any goal</MenuItem>
              {goals.map((goal) => (
                <MenuItem key={goal.id} value={goal.id}>
                  {goal.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>
      <Paper
        sx={{ mt: 3, p: 3, border: '3px solid', borderColor: 'text.primary' }}
      >
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              gap={2}
              alignItems={{ sm: 'center' }}
            >
              <Box>
                <Typography sx={{ fontSize: '1.8rem', fontWeight: 900 }}>
                  {filteredEntries.length} entries
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>
                  {dateRange}
                </Typography>
              </Box>
              <Stack direction="row" gap={1}>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  disabled={isExporting}
                  onClick={() => handleExport('md')}
                >
                  Markdown
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  disabled={isExporting}
                  onClick={() => handleExport('json')}
                >
                  JSON
                </Button>
              </Stack>
            </Stack>
            <Box
              sx={{
                mt: 3,
                borderTop: '2px solid',
                borderColor: 'divider',
                pt: 2,
              }}
            >
              <Typography sx={{ fontWeight: 900, mb: 1 }}>Preview</Typography>
              {filteredEntries.slice(0, 8).map((entry) => (
                <Box
                  key={entry.id}
                  sx={{
                    py: 1.25,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography sx={{ fontWeight: 800 }}>
                    {entry.date}
                    {entry.tags?.length ? ` · ${entry.tags.join(', ')}` : ''}
                  </Typography>
                  <Typography
                    sx={{
                      color: 'text.secondary',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {entry.content
                      .replace(/[#*_`]/g, ' ')
                      .replace(/\s+/g, ' ')
                      .trim() || 'No written detail'}
                  </Typography>
                </Box>
              ))}
              {filteredEntries.length > 8 && (
                <Typography sx={{ mt: 1, color: 'text.secondary' }}>
                  Showing the first 8 entries in this preview.
                </Typography>
              )}
            </Box>
          </>
        )}
      </Paper>
    </Box>
  )
}

export default Reports
