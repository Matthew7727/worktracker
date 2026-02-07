import React from 'react';
import { Box, Typography, Stack, Tooltip } from '@mui/material';

const WeeklyChart = ({ entries }) => {
    // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    entries.forEach(entry => {
        const dayIndex = entry.dateObj.getDay();
        counts[dayIndex]++;
    });

    const maxCount = Math.max(...counts, 1);

    return (
        <Box sx={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, px: 2 }}>
            {counts.map((count, index) => (
                <Stack key={days[index]} spacing={1} alignItems="center" sx={{ flex: 1 }}>
                    <Tooltip title={`${days[index]}: ${count} Entries`} arrow placement="top">
                        <Box
                            sx={{
                                width: '100%',
                                height: `${(count / maxCount) * 150}px`,
                                minHeight: count > 0 ? '4px' : '0px',
                                background: index === 0 || index === 6
                                    ? 'rgba(0,0,0,0.1)'
                                    : 'linear-gradient(to top, #8a3ffc, #0072c3)',
                                borderRadius: '8px 8px 0 0',
                                border: count > 0 ? '3px solid black' : 'none',
                                borderBottom: 'none',
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                '&:hover': {
                                    filter: 'brightness(1.2)',
                                    transform: 'scaleX(1.1)'
                                }
                            }}
                        />
                    </Tooltip>
                    <Typography
                        variant="caption"
                        sx={{
                            fontWeight: 900,
                            opacity: 0.5,
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
