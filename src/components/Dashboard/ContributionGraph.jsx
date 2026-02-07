import React from 'react';
import { Tooltip } from '@carbon/react';

const ContributionGraph = ({ entries }) => {
    // 1. Generate last 365 days
    const today = new Date();
    const days = [];
    for (let i = 364; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        days.push(d);
    }

    // 2. Map entries for quick lookup
    const entryMap = new Set(entries.map(e => e.date)); // Set of 'YYYY-MM-DD'

    // 3. Group by weeks
    // We want to align so that the first column starts correctly based on the day of week of the first date.
    // Actually, simpler: Just fill weeks.
    // GitHub graph usually starts on Sunday.

    // Let's build a grid: 6 rows (or 7) x N cols.
    // Each cell represents a day.

    // Adjusted strategy:
    // Create an array of weeks. Each week has 7 days (or nulls if padding needed).

    const weeks = [];
    let currentWeek = new Array(7).fill(null);

    // Align first date
    // days[0] is 364 days ago.
    // What day of week is it?
    const firstDayOfWeek = days[0].getDay(); // 0 (Sun) - 6 (Sat)

    // If the first day is Wednesday (3), we need to fill 0, 1, 2 with nulls.
    // But usually we just show the rolling window.
    // Let's stick to a precise Year view.

    // Actually, for simplicity, let's just dump 53 columns of 7 days.
    // We iterate through the `days` array.

    let dayIndex = 0;
    // We need to pad the beginning of the first week
    for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek[i] = null;
    }

    for (const date of days) {
        const dayOfWeek = date.getDay();
        currentWeek[dayOfWeek] = date;

        if (dayOfWeek === 6) { // Saturday, end of week
            weeks.push(currentWeek);
            currentWeek = new Array(7).fill(null);
        }
    }
    // Push last partial week
    if (currentWeek.some(d => d !== null)) {
        weeks.push(currentWeek);
    }

    // Render configuration
    const blockSize = 10;
    const blockGap = 2;

    const getColor = (date) => {
        if (!date) return 'transparent';
        const dateStr = date.toISOString().split('T')[0];
        return entryMap.has(dateStr) ? '#1192e8' : '#e0e0e0'; // Carbon Blue 60 vs Gray 20
    };

    const getTitle = (date) => {
        if (!date) return '';
        const dateStr = date.toISOString().split('T')[0];
        return `${dateStr}: ${entryMap.has(dateStr) ? 'Logged' : 'No entry'}`;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: `${blockGap}px` }}>
                {weeks.map((week, wIndex) => (
                    <div key={wIndex} style={{ display: 'flex', flexDirection: 'column', gap: `${blockGap}px` }}>
                        {week.map((date, dIndex) => (
                            <div
                                key={dIndex}
                                title={getTitle(date)}
                                style={{
                                    width: `${blockSize}px`,
                                    height: `${blockSize}px`,
                                    backgroundColor: getColor(date),
                                    borderRadius: '2px'
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#666' }}>
                Last 365 Days
            </div>
        </div>
    );
};

export default ContributionGraph;
