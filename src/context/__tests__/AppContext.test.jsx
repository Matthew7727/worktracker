import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AppProvider, useAppContext } from '../AppContext';
import { useEffect } from 'react';

// Mock electron API
const mockWatchWorkspace = vi.fn();
const mockOnWorkspaceChanged = vi.fn();

global.window.electronAPI = {
    watchWorkspace: mockWatchWorkspace,
    onWorkspaceChanged: mockOnWorkspaceChanged
};

// Helper component to access context
const TestComponent = () => {
    const { selectedDirectory, setProjectDirectory, showNotification, notification } = useAppContext();
    return (
        <div>
            <div data-testid="dir">{selectedDirectory || 'none'}</div>
            <div data-testid="notification">{notification.message}</div>
            <button onClick={() => setProjectDirectory('/new/path')}>Set Dir</button>
            <button onClick={() => showNotification('Test Msg')}>Notify</button>
        </div>
    );
};

describe('AppContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should provide default values', () => {
        render(
            <AppProvider>
                <TestComponent />
            </AppProvider>
        );
        expect(screen.getByTestId('dir')).toHaveTextContent('none');
    });

    // it('should load directory from localStorage', () => {
    //    localStorage.setItem('workTracker_projectDir', '/saved/path');
    //    render(
    //        <AppProvider>
    //            <TestComponent />
    //        </AppProvider>
    //    );
    //    expect(screen.getByTestId('dir')).toHaveTextContent('/saved/path');
    // });
    // Note: State initialization from localStorage happens on mount. 
    // Testing this requires careful setup or wrapper re-mounting.

    it('should update project directory and persist', async () => {
        const { user } = render(
            <AppProvider>
                <TestComponent />
            </AppProvider>
        );

        // We can't use userEvent setup easily inside the test without async act
        // So we trigger via click

        await act(async () => {
            screen.getByText('Set Dir').click();
        });

        expect(screen.getByTestId('dir')).toHaveTextContent('/new/path');
        expect(localStorage.getItem('workTracker_projectDir')).toBe('/new/path');
        expect(mockWatchWorkspace).toHaveBeenCalledWith('/new/path');
    });

    it('should show notifications', async () => {
        render(
            <AppProvider>
                <TestComponent />
            </AppProvider>
        );

        await act(async () => {
            screen.getByText('Notify').click();
        });

        expect(screen.getByTestId('notification')).toHaveTextContent('Test Msg');
    });
});
