import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material'

const AddClientProjectDialog = ({ open, onClose, onAdd }) => {
  const [title, setTitle] = useState('')

  const handleClose = () => {
    setTitle('')
    onClose()
  }

  const handleSubmit = () => {
    if (!title.trim()) return
    onAdd(title.trim())
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
      <DialogTitle sx={{ fontWeight: 900 }}>New Client Project</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Project Name"
          fullWidth
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
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
          Add Project
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddClientProjectDialog
