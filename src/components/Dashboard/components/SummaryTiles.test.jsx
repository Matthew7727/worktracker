import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatContent } from './SummaryTiles';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

const TestWrapper = ({ children }) => (
    <ThemeProvider theme={theme}>
        {children}
    </ThemeProvider>
);

describe('StatContent Component', () => {
    it('renders value and subtitle correctly', () => {
        render(
            <StatContent
                value="42"
                subtitle="Test Subtitle"
                loading={false}
            />,
            { wrapper: TestWrapper }
        );

        expect(screen.getByText('42')).toBeInTheDocument();
        expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });

    it('renders skeleton when loading is true', () => {
        const { container } = render(
            <StatContent
                value="42"
                subtitle="Test Subtitle"
                loading={true}
            />,
            { wrapper: TestWrapper }
        );

        // Value should be replaced by skeleton
        expect(screen.queryByText('42')).not.toBeInTheDocument();
        const skeletons = container.querySelectorAll('.MuiSkeleton-root');
        expect(skeletons.length).toBeGreaterThan(0);

        // Subtitle should still be there or handled? 
        // Logic in StatContent:
        // {subtitle && (<Typography ...>{subtitle}</Typography>)}
        // It renders subtitle even if loading.
        expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });
});
