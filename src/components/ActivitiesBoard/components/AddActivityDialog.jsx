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

const AddActivityDialog = ({ open, onClose, onAdd }) => {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('PD')

  const handleClose = () => {
    setTitle('')
    setType('PD')
    onClose()
  }

  const handleSubmit = () => {
    if (!title.trim()) return
    onAdd(title.trim(), type)
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
          boxShadow: (theme) => `10px 10px 0px ${theme.palette.text.primary || '#000'}`,
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
            Type
          </Typography>
          <ToggleButtonGroup
            value={type}
            exclusive
            onChange={(_, val) => val && setType(val)}
            size="small"
          >
            <ToggleButton
              value="PD"
              sx={{
                fontWeight: 900,
                border: '2px solid',
                borderColor: 'divider',
                '&.Mui-selected': {
                  borderColor: 'text.primary',
                  bgcolor: '#ffd166',
                  color: '#000000',
                  '&:hover': { bgcolor: '#e6bd5c' },
                },
              }}
            >
              Practice Development
            </ToggleButton>
            <ToggleButton
              value="BD"
              sx={{
                fontWeight: 900,
                border: '2px solid',
                borderColor: 'divider',
                '&.Mui-selected': {
                  borderColor: 'text.primary',
                  bgcolor: '#eb8449',
                  color: '#000000',
                  '&:hover': { bgcolor: '#d4733d' },
                },
              }}
            >
              Business Development
            </ToggleButton>
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
          disabled={!title.trim()}
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
