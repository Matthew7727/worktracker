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
  confirmDisabled = false,
  children,
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
    {(message || children) && (
      <DialogContent>
        {message && <Typography variant="body2">{message}</Typography>}
        {children}
      </DialogContent>
    )}
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <Button
        onClick={onConfirm}
        variant="outlined"
        disabled={confirmDisabled}
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
