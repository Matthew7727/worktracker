import { createTheme } from '@mui/material/styles'
import '@fontsource/libre-baskerville/400.css'
import '@fontsource/libre-baskerville/400-italic.css'
import '@fontsource/libre-baskerville/600.css'
import '@fontsource/libre-baskerville/700.css'

export const SERIF = '"Libre Baskerville", "Baskerville", Georgia, serif'

// ── Filofax tokens ─────────────────────────────────────────────────────────
// An oxblood executive organiser. The leather, gilt rings and card dividers
// are the one loud thing; inside, every page is quiet printed stationery —
// furniture printed in oxblood, your own writing in blue-black ink.
const TOKENS = {
  light: {
    leather: '#4b1519',
    leatherHi: '#6c2229',
    leatherLo: '#2a0a0d',
    stitch: 'rgba(222, 186, 120, 0.55)',
    gold: '#b8924f',
    goldHi: '#ecd49a',
    goldLo: '#7a5a26',
    page: '#f7f0dd',
    pageShade: '#ece2c8',
    slip: '#fbf7ea',
    rule: '#e1d3b3',
    ruleStrong: '#c7b089',
    margin: '#d49a92',
    print: '#7b2c31',
    ink: '#1e2438',
    inkSoft: '#6b5f52',
    hole: '#2a0a0d',
    tabInk: '#2a1c14',
    // Card-stock divider tabs, muted like a real refill set
    tabs: {
      diary: '#d3b25f',
      todo: '#93a877',
      notes: '#c98984',
      planner: '#8aa3b8',
      contacts: '#ab96b6',
      index: '#c9ad8c',
      info: '#a8a597',
    },
  },
  dark: {
    leather: '#240a0c',
    leatherHi: '#3b1116',
    leatherLo: '#120405',
    stitch: 'rgba(196, 160, 96, 0.4)',
    gold: '#a8844a',
    goldHi: '#d8bb7d',
    goldLo: '#5d4420',
    page: '#1f1a18',
    pageShade: '#181412',
    slip: '#27201d',
    rule: '#352c27',
    ruleStrong: '#4d4038',
    margin: '#6e3a38',
    print: '#d99c90',
    ink: '#ede3cc',
    inkSoft: '#a99b86',
    hole: '#0b0304',
    tabInk: '#f3e9d2',
    tabs: {
      diary: '#8f7836',
      todo: '#5f7049',
      notes: '#8a5552',
      planner: '#56697a',
      contacts: '#6f5f79',
      index: '#86705a',
      info: '#6c6a60',
    },
  },
}

