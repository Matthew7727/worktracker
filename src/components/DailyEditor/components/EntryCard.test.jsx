import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
        content: 'I worked on **testing** today.',
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

    it('renders rendered markdown in preview mode by default for saved entries', () => {
        render(<EntryCard entry={mockEntry} {...mockHandlers} />, { wrapper: TestWrapper });

        // Check for parts of the text to be more resilient to markdown splitting
        expect(screen.getByText(/I worked on/i)).toBeInTheDocument();
        // The word "testing" might be inside a <strong> tag
        expect(screen.getByText(/testing/i, { selector: 'strong' })).toBeInTheDocument();

        // Tags should also be present
        expect(screen.getAllByText(/testing/i).length).toBeGreaterThan(1); // One in text, one in Chip
        expect(screen.getByText('14:00:00')).toBeInTheDocument();
    });

    it('switches to edit mode when the Edit button is clicked', async () => {
        render(<EntryCard entry={mockEntry} {...mockHandlers} />, { wrapper: TestWrapper });

        const editButton = screen.getByLabelText(/edit/i);
        fireEvent.click(editButton);

        // Now we should see the textarea
        expect(screen.getByPlaceholderText('Describe what you accomplished...')).toBeInTheDocument();
        expect(screen.getByDisplayValue('I worked on **testing** today.')).toBeInTheDocument();
    });

    it('shows markdown toolbar when in edit mode', () => {
        // New entry starts in edit mode
        const newEntry = { ...mockEntry, isNew: true };
        render(<EntryCard entry={newEntry} {...mockHandlers} />, { wrapper: TestWrapper });

        expect(screen.getByLabelText(/bold/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/italic/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/heading/i)).toBeInTheDocument();
    });

    it('triggers onUpdateContent when text is typed in edit mode', () => {
        const newEntry = { ...mockEntry, isNew: true };
        render(<EntryCard entry={newEntry} {...mockHandlers} />, { wrapper: TestWrapper });

        const textarea = screen.getByPlaceholderText('Describe what you accomplished...');
        fireEvent.change(textarea, { target: { value: 'New content' } });

        expect(mockHandlers.onUpdateContent).toHaveBeenCalledWith('test-id', 'New content');
    });

    it('triggers onSave when SAVE button is clicked', () => {
        const newEntry = { ...mockEntry, isNew: true };
        render(<EntryCard entry={newEntry} {...mockHandlers} />, { wrapper: TestWrapper });

        const saveButton = screen.getByText('SAVE');
        fireEvent.click(saveButton);

        expect(mockHandlers.onSave).toHaveBeenCalledWith('test-id');
    });
});
