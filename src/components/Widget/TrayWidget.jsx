import React, { useEffect, useMemo, useState } from 'react'
import {
  AddTaskOutlined,
  ArrowOutward,
  CalendarMonthOutlined,
  CheckCircleOutline,
  EditNoteOutlined,
  FolderOutlined,
  TodayOutlined,
} from '@mui/icons-material'
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  IconButton,
  InputBase,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import { useAppContext } from '../../context/AppContext'
import {
  createTask,
  loadProjects,
  saveProjects,
} from '../../utils/projectsManager'
import { createNote, saveNote } from '../../utils/notesManager'

const todayValue = () => new Date().toISOString().slice(0, 10)
const addDays = (days) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}
const duePresets = [
  { label: 'Today', value: todayValue() },
  { label: 'Tomorrow', value: addDays(1) },
  { label: 'Next week', value: addDays(7) },
]

const TrayWidget = () => {
  const { selectedDirectory, streamConfigLoading, needsStreamSetup } =
    useAppContext()
  const [mode, setMode] = useState('todo')
  const [text, setText] = useState('')
  const [selection, setSelection] = useState(null)
  const [dueDate, setDueDate] = useState('')
  const [projects, setProjects] = useState({
    activities: [],
    clientProjects: [],
  })
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  useEffect(() => {
    document.body.style.backgroundColor = 'transparent'
    return () => {
      document.body.style.backgroundColor = ''
    }
  }, [])

  useEffect(() => {
    let active = true
    if (!selectedDirectory) return undefined
    loadProjects(selectedDirectory).then((data) => {
      if (active) setProjects(data)
    })
    return () => {
      active = false
    }
  }, [selectedDirectory])

  const destinations = useMemo(
    () => [
      ...projects.clientProjects
        .filter((project) => project.status !== 'completed')
        .map((project) => ({ ...project, kind: 'project' })),
      ...projects.activities
        .filter((activity) => activity.status !== 'completed')
        .map((activity) => ({ ...activity, kind: 'activity' })),
    ],
    [projects]
  )

  const openFullApp = async (path = '/todos') => {
    if (window.electronAPI?.openWidgetRoute) {
      await window.electronAPI.openWidgetRoute(path)
    } else {
      window.location.hash = `#${path}`
    }
  }

  const saveCapture = async () => {
    const value = text.trim()
    if (!value || !selectedDirectory || saving) return
    setSaving(true)
    try {
      if (mode === 'note') {
        await saveNote(
          selectedDirectory,
          createNote({
            title: value.split('\n')[0].slice(0, 80),
            content: value,
            activityId: selection?.kind === 'activity' ? selection.id : null,
            activityTitle:
              selection?.kind === 'activity' ? selection.title : null,
            projectId: selection?.kind === 'project' ? selection.id : null,
            projectTitle:
              selection?.kind === 'project' ? selection.title : null,
          })
        )
        setStatus('Note saved')
      } else if (selection) {
        const ownerKey =
          selection.kind === 'project' ? 'clientProjects' : 'activities'
        const updated = {
          ...projects,
          [ownerKey]: projects[ownerKey].map((item) =>
            item.id === selection.id
              ? {
                  ...item,
                  tasks: [
                    ...(item.tasks || []),
                    createTask(value, { dueDate }),
                  ],
                }
              : item
          ),
        }
        await saveProjects(selectedDirectory, updated)
        setProjects(updated)
        setStatus('Todo added')
      } else {
        setStatus('Choose a project or activity')
        return
      }
      setText('')
      setDueDate('')
      window.setTimeout(() => setStatus(''), 1800)
    } finally {
      setSaving(false)
    }
  }

  const configured =
    selectedDirectory && !streamConfigLoading && !needsStreamSetup
  const canSave = text.trim() && (mode === 'note' || selection) && configured

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        p: 1,
        boxSizing: 'border-box',
        overflow: 'hidden',
        bgcolor: 'transparent',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
      }}
    >
      <Box
        sx={{
          height: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden',
          borderRadius: 2.5,
          bgcolor: 'rgba(248, 248, 250, 0.97)',
          color: '#1d1d1f',
          border: '1px solid rgba(0,0,0,0.14)',
          boxShadow: '0 16px 34px rgba(0, 0, 0, 0.24)',
          px: 1.5,
          py: 1.25,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>
              Work Tracker
            </Typography>
            <Typography
              sx={{ fontSize: 11, color: 'rgba(29,29,31,0.58)', mt: 0.2 }}
            >
              {new Date().toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
              })}
            </Typography>
          </Box>
          <Tooltip title="Open Work Tracker">
            <IconButton
              size="small"
              onClick={() => openFullApp('/todos')}
              aria-label="Open Work Tracker"
            >
              <ArrowOutward sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Box>
        {!configured ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
              Set up a workspace to capture work here.
            </Typography>
            <Button
              size="small"
              onClick={() => openFullApp('/')}
              sx={{ mt: 1, textTransform: 'none' }}
            >
              Open Work Tracker
            </Button>
          </Box>
        ) : (
          <>
            <ToggleButtonGroup
              exclusive
              value={mode}
              onChange={(_, value) => value && setMode(value)}
              fullWidth
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  textTransform: 'none',
                  fontSize: 12,
                  py: 0.55,
                  borderColor: 'rgba(0,0,0,0.13)',
                },
              }}
            >
              <ToggleButton value="todo">
                <AddTaskOutlined sx={{ fontSize: 16, mr: 0.7 }} />
                Todo
              </ToggleButton>
              <ToggleButton value="note">
                <EditNoteOutlined sx={{ fontSize: 17, mr: 0.7 }} />
                Quick note
              </ToggleButton>
            </ToggleButtonGroup>
            <InputBase
              autoFocus
              multiline={mode === 'note'}
              minRows={mode === 'note' ? 3 : 1}
              placeholder={
                mode === 'todo' ? 'What needs doing?' : 'Write a quick note…'
              }
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (mode === 'todo' && event.key === 'Enter') {
                  event.preventDefault()
                  saveCapture()
                }
                if (event.key === 'Escape') setText('')
              }}
              sx={{
                mt: 1.1,
                px: 1.1,
                py: 0.85,
                width: '100%',
                boxSizing: 'border-box',
                fontSize: 13,
                lineHeight: 1.4,
                borderRadius: 1.5,
                bgcolor: '#fff',
                border: '1px solid rgba(0,0,0,0.16)',
                '&.Mui-focused': {
                  borderColor: '#007aff',
                  boxShadow: '0 0 0 3px rgba(0,122,255,0.17)',
                },
              }}
            />
            <Autocomplete
              size="small"
              options={destinations}
              value={selection}
              onChange={(_, value) => setSelection(value)}
              getOptionLabel={(option) => option.title}
              groupBy={(option) =>
                option.kind === 'project' ? 'Projects' : 'Activities'
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={
                    mode === 'note'
                      ? 'Link to a project or activity (optional)'
                      : 'Project or activity'
                  }
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props} sx={{ fontSize: 12.5 }}>
                  <FolderOutlined
                    sx={{ mr: 0.8, fontSize: 16, color: 'text.secondary' }}
                  />
                  {option.title}
                </Box>
              )}
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  fontSize: 12.5,
                  borderRadius: 1.5,
                  bgcolor: '#fff',
                },
                '& .MuiInputBase-input': { py: 0.7 },
              }}
            />
            {mode === 'todo' && (
              <Box
                sx={{
                  mt: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.55,
                  flexWrap: 'wrap',
                }}
              >
                <CalendarMonthOutlined
                  sx={{ fontSize: 16, color: 'rgba(29,29,31,0.55)', mr: 0.15 }}
                />
                {duePresets.map((preset) => (
                  <Chip
                    key={preset.label}
                    label={preset.label}
                    size="small"
                    onClick={() =>
                      setDueDate(dueDate === preset.value ? '' : preset.value)
                    }
                    variant={dueDate === preset.value ? 'filled' : 'outlined'}
                    color={dueDate === preset.value ? 'primary' : 'default'}
                    sx={{ fontSize: 11, height: 25 }}
                  />
                ))}
                <TextField
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  inputProps={{ 'aria-label': 'Due date' }}
                  sx={{ width: 128, '& input': { py: 0.35, fontSize: 11.5 } }}
                />
              </Box>
            )}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mt: 1.2,
              }}
            >
              <Typography
                sx={{
                  fontSize: 11.5,
                  color: status ? '#237a3b' : 'rgba(29,29,31,0.55)',
                }}
              >
                {status ||
                  (mode === 'todo'
                    ? 'Return to add'
                    : 'Saved as a Markdown note')}
              </Typography>
              <Button
                variant="contained"
                disableElevation
                size="small"
                disabled={!canSave || saving}
                onClick={saveCapture}
                startIcon={
                  mode === 'todo' ? (
                    <CheckCircleOutline />
                  ) : (
                    <EditNoteOutlined />
                  )
                }
                sx={{
                  textTransform: 'none',
                  borderRadius: 1.5,
                  fontSize: 12,
                  px: 1.25,
                  py: 0.55,
                  bgcolor: '#007aff',
                  '&:hover': { bgcolor: '#0067d9' },
                }}
              >
                {saving
                  ? 'Saving…'
                  : mode === 'todo'
                    ? 'Add todo'
                    : 'Save note'}
              </Button>
            </Box>
            <Box
              sx={{
                display: 'flex',
                gap: 1.4,
                borderTop: '1px solid rgba(0,0,0,0.1)',
                mt: 1.05,
                pt: 0.85,
              }}
            >
              <Button
                size="small"
                onClick={() => openFullApp('/editor')}
                startIcon={<TodayOutlined />}
                sx={{
                  p: 0,
                  minWidth: 0,
                  textTransform: 'none',
                  fontSize: 11.5,
                  color: 'rgba(29,29,31,0.67)',
                }}
              >
                Log today
              </Button>
              <Button
                size="small"
                onClick={() => openFullApp('/notes')}
                startIcon={<EditNoteOutlined />}
                sx={{
                  p: 0,
                  minWidth: 0,
                  textTransform: 'none',
                  fontSize: 11.5,
                  color: 'rgba(29,29,31,0.67)',
                }}
              >
                All notes
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}

export default TrayWidget
