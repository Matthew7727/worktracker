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
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.dark' },
                },
              }}
            >
              Practice Development
            </ToggleButton>
            <ToggleButton
              value="BD"
              sx={{
                fontWeight: 900,
                '&.Mui-selected': {
                  bgcolor: '#eb8449',
                  color: '#fff',
                  '&:hover': { bgcolor: '#d4733d' },
                },
              }}
            >
              Business Development
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="outlined"
          disabled={!title.trim()}
        >
          Add Activity
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddActivityDialog
