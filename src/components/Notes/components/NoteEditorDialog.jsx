import React, { useMemo, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Typography,
} from '@mui/material'
import { getActivityStreamId } from '../../../utils/projectsManager'

// Keyed by the note/activity identity in the parent, so opening a different
// note (or a blank one) simply remounts this with fresh initial state —
// no effect needed to resync form state with the `note` prop.
const NoteEditorForm = ({
  note,
  activities,
  streamById,
  lockActivityId,
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
    <>
      <DialogTitle sx={{ fontWeight: 900 }}>
        {note ? 'Edit Note' : 'New Note'}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Title"
          fullWidth
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Note"
          fullWidth
          multiline
          minRows={5}
          variant="outlined"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{ mb: 2 }}
        />
        {!lockActivityId && (
          <>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 700 }}>
              Link to an activity (optional)
            </Typography>
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
                  placeholder="Search activities…"
                  size="small"
                />
              )}
            />
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ mt: 2, px: 3, pb: 2 }}>
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
      </DialogActions>
    </>
  )
}

const NoteEditorDialog = ({
  open,
  onClose,
  onSave,
  onDelete,
  note,
  activities = [],
  streamById = {},
  lockActivityId = null,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    disableEnforceFocus
    disableRestoreFocus
    maxWidth="sm"
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: '24px',
        border: '4px solid',
        borderColor: 'text.primary',
        boxShadow: (theme) =>
          `10px 10px 0px ${theme.palette.text.primary || '#000'}`,
        p: 2,
      },
    }}
  >
    {open && (
      <NoteEditorForm
        key={note?.id || 'new'}
        note={note}
        activities={activities}
        streamById={streamById}
        lockActivityId={lockActivityId}
        onSave={onSave}
        onDelete={onDelete}
        onClose={onClose}
      />
    )}
  </Dialog>
)

export default NoteEditorDialog
