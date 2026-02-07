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

    it('opens search dialog when clicking the search icon', async () => {
        render(<GlobalSearch rootDir={rootDir} onResultClick={mockOnResultClick} />, { wrapper: TestWrapper });

        const searchBtn = screen.getByLabelText(/open search/i);
        fireEvent.click(searchBtn);

        await waitFor(() => {
            expect(screen.getByText('GLOBAL SEARCH')).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/type keywords to find logs/i)).toBeInTheDocument();
        });
    });

    it('renders search results from API', async () => {
        window.electronAPI.searchEntries.mockResolvedValue({
            success: true,
            results: [{ date: '2024-01-01', snippet: 'Matched content', fileName: '2024-01-01.md' }]
        });

        render(<GlobalSearch rootDir={rootDir} onResultClick={mockOnResultClick} />, { wrapper: TestWrapper });

        // Open Dialog
        fireEvent.click(screen.getByLabelText(/open search/i));

        // Find input in dialog
        const input = screen.getByPlaceholderText(/type keywords to find logs/i);
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

        // Open Dialog
        fireEvent.click(screen.getByLabelText(/open search/i));

        const input = screen.getByPlaceholderText(/type keywords to find logs/i);
        fireEvent.change(input, { target: { value: 'select' } });

        const resultItem = await screen.findByTestId('search-result-2024-05-20');
        fireEvent.click(resultItem);

        expect(mockOnResultClick).toHaveBeenCalledWith('2024-05-20');

        // Use waitFor for the dialog to disappear due to transitions
        await waitFor(() => {
            expect(screen.queryByText('GLOBAL SEARCH')).not.toBeInTheDocument();
        });
    });
});
