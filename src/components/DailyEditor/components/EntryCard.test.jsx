import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EntryCard from './EntryCard';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

const TestWrapper = ({ children }) => (
    <ThemeProvider theme={theme}>
        {children}
    </ThemeProvider>
);

describe('EntryCard Component', () => {
    const mockEntry = {
        id: 'test-id',
        content: 'I worked on testing today.',
        tags: ['testing', 'vitest'],
        time: '14:00:00',
        isNew: false,
        isSaving: false,
        newTag: ''
    };

    const mockHandlers = {
        onSave: vi.fn(),
        onDelete: vi.fn(),
        onUpdateContent: vi.fn(),
        onUpdateTags: vi.fn(),
        onAddTag: vi.fn(),
        onRemoveTag: vi.fn()
    };

    it('renders entry content and tags', () => {
        render(<EntryCard entry={mockEntry} {...mockHandlers} />, { wrapper: TestWrapper });

        expect(screen.getByDisplayValue('I worked on testing today.')).toBeInTheDocument();
        expect(screen.getByText('testing')).toBeInTheDocument();
        expect(screen.getByText('vitest')).toBeInTheDocument();
        expect(screen.getByText('14:00:00')).toBeInTheDocument();
    });

    it('triggers onUpdateContent when text is typed', () => {
        render(<EntryCard entry={mockEntry} {...mockHandlers} />, { wrapper: TestWrapper });

        const textarea = screen.getByPlaceholderText('Describe what you accomplished...');
        fireEvent.change(textarea, { target: { value: 'New content' } });

        expect(mockHandlers.onUpdateContent).toHaveBeenCalledWith('test-id', 'New content');
    });

    it('triggers onSave when SAVE button is clicked', () => {
        render(<EntryCard entry={mockEntry} {...mockHandlers} />, { wrapper: TestWrapper });

        const saveButton = screen.getByText('SAVE');
        fireEvent.click(saveButton);

        expect(mockHandlers.onSave).toHaveBeenCalledWith('test-id');
    });

    it('shows loading state on SAVE button when isSaving is true', () => {
        const savingEntry = { ...mockEntry, isSaving: true };
        render(<EntryCard entry={savingEntry} {...mockHandlers} />, { wrapper: TestWrapper });

        expect(screen.getByText('SAVING...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    });
});
