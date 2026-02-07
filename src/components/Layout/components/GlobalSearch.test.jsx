import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GlobalSearch from './GlobalSearch';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

const TestWrapper = ({ children }) => (
    <ThemeProvider theme={theme}>
        {children}
    </ThemeProvider>
);

describe('GlobalSearch Component', () => {
    const mockOnResultClick = vi.fn();
    const rootDir = '/mock/logs';

    it('opens search dialog when typing 3 or more characters', async () => {
        render(<GlobalSearch rootDir={rootDir} onResultClick={mockOnResultClick} />, { wrapper: TestWrapper });

        const input = screen.getByPlaceholderText('Search archive...');
        fireEvent.change(input, { target: { value: 'test' } });

        await waitFor(() => {
            expect(screen.getByText('GLOBAL SEARCH')).toBeInTheDocument();
        });
    });

    it('renders search results from API', async () => {
        window.electronAPI.searchEntries.mockResolvedValue({
            success: true,
            results: [{ date: '2024-01-01', snippet: 'Matched content', fileName: '2024-01-01.md' }]
        });

        render(<GlobalSearch rootDir={rootDir} onResultClick={mockOnResultClick} />, { wrapper: TestWrapper });

        const input = screen.getByPlaceholderText('Search archive...');
        fireEvent.change(input, { target: { value: 'search' } });

        await waitFor(() => {
            expect(screen.getByText(/Matched content/i)).toBeInTheDocument();
            expect(screen.getByText('2024-01-01')).toBeInTheDocument();
        });
    });

    it('calls onResultClick when a result is selected', async () => {
        window.electronAPI.searchEntries.mockResolvedValue({
            success: true,
            results: [{ date: '2024-05-20', snippet: 'Selected', fileName: '2024-05-20.md' }]
        });

        render(<GlobalSearch rootDir={rootDir} onResultClick={mockOnResultClick} />, { wrapper: TestWrapper });

        fireEvent.change(screen.getByPlaceholderText('Search archive...'), { target: { value: 'select' } });

        const resultItem = await screen.findByTestId('search-result-2024-05-20');
        fireEvent.click(resultItem);

        expect(mockOnResultClick).toHaveBeenCalledWith('2024-05-20');

        // Use waitFor for the dialog to disappear due to transitions
        await waitFor(() => {
            expect(screen.queryByText('GLOBAL SEARCH')).not.toBeInTheDocument();
        });
    });
});
