import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { getTheme } from '../theme';

const ThemeContext = createContext();

export const useThemeContext = () => {
    return useContext(ThemeContext);
};

export const ThemeContextProvider = ({ children }) => {
    // Initialize state from local storage or default to 'light'
    const [mode, setMode] = useState(() => {
        return localStorage.getItem('workTracker_themeMode') || 'light';
    });

    // Update local storage when mode changes
    useEffect(() => {
        localStorage.setItem('workTracker_themeMode', mode);
    }, [mode]);

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    // Generate the theme based on the current mode
    const theme = useMemo(() => getTheme(mode), [mode]);

    const value = {
        mode,
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            <MuiThemeProvider theme={theme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};
