import { createTheme } from '@mui/material/styles';
import '@fontsource/outfit/400.css';
import '@fontsource/outfit/600.css';
import '@fontsource/outfit/700.css';
import '@fontsource/outfit/900.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';

export const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#80b621', // Vibrant Green
        },
        secondary: {
            main: '#4a6b13', // Deep Moss Green
        },
        text: {
            primary: '#000000',
            secondary: '#393939',
            disabled: 'rgba(0, 0, 0, 0.38)',
        },
        background: {
            default: '#ffffff',
            paper: '#ffffff',
        },
        divider: 'rgba(0, 0, 0, 0.12)',
        action: {
            active: 'rgba(0, 0, 0, 0.54)',
            hover: 'rgba(0, 0, 0, 0.04)',
            selected: 'rgba(0, 0, 0, 0.08)',
            disabled: 'rgba(0, 0, 0, 0.26)',
            disabledBackground: 'rgba(0, 0, 0, 0.12)',
            focus: 'rgba(0, 0, 0, 0.12)',
        },
    },
    typography: {
        fontFamily: '"Outfit", "Inter", sans-serif',
        h1: { fontWeight: 900, letterSpacing: '-0.05em' },
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
                    backgroundImage: 'linear-gradient(135deg, #80b621 0%, #4a6b13 100%)',
                    color: '#ffffff',
                    border: 'none',
                    '&:hover': {
                        opacity: 0.9,
                    }
                },
                outlined: {
                    border: '3px solid #000000',
                    color: '#000000',
                    '&:hover': {
                        background: 'rgba(0,0,0,0.04)',
                        borderColor: '#000000',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    border: '3px solid #000000',
                    boxShadow: 'none',
                    backgroundImage: 'none',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    borderBottom: '3px solid #000000',
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
                            borderColor: 'rgba(0, 0, 0, 0.2)',
                        },
                    }
                }
            }
        }
    },
});
