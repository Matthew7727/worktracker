import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ThemeContextProvider, useThemeContext } from '../ThemeContext';

// Helper
const ThemeTest = () => {
    const { mode, toggleTheme } = useThemeContext();
    return (
        <div>
            <div data-testid="mode">{mode}</div>
            <button onClick={toggleTheme}>Toggle</button>
        </div>
    );
};

describe('ThemeContext', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should default to light mode', () => {
        render(
            <ThemeContextProvider>
                <ThemeTest />
            </ThemeContextProvider>
        );
        expect(screen.getByTestId('mode')).toHaveTextContent('light');
    });

    it('should toggle theme', async () => {
        render(
            <ThemeContextProvider>
                <ThemeTest />
            </ThemeContextProvider>
        );

        await act(async () => {
            screen.getByText('Toggle').click();
        });

        expect(screen.getByTestId('mode')).toHaveTextContent('dark');

        await act(async () => {
            screen.getByText('Toggle').click();
        });

        expect(screen.getByTestId('mode')).toHaveTextContent('light');
    });

    it('should persist theme change', async () => {
        render(
            <ThemeContextProvider>
                <ThemeTest />
            </ThemeContextProvider>
        );

        await act(async () => {
            screen.getByText('Toggle').click();
        });

        expect(localStorage.getItem('workTracker_themeMode')).toBe('dark');
    });
});
