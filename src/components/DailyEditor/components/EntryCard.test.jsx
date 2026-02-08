import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EntryCard from './EntryCard';
import { ThemeProvider, createTheme } from '@mui/material';
import * as markdownHelpers from '@/utils/markdownHelpers';

// Mock markdownHelpers
vi.mock('@/utils/markdownHelpers', () => ({
    injectMarkdown: vi.fn(),
}));

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

    beforeEach(() => {
        vi.clearAllMocks();
        // Default injectMarkdown behavior
        markdownHelpers.injectMarkdown.mockReturnValue({ newText: 'Injected', newCursor: 10 });

        // Mock electronAPI
        global.window.electronAPI = {
            openExternal: vi.fn(),
        };
    });

    afterEach(() => {
        delete global.window.electronAPI;
    });

    it('renders rendered markdown in preview mode by default for saved entries', () => {
        render(<EntryCard entry={mockEntry} {...mockHandlers} />, { wrapper: TestWrapper });

        expect(screen.getByText(/I worked on/i)).toBeInTheDocument();
        // Verify tags
        expect(screen.getAllByText(/testing/i).length).toBeGreaterThan(0);
        expect(screen.getByText('14:00:00')).toBeInTheDocument();
    });

    it('switches to edit mode when the Edit button is clicked', () => {
        render(<EntryCard entry={mockEntry} {...mockHandlers} />, { wrapper: TestWrapper });

        const editButton = screen.getByLabelText(/edit/i);
        fireEvent.click(editButton);

        expect(screen.getByPlaceholderText('Describe what you accomplished...')).toBeInTheDocument();
        expect(screen.getByDisplayValue('I worked on **testing** today.')).toBeInTheDocument();
    });

    it('handles toolbar actions in edit mode', () => {
        const newEntry = { ...mockEntry, isNew: true };
        render(<EntryCard entry={newEntry} {...mockHandlers} />, { wrapper: TestWrapper });

        const boldBtn = screen.getByLabelText('Bold');
        fireEvent.click(boldBtn);

        expect(markdownHelpers.injectMarkdown).toHaveBeenCalledWith(
            expect.any(String), // content
            expect.any(Number), // start
            expect.any(Number), // end
            'bold'
        );
        expect(mockHandlers.onUpdateContent).toHaveBeenCalledWith('test-id', 'Injected');
    });

    it('handles saving', () => {
        const newEntry = { ...mockEntry, isNew: true };
        render(<EntryCard entry={newEntry} {...mockHandlers} />, { wrapper: TestWrapper });

        const saveButton = screen.getByText('SAVE');
        fireEvent.click(saveButton);

        expect(mockHandlers.onSave).toHaveBeenCalledWith('test-id');
    });

    it('handles link clicks in preview mode via electronAPI', () => {
        // Create an entry with a link
        const entryWithLink = { ...mockEntry, content: '[Link](https://example.com)' };
        render(<EntryCard entry={entryWithLink} {...mockHandlers} />, { wrapper: TestWrapper });

        const link = screen.getByText('Link');
        fireEvent.click(link);

        expect(global.window.electronAPI.openExternal).toHaveBeenCalledWith('https://example.com');
    });

    it('handles tag updates', () => {
        const newEntry = { ...mockEntry, isNew: true };
        render(<EntryCard entry={newEntry} {...mockHandlers} />, { wrapper: TestWrapper });

        const tagInput = screen.getByPlaceholderText('Add tag...');
        fireEvent.change(tagInput, { target: { value: 'new-tag' } });
        expect(mockHandlers.onUpdateTags).toHaveBeenCalledWith('test-id', 'new-tag');

        fireEvent.keyDown(tagInput, { key: 'Enter' });
        expect(mockHandlers.onAddTag).toHaveBeenCalledWith('test-id');
    });

    it('handles tag removal', () => {
        const newEntry = { ...mockEntry, isNew: true };
        render(<EntryCard entry={newEntry} {...mockHandlers} />, { wrapper: TestWrapper });

        // Find delete icon for a tag (e.g. 'vitest')
        // MUI Chip delete icon usually has class MuiChip-deleteIcon or test id 'CancelIcon'
        // We can look for the SVG within the chip that contains 'vitest'

        // Alternatively, use getAllByTestId('CancelIcon') if available, but standard is tricky.
        // Let's rely on finding the chip and then the button/icon inside it.
        const chips = screen.getAllByText('vitest');
        const chip = chips.find(c => c.closest('.MuiChip-root'));
        const deleteIcon = chip.closest('.MuiChip-root').querySelector('svg');

        fireEvent.click(deleteIcon);
        expect(mockHandlers.onRemoveTag).toHaveBeenCalledWith('test-id', 'vitest');
    });

    it('toggles expansion for long content', () => {
        const longContent = 'a'.repeat(400);
        const entry = { ...mockEntry, content: longContent };
        render(<EntryCard entry={entry} {...mockHandlers} />, { wrapper: TestWrapper });

        // Should be truncated initially
        expect(screen.queryByText(longContent)).not.toBeInTheDocument();
        expect(screen.getByText(/Read More/i)).toBeInTheDocument();

        fireEvent.click(screen.getByText(/Read More/i));

        // Should show full content (or at least no longer show "Read More" and show "Show Less")
        expect(screen.getByText(/Show Less/i)).toBeInTheDocument();
    });
});
