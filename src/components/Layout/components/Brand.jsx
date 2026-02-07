import React from 'react';
import { Box, Typography } from '@mui/material';
import { brandStyles } from '../MainLayout.styles';

const Brand = ({ onClick }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <Typography
            variant="h5"
            onClick={onClick}
            sx={brandStyles}
        >
            WORK<span>TRACKER</span>
        </Typography>
    </Box>
);

export default Brand;
