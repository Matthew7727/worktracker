import React from 'react';
import { Grid, Paper, Stack, Typography, Box, Skeleton } from '@mui/material';
import { EventAvailable, AutoGraph as TotalIcon, LocalFireDepartment as StreakIcon } from '@mui/icons-material';
import { summaryCardStyles } from '../Dashboard.styles';

const SummaryCard = ({ title, value, icon, subtitle, loading }) => (
    <Paper sx={summaryCardStyles}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2" sx={{ letterSpacing: '0.1em', fontWeight: 900, opacity: 0.5 }}>{title}</Typography>
            {icon}
        </Stack>
        <Box sx={{ mt: 2 }}>
            <Typography variant="h2" sx={{ fontWeight: 950, letterSpacing: '-0.04em' }}>
                {loading ? <Skeleton width="80px" /> : value}
            </Typography>
            {subtitle && (
                <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.6, textTransform: 'uppercase' }}>
                    {subtitle}
                </Typography>
            )}
        </Box>
    </Paper>
);

const SummaryTiles = ({ stats, loading }) => {
    return (
        <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
                <SummaryCard
                    title="ACTIVE DAYS"
                    value={stats.totalDays}
                    icon={<EventAvailable sx={{ color: 'primary.main', fontSize: '2rem' }} />}
                    subtitle="Total archive dates"
                    loading={loading}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <SummaryCard
                    title="TOTAL LOGS"
                    value={stats.totalEntries}
                    icon={<TotalIcon sx={{ color: 'secondary.main', fontSize: '2rem' }} />}
                    subtitle="Discrete contributions"
                    loading={loading}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <SummaryCard
                    title="CURRENT STREAK"
                    value={`${stats.currentStreak}D`}
                    icon={<StreakIcon sx={{ color: '#ff5c00', fontSize: '2rem' }} />}
                    subtitle="Consecutive productivity"
                    loading={loading}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <SummaryCard
                    title="LONGEST STREAK"
                    value={`${stats.longestStreak}D`}
                    icon={<StreakIcon sx={{ color: '#ffb800', fontSize: '2rem' }} />}
                    subtitle="All-time high record"
                    loading={loading}
                />
            </Grid>
        </Grid>
    );
};

export default SummaryTiles;
