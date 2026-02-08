import React from 'react';
import { Tooltip, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const ContributionGraph = ({ entries }) => {
    const theme = useTheme();
    // 1. Generate last 365 days
    const today = new Date();
    const days = [];
    for (let i = 364; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        days.push(d);
    }

    // 2. Map entries for quick lookup
    const entryMap = new Set(entries.map(e => e.date));

    // 3. Group by weeks
    const weeks = [];
    let currentWeek = new Array(7).fill(null);
    const firstDayOfWeek = days[0].getDay();

    for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek[i] = null;
    }

    for (const date of days) {
        const dayOfWeek = date.getDay();
        currentWeek[dayOfWeek] = date;

        if (dayOfWeek === 6) {
            weeks.push(currentWeek);
            currentWeek = new Array(7).fill(null);
        }
    }
    if (currentWeek.some(d => d !== null)) {
        weeks.push(currentWeek);
    }

    const blockSize = 12;
    const blockGap = 4;

    const getColor = (date) => {
        if (!date) return 'transparent';
        const dateStr = date.toISOString().split('T')[0];
        return entryMap.has(dateStr) ? theme.palette.primary.main : '#bdbdbd';
    };

    const getTitle = (date) => {
        if (!date) return '';
        const dateStr = date.toISOString().split('T')[0];
        return `${dateStr}: ${entryMap.has(dateStr) ? 'Logged Contribution' : 'Empty Archive'}`;
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', overflowX: 'auto', py: 2, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: `${blockGap}px` }}>
                {weeks.map((week, wIndex) => (
                    <Box key={wIndex} sx={{ display: 'flex', flexDirection: 'column', gap: `${blockGap}px` }}>
                        {week.map((date, dIndex) => (
                            <Tooltip
                                key={dIndex}
                                title={getTitle(date)}
                                arrow
                                placement="top"
                            >
                                <Box
                                    sx={{
                                        width: `${blockSize}px`,
                                        height: `${blockSize}px`,
                                        backgroundColor: getColor(date),
                                        borderRadius: '3px',
                                        transition: 'all 0.1s',
                                        '&:hover': {
                                            transform: 'scale(1.2)',
                                            zIndex: 1,
                                            boxShadow: date ? '0 0 8px rgba(0,0,0,0.2)' : 'none'
                                        }
                                    }}
                                />
                            </Tooltip>
                        ))}
                    </Box>
                ))}
            </Box>
            <Typography variant="caption" sx={{ mt: 2, fontWeight: 700, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                CONTRIBUTION PIPELINE: LAST 365 DAYS
            </Typography>
        </Box>
    );
};

export default ContributionGraph;
