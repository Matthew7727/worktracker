import React from 'react';
import { Paper, Typography, Box, Grid } from '@mui/material';
import { boldBorder } from '../Dashboard.styles';

const DashboardWidget = ({ title, icon, children, xs = 12, sm, md, lg, xl, sx = {}, contentSx = {}, ...props }) => {
    return (
        <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
            <Paper
                {...props}
                sx={(theme) => ({
                    ...boldBorder(theme),
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 3,
                    transition: 'all 0.2s',
                    '&:hover': {
                        transform: 'translate(-4px, -4px)',
                        boxShadow: theme.palette.mode === 'light' ? '10px 10px 0px #000000' : '10px 10px 0px rgba(255,255,255,0.1)',
                    },
                    ...sx
                })}
            >
                {title && (
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 900, display: 'flex', alignItems: 'center', gap: .5 }}>
                        {title} {icon}
                    </Typography>

                )}
                <Box sx={{ flexGrow: 1, ...contentSx }}>
                    {children}
                </Box>
            </Paper>
        </Grid>
    );
};

export default DashboardWidget;
