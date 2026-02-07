import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DateNavigation from './DateNavigation';
import { ThemeProvider, createTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const theme = createTheme();

const TestWrapper = ({ children }) => (
    <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            {children}
        </LocalizationProvider>
    </ThemeProvider>
);

describe('DateNavigation Component', () => {
    const mockProps = {
        currentDate: new Date('2024-01-01T12:00:00'),
        onPrevDay: vi.fn(),
        onNextDay: vi.fn(),
        onDateChange: vi.fn(),
        onAddEntry: vi.fn()
    };

    it('triggers onPrevDay when Previous Day button is clicked', () => {
        render(<DateNavigation {...mockProps} />, { wrapper: TestWrapper });
        fireEvent.click(screen.getByLabelText('Previous Day'));
        expect(mockProps.onPrevDay).toHaveBeenCalled();
    });

    it('triggers onNextDay when Next Day button is clicked', () => {
        render(<DateNavigation {...mockProps} />, { wrapper: TestWrapper });
        fireEvent.click(screen.getByLabelText('Next Day'));
        expect(mockProps.onNextDay).toHaveBeenCalled();
    });

    it('triggers onAddEntry when Add Contribution button is clicked', () => {
        render(<DateNavigation {...mockProps} />, { wrapper: TestWrapper });
        fireEvent.click(screen.getByText('Add Contribution'));
        expect(mockProps.onAddEntry).toHaveBeenCalled();
    });
});
