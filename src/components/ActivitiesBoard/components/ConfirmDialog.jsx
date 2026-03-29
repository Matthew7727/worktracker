import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material'

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  onConfirm,
  onCancel,
}) => (
  <Dialog
    open={open}
    onClose={onCancel}
    disableEnforceFocus
    disableRestoreFocus
    maxWidth="xs"
    fullWidth
  >
    <DialogTitle sx={{ fontWeight: 900 }}>{title}</DialogTitle>
    {message && (
      <DialogContent>
        <Typography variant="body2">{message}</Typography>
      </DialogContent>
    )}
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <Button
        onClick={onConfirm}
        variant="outlined"
        sx={
          danger
            ? {
                borderColor: 'error.main',
                color: 'error.main',
                '&:hover': {
                  borderColor: 'error.dark',
                  color: 'error.dark',
                  bgcolor: 'transparent',
                },
              }
            : {}
        }
      >
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
)

export default ConfirmDialog
