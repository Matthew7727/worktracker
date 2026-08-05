import React, { useMemo, useState } from 'react'
import { Box, Button, TextField, Autocomplete } from '@mui/material'
import { getActivityStreamId } from '../../../utils/projectsManager'

// Inline note editor — renders in the flow of the page (no modal), right where
// the note will actually live. Keyed by the note identity in the parent, so
// switching between notes (or starting a blank one) just remounts with fresh
// initial state — no effect needed to resync form state with the `note` prop.
const NoteEditorInline = ({
  note,
  activities = [],
  streamById = {},
  lockActivityId = null,
  onSave,
  onDelete,
  onClose,
}) => {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [linkedActivity, setLinkedActivity] = useState(() => {
    const activityId = lockActivityId || note?.activityId || null
    return activityId
      ? activities.find((a) => a.id === activityId) || null
      : null
  })

  // Autocomplete's `groupBy` requires same-group options to be contiguous.
  const groupedActivities = useMemo(
    () =>
      [...activities].sort((a, b) => {
        const streamA = streamById[getActivityStreamId(a)]?.name || ''
        const streamB = streamById[getActivityStreamId(b)]?.name || ''
        return streamA.localeCompare(streamB)
      }),
    [activities, streamById]
  )

  const handleSubmit = () => {
    if (!title.trim() && !content.trim()) return
    onSave({
      title: title.trim(),
      content,
      activityId: linkedActivity?.id || null,
      activityTitle: linkedActivity?.title || null,
    })
  }

  return (
    <Box
      sx={{
        p: 2,
        mb: 2,
      }}
    >
      <TextField
        autoFocus
        placeholder="Name"
        fullWidth
        variant="standard"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        InputProps={{ disableUnderline: true }}
        sx={{
          mb: 1.5,
          '& .MuiInputBase-input': { fontWeight: 800, fontSize: '1rem' },
          '& .MuiInputBase-input::placeholder': {
            color: 'text.disabled',
            opacity: 1,
          },
        }}
      />
      <TextField
        placeholder="Note"
        fullWidth
        multiline
        minRows={4}
        variant="standard"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        InputProps={{ disableUnderline: true }}
        sx={{
          mb: 1.5,
          '& .MuiInputBase-input::placeholder': {
            color: 'text.disabled',
            opacity: 1,
          },
        }}
      />
      {!lockActivityId && (
        <Autocomplete
          options={groupedActivities}
          value={linkedActivity}
          onChange={(_, val) => setLinkedActivity(val)}
          getOptionLabel={(a) => a.title || ''}
          groupBy={(a) => streamById[getActivityStreamId(a)]?.name || ''}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="standard"
              placeholder="Activity"
              size="small"
              InputProps={{ ...params.InputProps, disableUnderline: true }}
              sx={{
                '& .MuiInputBase-input::placeholder': {
                  color: 'text.disabled',
                  opacity: 1,
                },
              }}
            />
          )}
          sx={{ mb: 1.5 }}
        />
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {note && onDelete && (
          <Button
            onClick={onDelete}
            sx={{
              fontWeight: 900,
              color: 'error.main',
              mr: 'auto',
              '&:hover': { bgcolor: 'transparent', opacity: 0.7 },
            }}
          >
            Delete
          </Button>
        )}
        <Button
          onClick={onClose}
          sx={{
            fontWeight: 900,
            color: 'text.secondary',
            ml: note && onDelete ? 0 : 'auto',
            '&:hover': { color: 'text.primary', bgcolor: 'transparent' },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!title.trim() && !content.trim()}
          sx={{
            fontWeight: 900,
            px: 3,
            py: 1,
            borderRadius: '16px',
            backgroundImage: 'none',
            bgcolor: 'background.paper',
            color: 'text.primary',
            border: '3px solid',
            borderColor: 'text.primary',
            boxShadow: (theme) => `4px 4px 0px ${theme.palette.text.primary}`,
            '&:hover': {
              bgcolor: 'action.hover',
              boxShadow: (theme) => `2px 2px 0px ${theme.palette.text.primary}`,
              transform: 'translate(2px, 2px)',
            },
            '&.Mui-disabled': {
              opacity: 0.5,
              boxShadow: 'none',
              transform: 'none',
              border: '3px solid #ccc',
            },
          }}
        >
          Save Note
        </Button>
      </Box>
    </Box>
  )
}

export default NoteEditorInline
