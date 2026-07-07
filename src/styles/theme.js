import { createTheme } from '@mui/material/styles'
import '@fontsource/outfit/400.css'
import '@fontsource/outfit/600.css'
import '@fontsource/outfit/700.css'
import '@fontsource/outfit/900.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/700.css'

// Base options independent of mode
const baseOptions = {
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
    button: {
      fontWeight: 900,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
  },
  shape: {
    borderRadius: 24,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          transition: 'background-color 0.3s ease, color 0.3s ease',
        },
      },
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
    MuiFilledInput: {
      styleOverrides: {
        root: {
          '&::before': { borderBottom: 'none !important' },
          '&::after': { borderBottom: 'none !important' },
          '&:hover:not(.Mui-disabled)::before': {
            borderBottom: 'none !important',
          },
        },
      },
    },
  },
}

export const getTheme = (mode) => {
  return createTheme({
    ...baseOptions,
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // Light Mode
            primary: { main: '#80b621' },
            secondary: { main: '#ffd166' },
            text: { primary: '#000000', secondary: '#393939' },
            background: {
              default: '#ffffff',
              paper: '#ffffff',
              subtle: '#f7f7f7',
            },
            divider: 'rgba(0, 0, 0, 0.12)',
            action: { active: 'rgba(0, 0, 0, 0.54)' },
          }
        : {
            // Dark Mode
            primary: { main: '#aedd4d' }, // Lighter green for dark mode
            secondary: { main: '#80b621' },
            text: { primary: '#ffffff', secondary: 'rgba(255, 255, 255, 0.7)' },
            background: {
              default: '#121212',
              paper: '#1e1e1e',
              subtle: '#252525',
            },
            divider: 'rgba(255, 255, 255, 0.12)',
            action: { active: 'rgba(255, 255, 255, 0.7)' },
          }),
    },
    components: {
      ...baseOptions.components,
      MuiButton: {
        ...baseOptions.components.MuiButton,
        styleOverrides: {
          ...baseOptions.components.MuiButton.styleOverrides,
          containedPrimary: {
            color: mode === 'light' ? '#ffffff' : '#000000',
            border: 'none',
            '&:hover': { opacity: 0.9 },
          },
          outlined: {
            border: `3px solid ${mode === 'light' ? '#000000' : '#ffffff'}`,
            color: mode === 'light' ? '#000000' : '#ffffff',
            '&:hover': {
              background:
                mode === 'light'
                  ? 'rgba(0,0,0,0.04)'
                  : 'rgba(255,255,255,0.08)',
              borderColor: mode === 'light' ? '#000000' : '#ffffff',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            border: `3px solid ${mode === 'light' ? '#000000' : 'rgba(255,255,255,0.2)'}`,
            boxShadow: 'none',
            backgroundImage: 'none',
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#121212',
            color: mode === 'light' ? '#000000' : '#ffffff',
            borderBottom: `3px solid ${mode === 'light' ? '#000000' : 'rgba(255,255,255,0.2)'}`,
            boxShadow: 'none',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderWidth: '2px',
                borderColor:
                  mode === 'light'
                    ? 'rgba(0, 0, 0, 0.2)'
                    : 'rgba(255, 255, 255, 0.23)',
              },
              '&:hover fieldset': {
                borderColor:
                  mode === 'light'
                    ? 'rgba(0, 0, 0, 0.5)'
                    : 'rgba(255, 255, 255, 0.5)',
              },
            },
          },
        },
      },
    },
  })
}

export const theme = getTheme('light') // Default export for backwards compatibility if needed
