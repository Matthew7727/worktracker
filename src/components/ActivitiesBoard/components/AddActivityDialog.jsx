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
} from '@mui/material'

const AddActivityDialog = ({ open, onClose, onAdd, streams = [] }) => {
  const [title, setTitle] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  // Fall back to the first stream when nothing valid is selected
  const streamId = streams.some((s) => s.id === selectedId)
    ? selectedId
    : streams[0]?.id || ''

  const handleClose = () => {
    setTitle('')
    setSelectedId(null)
    onClose()
  }

  const handleSubmit = () => {
    if (!title.trim() || !streamId) return
    onAdd(title.trim(), streamId)
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
          margin="dense"
          label="Activity Title"
          fullWidth
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          sx={{ mb: 2 }}
        />
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 700 }}>
            Stream
          </Typography>
          <ToggleButtonGroup
            value={streamId}
            exclusive
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
