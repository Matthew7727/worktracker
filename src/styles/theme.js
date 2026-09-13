import { createTheme } from '@mui/material/styles'
import '@fontsource/archivo/400.css'
import '@fontsource/archivo/500.css'
import '@fontsource/archivo/600.css'
import '@fontsource/archivo/700.css'
import '@fontsource/archivo/800.css'
import '@fontsource/archivo/900.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/700.css'
import { FONT, RADIUS, RULE, OFFSET, hardShadow } from './tokens'

// Ink and canvas. Light mode is paper-white with true black rules; dark mode is
// a black plane with white rules. Panels step away from the canvas by one
// value, never by a shadow.
const SURFACE = {
  light: {
    ink: '#000000',
    inkMuted: '#3d3d3d',
    canvas: '#ffffff',
    panel: '#ffffff',
    recess: '#f1f1ef',
    rule: '#000000',
    accent: '#80b621',
  },
  dark: {
    ink: '#ffffff',
    inkMuted: '#a8a8a8',
    canvas: '#000000',
    panel: '#111111',
    recess: '#1c1c1c',
    rule: '#ffffff',
    accent: '#aedd4d',
  },
}

// One family carries the whole interface; figures switch to the mono so columns
// of hours and counts line up like a timesheet.
const typography = {
  fontFamily: FONT.ui,
  h1: {
    fontWeight: 800,
    fontSize: '4.5rem',
    lineHeight: 0.92,
    letterSpacing: '-0.04em',
  },
  h2: {
    fontWeight: 800,
    fontSize: '3.25rem',
    lineHeight: 0.95,
    letterSpacing: '-0.035em',
  },
  h3: {
    fontWeight: 800,
    fontSize: '2.4rem',
    lineHeight: 1.02,
    letterSpacing: '-0.03em',
  },
  h4: {
    fontWeight: 800,
    fontSize: '1.85rem',
    lineHeight: 1.08,
    letterSpacing: '-0.025em',
  },
  h5: {
    fontWeight: 800,
    fontSize: '1.35rem',
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
  },
  h6: {
    fontWeight: 800,
    fontSize: '1.05rem',
    lineHeight: 1.2,
    letterSpacing: '-0.015em',
  },
  subtitle1: { fontWeight: 700, letterSpacing: '-0.01em' },
  subtitle2: { fontWeight: 700, letterSpacing: '-0.01em' },
  body1: { fontWeight: 400, lineHeight: 1.55 },
  body2: { fontWeight: 500, lineHeight: 1.5 },
  caption: { fontWeight: 600, letterSpacing: '0.01em' },
  button: {
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
}

export const getTheme = (mode) => {
  const s = SURFACE[mode] ?? SURFACE.light
  const square = { borderRadius: RADIUS }

  return createTheme({
    typography,
    shape: { borderRadius: RADIUS },
    palette: {
      mode,
      primary: {
        main: s.accent,
        contrastText: '#000000',
      },
      secondary: { main: '#ffd166', contrastText: '#000000' },
      // Signal colours are picked to stay legible as text on their own canvas.
      error: { main: mode === 'light' ? '#c4241a' : '#ff8478' },
      success: { main: mode === 'light' ? '#4f7d00' : '#aedd4d' },
      warning: { main: mode === 'light' ? '#a35c00' : '#ffbb45' },
      text: { primary: s.ink, secondary: s.inkMuted },
      background: {
        default: s.canvas,
        paper: s.panel,
        subtle: s.recess,
      },
      divider: s.rule,
      action: {
        active: s.ink,
        hover: mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.10)',
        selected:
          mode === 'light' ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.16)',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.2s linear, color 0.2s linear',
          },
          '::selection': {
            backgroundColor: s.accent,
            color: '#000000',
          },
          // Keyboard focus is a hard bracket around the control, matching the
          // rule weight used everywhere else.
          ':focus-visible': {
            outline: `${RULE.base}px solid ${s.accent}`,
            outlineOffset: 2,
          },
          '@media (prefers-reduced-motion: reduce)': {
            '*': {
              animationDuration: '0.01ms !important',
              transitionDuration: '0.01ms !important',
            },
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            ...square,
            border: `${RULE.base}px solid ${s.rule}`,
            boxShadow: 'none',
            backgroundImage: 'none',
            backgroundColor: s.panel,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            ...square,
            backgroundColor: s.canvas,
            color: s.ink,
            border: 'none',
            borderBottom: `${RULE.base}px solid ${s.rule}`,
            boxShadow: 'none',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true, disableRipple: true },
        styleOverrides: {
          root: {
            ...square,
            padding: '10px 22px',
            borderWidth: RULE.base,
            transition: 'transform 0.12s linear, box-shadow 0.12s linear',
            '&:hover': { borderWidth: RULE.base },
          },
          contained: {
            border: `${RULE.base}px solid ${s.rule}`,
            boxShadow: hardShadow(OFFSET.base, s.rule),
            '&:hover': {
              boxShadow: hardShadow(OFFSET.lift, s.rule),
              transform: `translate(-${OFFSET.press}px, -${OFFSET.press}px)`,
            },
            '&:active': {
              boxShadow: 'none',
              transform: `translate(${OFFSET.base}px, ${OFFSET.base}px)`,
            },
          },
          containedPrimary: {
            backgroundColor: s.accent,
            color: '#000000',
            '&:hover': { backgroundColor: s.accent },
          },
          outlined: {
            border: `${RULE.base}px solid ${s.rule}`,
            color: s.ink,
            '&:hover': {
              backgroundColor: s.ink,
              color: s.canvas,
              borderColor: s.rule,
            },
          },
          text: {
            color: s.ink,
            '&:hover': { backgroundColor: s.ink, color: s.canvas },
          },
          textPrimary: { color: s.ink },
          outlinedPrimary: { color: s.ink, borderColor: s.rule },
        },
      },
      MuiIconButton: {
        defaultProps: { disableRipple: true },
        styleOverrides: { root: square },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            ...square,
            border: `${RULE.base}px solid ${s.rule}`,
            boxShadow: hardShadow(OFFSET.base, s.rule),
            '&:hover': { boxShadow: hardShadow(OFFSET.lift, s.rule) },
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            ...square,
            fontWeight: 700,
            borderWidth: RULE.hair,
            borderColor: s.rule,
          },
        },
      },
      MuiToggleButtonGroup: {
        styleOverrides: { root: square, grouped: square },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            ...square,
            fontWeight: 700,
            height: 26,
            border: `${RULE.hair}px solid currentColor`,
          },
          label: { paddingLeft: 8, paddingRight: 8 },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: { ...square, fontWeight: 800, fontFamily: FONT.ui },
        },
      },
      MuiCard: { styleOverrides: { root: square } },
      MuiDialog: {
        styleOverrides: {
          paper: {
            ...square,
            border: `${RULE.heavy}px solid ${s.rule}`,
            boxShadow: hardShadow(OFFSET.hero, s.rule),
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: { ...square, boxShadow: hardShadow(OFFSET.base, s.rule) },
        },
      },
      MuiMenuItem: { styleOverrides: { root: { ...square, fontWeight: 600 } } },
      MuiPopover: { styleOverrides: { paper: square } },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            ...square,
            backgroundColor: s.ink,
            color: s.canvas,
            fontWeight: 700,
            fontSize: '0.75rem',
            padding: '6px 10px',
          },
          arrow: { color: s.ink },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            ...square,
            fontWeight: 700,
            border: `${RULE.base}px solid ${s.rule}`,
          },
        },
      },
      MuiSnackbarContent: { styleOverrides: { root: square } },
      MuiSkeleton: { styleOverrides: { root: square } },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            ...square,
            height: 10,
            border: `${RULE.hair}px solid ${s.rule}`,
            backgroundColor: 'transparent',
          },
          bar: square,
        },
      },
      MuiCheckbox: {
        defaultProps: { disableRipple: true },
        styleOverrides: { root: square },
      },
      MuiRadio: { defaultProps: { disableRipple: true } },
      MuiSwitch: {
        styleOverrides: {
          root: { padding: 8 },
          track: {
            ...square,
            border: `${RULE.hair}px solid ${s.rule}`,
            backgroundColor: 'transparent',
            opacity: 1,
          },
          thumb: { ...square, width: 14, height: 14, boxShadow: 'none' },
          switchBase: { ...square, padding: 13 },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            ...square,
            '& fieldset': {
              borderWidth: RULE.hair,
              borderColor: s.rule,
            },
            '&:hover fieldset': { borderColor: s.accent },
            '&.Mui-focused fieldset': {
              borderWidth: RULE.base,
              borderColor: s.accent,
            },
          },
          input: { fontWeight: 500 },
        },
      },
      MuiFilledInput: {
        styleOverrides: {
          root: {
            ...square,
            backgroundColor: s.recess,
            '&:hover': { backgroundColor: s.recess },
            '&.Mui-focused': { backgroundColor: s.recess },
            '&::before': { borderBottom: 'none !important' },
            '&::after': { borderBottom: 'none !important' },
            '&:hover:not(.Mui-disabled)::before': {
              borderBottom: 'none !important',
            },
          },
        },
      },
      MuiInputBase: { styleOverrides: { root: square } },
      MuiSelect: { styleOverrides: { select: square } },
      MuiTab: {
        styleOverrides: {
          root: { ...square, fontWeight: 800, textTransform: 'none' },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: { height: RULE.heavy, backgroundColor: s.accent },
        },
      },
      MuiAccordion: { styleOverrides: { root: square } },
      MuiDivider: { styleOverrides: { root: { borderColor: s.rule } } },
      MuiListItemButton: { styleOverrides: { root: square } },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            backgroundColor:
              mode === 'light' ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.75)',
          },
        },
      },
    },
  })
}

export const theme = getTheme('light') // Default export for backwards compatibility if needed
