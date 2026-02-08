import React from 'react';
import { Stack, Typography, Box, Skeleton } from '@mui/material';

export const StatContent = ({ value, subtitle, loading }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
        <Box sx={{ mt: 2 }}>
            <Typography variant="h2" sx={{ fontWeight: 950, letterSpacing: '-0.04em', lineHeight: 1 }}>
                {loading ? <Skeleton width="80px" /> : value}
            </Typography>
            {subtitle && (
                <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.6, textTransform: 'uppercase', display: 'block', mt: 1 }}>
                    {subtitle}
                </Typography>
            )}
        </Box>
    </Box>
);


