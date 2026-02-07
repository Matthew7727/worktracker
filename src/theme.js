import { createTheme } from '@mui/material/styles';
import '@fontsource/outfit/400.css';
import '@fontsource/outfit/600.css';
import '@fontsource/outfit/700.css';
import '@fontsource/outfit/900.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';

const theme = createTheme({
    palette: {
        primary: {
            main: '#8a3ffc', // Violet
        },
        secondary: {
            main: '#0072c3', // Cyan
        },
        text: {
            primary: '#000000',
            secondary: '#393939',
        },
        background: {
            default: '#ffffff',
            paper: '#ffffff',
        },
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
        body1: { fontWeight: 400 }, // Legible content
        body2: { fontWeight: 600 },
        button: { fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' },
    },
    shape: {
        borderRadius: 16,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderWidth: '3px',
                    padding: '10px 24px',
                    '&:hover': {
                        borderWidth: '3px',
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #8a3ffc 0%, #0072c3 100%)',
                    color: '#ffffff',
                    border: 'none',
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
                    borderRadius: 8,
                },
            },
        },
    },
});

export default theme;
