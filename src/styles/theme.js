import { createTheme } from '@mui/material/styles'
import '@fontsource/outfit/400.css'
import '@fontsource/outfit/600.css'
import '@fontsource/outfit/700.css'
import '@fontsource/outfit/900.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/700.css'

// ── Hard-edge shadow system ────────────────────────────────────────────────
// No blur, ever. A flat offset block reads as a physical layer stacked on
// the page — the one consistent "elevation" device across the whole app.
export const hardShadow = (color, n = 4) => `${n}px ${n}px 0 ${color}`

const INK_LIGHT = '#000000'
const INK_DARK = 'rgba(255, 255, 255, 0.9)'

// Base options independent of mode
const baseOptions = {
  typography: {
    fontFamily: '"Outfit", "Inter", sans-serif',
    h1: { fontWeight: 900, letterSpacing: '-0.045em', lineHeight: 1.02 },
    h2: { fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05 },
    h3: { fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 },
    h4: { fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.15 },
    h5: { fontWeight: 900, letterSpacing: '-0.01em' },
    h6: { fontWeight: 800, letterSpacing: '-0.005em' },
    subtitle1: { fontWeight: 700 },
    subtitle2: { fontWeight: 700 },
    body1: { fontWeight: 500 },
    body2: { fontWeight: 600 },
    overline: {
      fontFamily: '"JetBrains Mono", monospace',
      fontWeight: 700,
      letterSpacing: '0.08em',
    },
    button: {
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    },
  },
  shape: {
    // Sharp, full stop. Every corner in the app is square — the one rule
    // with no exceptions, so it reads as a decision rather than a default.
    borderRadius: 0,
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
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderWidth: '3px',
          padding: '10px 24px',
          transition: 'transform 0.12s ease, box-shadow 0.12s ease',
          '&:hover': {
            borderWidth: '3px',
          },
        },
        sizeSmall: {
          padding: '6px 16px',
        },
        sizeLarge: {
          padding: '14px 32px',
          fontSize: '1rem',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 800,
          border: '2px solid currentColor',
          borderRadius: 0,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontFamily: '"JetBrains Mono", monospace',
          fontWeight: 700,
          fontSize: '0.7rem',
          letterSpacing: '0.02em',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: { padding: 8 },
        switchBase: {
          padding: 10,
          color: '#8a8a82',
          '&.Mui-checked': { transform: 'translateX(20px)' },
        },
        thumb: { borderRadius: 0, width: 14, height: 14, boxShadow: 'none' },
        track: {
          borderRadius: 0,
          border: '2px solid currentColor',
          opacity: '1 !important',
          backgroundColor: 'transparent !important',
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
  const ink = mode === 'light' ? INK_LIGHT : INK_DARK
  return createTheme({
    ...baseOptions,
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // Light Mode — ledger paper, ink-black rule, signal green
            primary: { main: '#80b621' },
            secondary: { main: '#ffd166' },
            text: { primary: '#000000', secondary: '#4a4a44' },
            background: {
              default: '#f7f6f0',
              paper: '#ffffff',
              subtle: '#efeee5',
              desk: '#d6d2c2',
            },
            divider: 'rgba(0, 0, 0, 0.14)',
            action: { active: 'rgba(0, 0, 0, 0.54)' },
          }
        : {
            // Dark Mode
            primary: { main: '#aedd4d' },
            secondary: { main: '#80b621' },
            text: { primary: '#ffffff', secondary: 'rgba(255, 255, 255, 0.7)' },
            background: {
              default: '#121212',
              paper: '#1a1a1a',
              subtle: '#222222',
              desk: '#050505',
            },
            divider: 'rgba(255, 255, 255, 0.14)',
            action: { active: 'rgba(255, 255, 255, 0.7)' },
          }),
    },
    components: {
      ...baseOptions.components,
      MuiButton: {
        ...baseOptions.components.MuiButton,
        styleOverrides: {
          ...baseOptions.components.MuiButton.styleOverrides,
          root: {
            ...baseOptions.components.MuiButton.styleOverrides.root,
          },
          contained: {
            boxShadow: hardShadow(ink),
            '&:hover': {
              transform: 'translate(-2px, -2px)',
              boxShadow: hardShadow(ink, 6),
            },
            '&:active': {
              transform: 'translate(0, 0)',
              boxShadow: 'none',
            },
          },
          containedPrimary: {
            color: mode === 'light' ? '#ffffff' : '#000000',
            border: `3px solid ${ink}`,
            '&:hover': { opacity: 1 },
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
              transform: 'translate(-2px, -2px)',
              boxShadow: hardShadow(ink),
            },
            '&:active': { transform: 'translate(0, 0)', boxShadow: 'none' },
          },
          text: {
            '&:hover': { background: 'transparent', opacity: 0.7 },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 0,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            border: `3px solid ${mode === 'light' ? '#000000' : 'rgba(255,255,255,0.2)'}`,
            boxShadow: 'none',
            backgroundImage: 'none',
            backgroundColor: mode === 'light' ? '#ffffff' : '#1a1a1a',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#f7f6f0' : '#121212',
            color: mode === 'light' ? '#000000' : '#ffffff',
            borderBottom: `3px solid ${mode === 'light' ? '#000000' : 'rgba(255,255,255,0.2)'}`,
            boxShadow: 'none',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            border: `4px solid ${ink}`,
            boxShadow: hardShadow(ink, 10),
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            border: `2.5px solid ${ink}`,
            boxShadow: hardShadow(ink, 6),
            marginTop: '4px',
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            border: `2.5px solid ${ink}`,
            boxShadow: hardShadow(ink, 6),
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
                    ? 'rgba(0, 0, 0, 0.25)'
                    : 'rgba(255, 255, 255, 0.25)',
              },
              '&:hover fieldset': {
                borderColor:
                  mode === 'light'
                    ? 'rgba(0, 0, 0, 0.6)'
                    : 'rgba(255, 255, 255, 0.5)',
              },
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor:
              mode === 'light' ? 'rgba(0,0,0,0.14)' : 'rgba(255,255,255,0.14)',
          },
        },
      },
    },
  })
}

export const theme = getTheme('light') // Default export for backwards compatibility if needed
