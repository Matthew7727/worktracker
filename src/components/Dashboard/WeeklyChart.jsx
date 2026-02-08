import React from 'react';
import { Box, Typography, Stack, Tooltip } from '@mui/material';

const WeeklyChart = ({ entries }) => {
    // Generate last 7 days (including today)
    const days = [];
    const counts = new Array(7).fill(0);
    const dateMap = new Map(); // Map date string YYYY-MM-DD to index 0-6

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

        days.push(dayLabel);
        dateMap.set(dateStr, 6 - i);
    }

    // Tally counts for only the relevant days
    entries.forEach(entry => {
        if (dateMap.has(entry.date)) {
            const index = dateMap.get(entry.date);
            counts[index]++;
        }
    });

    const maxCount = Math.max(...counts, 1);

    return (
        <Box sx={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, px: 2 }}>
            {counts.map((count, index) => (
                <Stack key={index} spacing={1} alignItems="center" sx={{ flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                    <Tooltip title={`${days[index]}: ${count} Entries`} arrow placement="top">
                        <Box
                            sx={{
                                width: '100%',
                                maxWidth: '40px', // Ensure bars don't get too wide
                                height: count > 0 ? `${(count / maxCount) * 100}%` : '4px', // Use percentage of parent height
                                minHeight: '4px',
                                background: index === 6
                                    ? 'linear-gradient(to top, #4a6b13, #80b621)'
                                    : 'linear-gradient(to top, #80b621, #4a6b13)',
                                borderRadius: '8px 8px 0 0',
                                border: count > 0 ? '3px solid black' : 'none',
                                borderBottom: 'none',
                                opacity: index === 6 ? 1 : 0.8,
                                transformOrigin: 'bottom',
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                '&:hover': {
                                    filter: 'brightness(1.2)',
                                    transform: 'scaleY(1.1)', // Scale Y instead of X for better effect
                                    opacity: 1
                                }
                            }}
                        />
                    </Tooltip>
                    <Typography
                        variant="caption"
                        sx={{
                            fontWeight: 900,
                            opacity: index === 6 ? 1 : 0.5,
                            color: index === 6 ? 'primary.main' : 'text.secondary',
                            fontSize: '0.7rem'
                        }}
                    >
                        {days[index]}
                    </Typography>
                </Stack>
            ))}
        </Box>
    );
};

export default WeeklyChart;