export const getFilofaxTheme = (mode) => {
  const ff = TOKENS[mode === 'dark' ? 'dark' : 'light']
  const hover =
    mode === 'dark' ? 'rgba(217, 156, 144, 0.08)' : 'rgba(123, 44, 49, 0.055)'

  return createTheme({
    custom: { style: 'filofax' },
    palette: {
      mode,
      filofax: ff,
      primary: { main: ff.print },
      secondary: { main: ff.gold },
      error: { main: mode === 'dark' ? '#e0786b' : '#a3322a' },
      warning: { main: mode === 'dark' ? '#d9a54a' : '#a86b12' },
      success: { main: mode === 'dark' ? '#9fb97d' : '#4f6b33' },
      text: {
        primary: ff.ink,
        secondary: ff.inkSoft,
        disabled:
          mode === 'dark' ? 'rgba(237,227,204,0.38)' : 'rgba(30,36,56,0.38)',
      },
      background: {
        default: ff.page,
        paper: ff.slip,
        subtle: ff.pageShade,
        desk: ff.leather,
      },
      divider: ff.rule,
      action: {
        hover,
        selected: hover,
        active: ff.inkSoft,
      },
    },
    shape: { borderRadius: 3 },
    typography: {
      fontFamily: SERIF,
      fontSize: 13,
      h1: { fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.1 },
      h2: { fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.15 },
      h3: { fontWeight: 400, letterSpacing: '-0.005em', lineHeight: 1.2 },
      h4: { fontWeight: 400, lineHeight: 1.25 },
      h5: { fontWeight: 400 },
      h6: { fontWeight: 700 },
      subtitle1: { fontWeight: 700 },
      subtitle2: { fontWeight: 700 },
      body1: { fontWeight: 400, lineHeight: 1.7 },
      body2: { fontWeight: 400, lineHeight: 1.6 },
      overline: { fontStyle: 'italic', textTransform: 'none' },
      button: { fontWeight: 400, textTransform: 'none', letterSpacing: 0 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: ff.leather,
            fontWeight: 400,
            fontFamily: SERIF,
          },
          '::selection': {
            backgroundColor:
              mode === 'dark'
                ? 'rgba(216, 187, 125, 0.3)'
                : 'rgba(184, 146, 79, 0.3)',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            fontFamily: SERIF,
            borderRadius: 3,
            padding: '6px 16px',
            textTransform: 'none',
          },
          contained: {
            backgroundColor: ff.print,
            color: ff.page,
            '&:hover': { backgroundColor: ff.print, opacity: 0.9 },
          },
          outlined: {
            borderColor: ff.ruleStrong,
            color: ff.ink,
            '&:hover': { borderColor: ff.print, backgroundColor: hover },
          },
          text: { color: ff.ink, '&:hover': { backgroundColor: hover } },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: { borderRadius: 3, '&:hover': { backgroundColor: hover } },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: ff.slip,
            boxShadow: 'none',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: ff.page,
            border: `1px solid ${ff.ruleStrong}`,
            borderRadius: 10,
            boxShadow:
              mode === 'dark'
                ? '0 24px 60px rgba(0,0,0,0.6)'
                : '0 24px 60px rgba(42,10,13,0.35)',
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontFamily: SERIF,
            fontWeight: 400,
            fontSize: '1.45rem',
            color: ff.print,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: ff.slip,
            border: `1px solid ${ff.ruleStrong}`,
            borderRadius: 4,
            boxShadow:
              mode === 'dark'
                ? '0 10px 30px rgba(0,0,0,0.5)'
                : '0 10px 30px rgba(42,10,13,0.2)',
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            backgroundColor: ff.slip,
            border: `1px solid ${ff.ruleStrong}`,
            borderRadius: 4,
          },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          paper: {
            backgroundColor: ff.slip,
            border: `1px solid ${ff.ruleStrong}`,
          },
          groupLabel: {
            fontFamily: SERIF,
            fontStyle: 'italic',
            color: ff.print,
            backgroundColor: ff.slip,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: { fontFamily: SERIF, fontWeight: 400 },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: '0.75rem',
            backgroundColor: ff.ink,
            color: ff.page,
            borderRadius: 3,
          },
          arrow: { color: ff.ink },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: ff.ruleStrong,
            '&.Mui-checked': { color: ff.print },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            color: ff.slip,
            '&.Mui-checked': { color: ff.slip },
            '&.Mui-checked + .MuiSwitch-track': {
              backgroundColor: ff.print,
              opacity: 1,
            },
          },
          track: { backgroundColor: ff.ruleStrong, opacity: 1 },
          thumb: { boxShadow: '0 1px 2px rgba(0,0,0,0.3)' },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontFamily: SERIF,
            fontWeight: 400,
            borderRadius: 3,
            border: `1px solid ${ff.ruleStrong}`,
            backgroundColor: 'transparent',
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            fontFamily: SERIF,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: ff.rule },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: ff.ruleStrong,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: ff.print,
              borderWidth: 1,
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: { root: { fontFamily: SERIF } },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: { fontFamily: SERIF, fontStyle: 'italic' },
        },
      },
      MuiFilledInput: {
        styleOverrides: {
          root: {
            '&::before': { borderBottom: 'none !important' },
            '&::after': { borderBottom: 'none !important' },
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            fontFamily: SERIF,
            textTransform: 'none',
            fontWeight: 400,
            borderColor: ff.rule,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { fontFamily: SERIF, borderColor: ff.rule },
          head: {
            fontStyle: 'italic',
            color: ff.print,
            fontWeight: 400,
            borderBottom: `1px solid ${ff.ruleStrong}`,
          },
        },
      },
      MuiDivider: {
        styleOverrides: { root: { borderColor: ff.rule } },
      },
      MuiAlert: {
        styleOverrides: {
          root: { fontFamily: SERIF, borderRadius: 4 },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: {
            backgroundColor:
              mode === 'dark'
                ? 'rgba(237,227,204,0.07)'
                : 'rgba(30,36,56,0.06)',
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { backgroundColor: ff.rule, borderRadius: 2 },
          bar: { backgroundColor: ff.print },
        },
      },
      MuiCircularProgress: {
        styleOverrides: { root: { color: ff.print } },
      },
    },
  })
}
