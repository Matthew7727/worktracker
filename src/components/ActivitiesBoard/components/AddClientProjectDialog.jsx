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
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="outlined"
          disabled={!title.trim()}
        >
          Add Project
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddClientProjectDialog
