import React from 'react'
import { Snackbar, Alert } from '@mui/material'
import { alertStyles } from '../MainLayout.styles'
import { useIsFilofax } from '../../../styles/useUiStyle'

const FeedbackSystem = ({ notification, onHide }) => {
  const isFx = useIsFilofax()
  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={4000}
      onClose={onHide}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={onHide}
        severity={notification.severity}
        variant="filled"
        sx={isFx ? { width: '100%' } : alertStyles}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  )
}

export default FeedbackSystem
