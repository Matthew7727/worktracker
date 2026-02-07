import { createTheme } from '@mui/material/styles';
import '@fontsource/outfit/400.css';
import '@fontsource/outfit/600.css';
import '@fontsource/outfit/700.css';
import '@fontsource/outfit/900.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';

export const getTheme = (mode) => {
    const isDark = mode === 'dark';

    return createTheme({
        palette: {
            mode,
            primary: {
                main: '#80b621', // Vibrant Green
            },
            secondary: {
                main: '#4a6b13', // Deep Moss Green
            },
            text: {
                primary: isDark ? '#ffffff' : '#000000',
                secondary: isDark ? '#b0b0b0' : '#393939',
            },
            background: {
                default: isDark ? '#121212' : '#ffffff',
                paper: isDark ? '#1e1e1e' : '#ffffff',
            },
            divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
        },
        typography: {
            fontFamily: '"Outfit", "Inter", sans-serif',
            h1: { fontWeight: 950, letterSpacing: '-0.05em' },
            h2: { fontWeight: 900, letterSpacing: '-0.04em' },
            h3: { fontWeight: 900, letterSpacing: '-0.03em' },
            h4: { fontWeight: 900 },
            h5: { fontWeight: 900 },
            h6: { fontWeight: 900 },
            subtitle1: { fontWeight: 700 },
            subtitle2: { fontWeight: 700 },
            body1: { fontWeight: 400 },
            body2: { fontWeight: 600 },
            button: { fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' },
        },
        shape: {
            borderRadius: 24, // Consistent with our card styles
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        transition: 'background-color 0.3s ease, color 0.3s ease',
                    }
                }
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderWidth: '3px',
                        padding: '10px 24px',
                        borderRadius: '16px',
                        '&:hover': {
                            borderWidth: '3px',
                        },
                    },
                    containedPrimary: {
                        background: 'linear-gradient(135deg, #80b621 0%, #4a6b13 100%)',
                        color: '#ffffff',
                        border: 'none',
                        '&:hover': {
                            opacity: 0.9,
                        }
                    },
                    outlined: {
                        border: isDark ? '3px solid #ffffff' : '3px solid #000000',
                        color: isDark ? '#ffffff' : '#000000',
                        '&:hover': {
                            background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.04)',
                            borderColor: isDark ? '#ffffff' : '#000000',
                        },
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        border: isDark ? '3px solid #333333' : '3px solid #000000',
                        boxShadow: 'none',
                        backgroundImage: 'none', // Remove default dark mode elevation overlay
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: isDark ? '#121212' : '#ffffff',
                        color: isDark ? '#ffffff' : '#000000',
                        borderBottom: isDark ? '3px solid #333333' : '3px solid #000000',
                        boxShadow: 'none',
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        fontWeight: 900,
                        border: '2px solid currentColor',
                        borderRadius: 12,
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderWidth: '2px',
                                borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                            },
                        }
                    }
                }
            }
        },
    });
};
