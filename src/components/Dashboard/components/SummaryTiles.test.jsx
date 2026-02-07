import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SummaryTiles from './SummaryTiles';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

const TestWrapper = ({ children }) => (
    <ThemeProvider theme={theme}>
        {children}
    </ThemeProvider>
);

describe('SummaryTiles Component', () => {
    const mockStats = {
        totalDays: 42,
        totalEntries: 1337,
        currentStreak: 7,
        longestStreak: 14
    };

    it('renders all summary cards with correct values', () => {
        render(<SummaryTiles stats={mockStats} loading={false} />, { wrapper: TestWrapper });

        expect(screen.getByText('ACTIVE DAYS')).toBeInTheDocument();
        expect(screen.getByText('42')).toBeInTheDocument();

        expect(screen.getByText('TOTAL LOGS')).toBeInTheDocument();
        expect(screen.getByText('1337')).toBeInTheDocument();

        expect(screen.getByText('CURRENT STREAK')).toBeInTheDocument();
        expect(screen.getByText('7D')).toBeInTheDocument();

        expect(screen.getByText('LONGEST STREAK')).toBeInTheDocument();
        expect(screen.getByText('14D')).toBeInTheDocument();
    });

    it('renders skeletons when loading is true', () => {
        const { container } = render(<SummaryTiles stats={mockStats} loading={true} />, { wrapper: TestWrapper });

        // Skeletons are rendered as spans with MuiSkeleton class
        const skeletons = container.querySelectorAll('.MuiSkeleton-root');
        expect(skeletons.length).toBeGreaterThan(0);
    });
});
