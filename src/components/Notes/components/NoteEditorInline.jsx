import React, { useMemo, useState } from 'react'
import { Box, TextField, Autocomplete, InputBase } from '@mui/material'
import { getActivityStreamId } from '../../../utils/projectsManager'
import { InkButton } from '../../shared/ui'

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

  const bandColor = linkedActivity
    ? streamById[getActivityStreamId(linkedActivity)]?.color
    : null
  const isEmpty = !title.trim() && !content.trim()

  const handleSubmit = () => {
    if (isEmpty) return
    onSave({
      title: title.trim(),
      content,
      activityId: linkedActivity?.id || null,
      activityTitle: linkedActivity?.title || null,
    })
  }

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose?.()
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
      }}
      sx={{
        mb: 3,
        breakInside: 'avoid',
        bgcolor: 'background.paper',
        border: '3px solid',
        borderColor: 'text.primary',
        borderTop: '10px solid',
        borderTopColor: bandColor || 'text.primary',
        boxShadow: (t) => `8px 8px 0 ${t.palette.text.primary}`,
      }}
    >
      <Box sx={{ px: 2.25, pt: 1.75, pb: 1 }}>
        <InputBase
          autoFocus
          fullWidth
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{
            fontWeight: 900,
            fontSize: '1.2rem',
            letterSpacing: '-0.02em',
            mb: 0.5,
          }}
        />
        <InputBase
          fullWidth
          multiline
          minRows={5}
          placeholder="Write the note"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{ fontSize: '0.95rem', lineHeight: 1.55 }}
        />
      </Box>
      {!lockActivityId && (
        <Box
          sx={{
            px: 2.25,
            py: 1,
            borderTop: '2px solid',
            borderColor: 'divider',
          }}
        >
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
                placeholder="Link to an activity (optional)"
                size="small"
                InputProps={{ ...params.InputProps, disableUnderline: true }}
                sx={{ '& input': { fontWeight: 700, fontSize: '0.88rem' } }}
              />
            )}
          />
        </Box>
      )}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1.25,
          borderTop: '3px solid',
          borderColor: 'text.primary',
          bgcolor: 'background.subtle',
        }}
      >
        {note && onDelete && (
          <InkButton
            tone="ghost"
            size="sm"
            onClick={onDelete}
            sx={{ color: 'error.main', mr: 'auto' }}
          >
            Delete
          </InkButton>
        )}
        <InkButton
          tone="ghost"
          size="sm"
          onClick={onClose}
          sx={{ ml: note && onDelete ? 0 : 'auto' }}
        >
          Cancel
        </InkButton>
        <InkButton type="submit" size="sm" disabled={isEmpty}>
          Save note
        </InkButton>
      </Box>
    </Box>
  )
}

export default NoteEditorInline
