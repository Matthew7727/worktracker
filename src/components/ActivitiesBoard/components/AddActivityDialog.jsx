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
import { OFFSET, RULE, hardShadow } from '../../../styles/tokens'

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
          border: `${RULE.heavy}px solid`,
          borderColor: 'text.primary',
          boxShadow: (theme) =>
            hardShadow(OFFSET.hero, theme.palette.text.primary),
          p: 2,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
        New Activity
      </DialogTitle>
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
                    fontWeight: 800,
                    border: `${RULE.hair}px solid`,
                    borderColor: 'divider',
                    '&.Mui-selected': {
                      borderColor: 'text.primary',
                      bgcolor: s.color,
                      color: '#000000',
                      '&:hover': { bgcolor: s.color },
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
            fontWeight: 800,
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
            fontWeight: 800,
            px: 3,
            py: 1,
            backgroundImage: 'none',
            bgcolor: 'background.paper',
            color: 'text.primary',
            border: `${RULE.base}px solid`,
            borderColor: 'text.primary',
            boxShadow: (theme) =>
              hardShadow(OFFSET.base, theme.palette.text.primary),
            '&:hover': {
              bgcolor: 'action.hover',
              boxShadow: (theme) =>
                hardShadow(OFFSET.press, theme.palette.text.primary),
              transform: `translate(${OFFSET.press}px, ${OFFSET.press}px)`,
            },
            '&.Mui-disabled': {
              opacity: 0.5,
              boxShadow: 'none',
              transform: 'none',
              border: `${RULE.base}px solid #ccc`,
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
