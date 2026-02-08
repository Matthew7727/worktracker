import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TodoBoard from '../TodoBoard';
import * as todoManager from '@/utils/todoManager';
import * as AppContext from '@/context/AppContext';

// Mock dependencies
vi.mock('@/utils/todoManager', () => ({
    loadDailyTodos: vi.fn(),
    saveDailyTodos: vi.fn(),
}));

// Mock AppContext
vi.mock('@/context/AppContext', () => ({
    useAppContext: vi.fn(),
}));

// Mock window.confirm and alert
global.confirm = vi.fn();
global.alert = vi.fn();

const renderWithProviders = (component) => {
    return render(
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            {component}
        </LocalizationProvider>
    );
};

describe('TodoBoard', () => {
    const mockLanes = [
        {
            title: 'Work',
            items: [
                { text: 'Task 1', completed: false },
                { text: 'Task 2', completed: true },
            ]
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        // Default context mock
        AppContext.useAppContext.mockReturnValue({
            selectedDirectory: '/mock/dir',
        });

        // Default todoManager mock
        todoManager.loadDailyTodos.mockResolvedValue(mockLanes);
        global.confirm.mockReturnValue(true);
    });

    it('should load and display todos', async () => {
        renderWithProviders(<TodoBoard />);

        expect(todoManager.loadDailyTodos).toHaveBeenCalled();

        await waitFor(() => {
            expect(screen.getByText('Work')).toBeInTheDocument();
            expect(screen.getByText('Task 1')).toBeInTheDocument();
            expect(screen.getByText('Task 2')).toBeInTheDocument();
        });
    });

    it('should add a new task', async () => {
        renderWithProviders(<TodoBoard />);

        await waitFor(() => screen.getByText('Work'));

        const input = screen.getByPlaceholderText('New Task...');
        fireEvent.change(input, { target: { value: 'New Task' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        await waitFor(() => {
            expect(todoManager.saveDailyTodos).toHaveBeenCalledWith(
                '/mock/dir',
                expect.any(Date),
                expect.arrayContaining([
                    expect.objectContaining({
                        title: 'Work',
                        items: expect.arrayContaining([
                            expect.objectContaining({ text: 'New Task' })
                        ])
                    })
                ])
            );
        });
    });

    it('should toggle a task', async () => {
        renderWithProviders(<TodoBoard />);

        await waitFor(() => screen.getByText('Task 1'));

        const taskText = screen.getByText('Task 1');
        const taskItem = taskText.closest('.MuiPaper-root');
        const toggleBtn = taskItem.querySelector('button'); // First button is toggle

        fireEvent.click(toggleBtn);

        await waitFor(() => {
            expect(todoManager.saveDailyTodos).toHaveBeenCalled();
            // Check if completed became true
            const calls = todoManager.saveDailyTodos.mock.calls;
            const lastCall = calls[calls.length - 1];
            const lanes = lastCall[2];
            const workLane = lanes.find(l => l.title === 'Work');
            expect(workLane.items[0].completed).toBe(true);
        });
    });

    it('should delete a task', async () => {
        renderWithProviders(<TodoBoard />);
        await waitFor(() => screen.getByText('Task 1'));

        const taskText = screen.getByText('Task 1');
        const taskItem = taskText.closest('.MuiPaper-root');
        // The delete button is the second button (or find by icon)
        const deleteBtn = taskItem.querySelectorAll('button')[1];

        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(todoManager.saveDailyTodos).toHaveBeenCalled();
            const calls = todoManager.saveDailyTodos.mock.calls;
            const lastCall = calls[calls.length - 1];
            const lanes = lastCall[2];
            const workLane = lanes.find(l => l.title === 'Work');
            expect(workLane.items.length).toBe(1); // Task 1 removed
        });
    });

    it('should add a new lane', async () => {
        renderWithProviders(<TodoBoard />);
        await waitFor(() => screen.getByText('Work'));

        const addLaneBtn = screen.getByText('Add Category');
        fireEvent.click(addLaneBtn);

        const dialog = await screen.findByRole('dialog');
        const input = within(dialog).getByLabelText('Category Name');
        fireEvent.change(input, { target: { value: 'Personal' } });

        const confirmBtn = within(dialog).getByText('Add');
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(todoManager.saveDailyTodos).toHaveBeenCalled();
            const calls = todoManager.saveDailyTodos.mock.calls;
            const lastCall = calls[calls.length - 1];
            const lanes = lastCall[2];
            expect(lanes).toHaveLength(2);
            expect(lanes[1].title).toBe('Personal');
        });
    });

    it.skip('should rename a lane', async () => {
        renderWithProviders(<TodoBoard />);
        await waitFor(() => screen.getByText('Work'));

        // Find lane header menu
        const laneHeader = screen.getByText('Work').closest('.MuiBox-root');
        const menuBtn = within(laneHeader).getByRole('button');
        fireEvent.click(menuBtn);

        const renameMenuItem = await screen.findByText('Rename');
        fireEvent.click(renameMenuItem);

        // Should show input
        const input = await screen.findByTestId('rename-input');
        expect(input).toHaveValue('Work');
        fireEvent.change(input, { target: { value: 'Job' } });
        fireEvent.blur(input); // Trigger save

        await waitFor(() => {
            expect(todoManager.saveDailyTodos).toHaveBeenCalled();
            const calls = todoManager.saveDailyTodos.mock.calls;
            const lastCall = calls[calls.length - 1];
            const lanes = lastCall[2];
            expect(lanes[0].title).toBe('Job');
        });
    });

    it('should delete a lane', async () => {
        renderWithProviders(<TodoBoard />);
        await waitFor(() => screen.getByText('Work'));

        const laneHeader = screen.getByText('Work').closest('.MuiBox-root');
        const menuBtn = within(laneHeader).getByRole('button');
        fireEvent.click(menuBtn);

        const deleteMenuItem = await screen.findByText('Delete Lane');
        fireEvent.click(deleteMenuItem);

        expect(global.confirm).toHaveBeenCalled();

        await waitFor(() => {
            expect(todoManager.saveDailyTodos).toHaveBeenCalled();
            const calls = todoManager.saveDailyTodos.mock.calls;
            const lastCall = calls[calls.length - 1];
            const lanes = lastCall[2];
            expect(lanes).toHaveLength(0);
        });
    });
});
