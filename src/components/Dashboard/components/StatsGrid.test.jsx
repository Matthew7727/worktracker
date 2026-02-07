import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StatsGrid from './StatsGrid';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

// Mock WeeklyChart because it might use Chart.js or similar which is hard to test in jsdom
vi.mock('../WeeklyChart', () => ({
    default: () => <div data-testid="weekly-chart">Mock Chart</div>
}));

const TestWrapper = ({ children }) => (
    <ThemeProvider theme={theme}>
        {children}
    </ThemeProvider>
);

describe('StatsGrid Component', () => {
    const mockProps = {
        loading: false,
        allEntries: [],
        topTags: [{ tag: 'React', count: 5 }, { tag: 'Tests', count: 3 }],
        persona: 'CONSISTENCY KING'
    };

    it('renders Weekly Distribution, Matrix, and Persona cards', () => {
        render(<StatsGrid {...mockProps} />, { wrapper: TestWrapper });

        expect(screen.getByText('Weekly Distribution')).toBeInTheDocument();
        expect(screen.getByTestId('weekly-chart')).toBeInTheDocument();

        expect(screen.getByText('Matrix')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('5x')).toBeInTheDocument();

        expect(screen.getByText('SYSTEM PERSONA')).toBeInTheDocument();
        expect(screen.getByText('CONSISTENCY KING')).toBeInTheDocument();
    });

    it('renders skeletons when loading', () => {
        const { container } = render(<StatsGrid {...mockProps} loading={true} />, { wrapper: TestWrapper });
        const skeletons = container.querySelectorAll('.MuiSkeleton-root');
        expect(skeletons.length).toBeGreaterThan(0);
    });

    it('shows empty state for tags if none present', () => {
        render(<StatsGrid {...mockProps} topTags={[]} />, { wrapper: TestWrapper });
        expect(screen.getByText('No tags yet.')).toBeInTheDocument();
    });
});
