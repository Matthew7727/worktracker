import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { alertStyles } from '../MainLayout.styles';

const FeedbackSystem = ({ notification, onHide }) => {
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
                sx={alertStyles}
            >
                {notification.message}
            </Alert>
        </Snackbar>
    );
};

export default FeedbackSystem;
