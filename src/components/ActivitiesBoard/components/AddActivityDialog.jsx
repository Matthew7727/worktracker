import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material'
import {
  getTopLevelActivities,
  getActivityStreamId,
} from '../../../utils/projectsManager'

const NO_PARENT = ''

const AddActivityDialog = ({
  open,
  onClose,
  onAdd,
  streams = [],
  activities = [],
  defaultParentId = null,
}) => {
  const [title, setTitle] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [parentId, setParentId] = useState(defaultParentId || NO_PARENT)
  const [ongoing, setOngoing] = useState(false)

  const parentActivity = defaultParentId
    ? activities.find((a) => a.id === defaultParentId)
    : null

  // Fall back to the first stream when nothing valid is selected
  const streamId = parentActivity
    ? getActivityStreamId(parentActivity)
    : streams.some((s) => s.id === selectedId)
      ? selectedId
      : streams[0]?.id || ''

  const parentOptions = getTopLevelActivities(activities).filter(
    (a) => getActivityStreamId(a) === streamId
  )

  const handleClose = () => {
    setTitle('')
    setSelectedId(null)
    setParentId(defaultParentId || NO_PARENT)
    setOngoing(false)
    onClose()
  }

  const handleSubmit = () => {
    if (!title.trim() || !streamId) return
    onAdd(title.trim(), streamId, {
      parentId: parentId || null,
      ongoing,
    })
    handleClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      disableEnforceFocus
      disableRestoreFocus
      maxWidth="xs"
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
      <DialogTitle sx={{ fontWeight: 900 }}>New Activity</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Activity Title"
          fullWidth
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          sx={{ mb: 2 }}
        />

        {parentActivity ? (
          <Typography
            variant="body2"
            sx={{ mb: 2, color: 'text.secondary', fontWeight: 700 }}
          >
            Part of: {parentActivity.title}
          </Typography>
        ) : (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 700 }}>
              Stream
            </Typography>
            <ToggleButtonGroup
              value={streamId}
              exclusive
              disabled={!!parentId}
              onChange={(_, val) => val && setSelectedId(val)}
              size="small"
              sx={{ flexWrap: 'wrap' }}
            >
              {streams.map((s) => (
                <ToggleButton
                  key={s.id}
                  value={s.id}
                  sx={{
                    fontWeight: 900,
                    border: '2px solid',
                    borderColor: 'divider',
                    '&.Mui-selected': {
                      borderColor: 'text.primary',
                      bgcolor: s.color,
                      color: '#000000',
                      '&:hover': { bgcolor: s.color, opacity: 0.85 },
                    },
                  }}
                >
                  {s.name}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        )}

        {!parentActivity && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 700 }}>
              Part of (optional)
            </Typography>
            <Select
              fullWidth
              size="small"
              value={
                parentOptions.some((a) => a.id === parentId)
                  ? parentId
                  : NO_PARENT
              }
              displayEmpty
              onChange={(e) => setParentId(e.target.value)}
            >
              <MenuItem value={NO_PARENT}>
                <em>None — a standalone activity</em>
              </MenuItem>
              {parentOptions.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.title}
                </MenuItem>
              ))}
            </Select>
          </Box>
        )}

        <FormControlLabel
          control={
            <Switch
              checked={ongoing}
              onChange={(e) => setOngoing(e.target.checked)}
            />
          }
          label="Ongoing — no fixed end date"
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ mt: 2, px: 3, pb: 2 }}>
        <Button
          onClick={handleClose}
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
          disabled={!title.trim() || !streamId}
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
          Add Activity
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddActivityDialog
