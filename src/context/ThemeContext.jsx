import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { getTheme } from '../styles/theme'
import { getFilofaxTheme } from '../styles/filofaxTheme'
import { UI_STYLES } from '../styles/useUiStyle'

const ThemeContext = createContext()

// eslint-disable-next-line react-refresh/only-export-components
export const useThemeContext = () => {
  return useContext(ThemeContext)
}

// The tray widget is a 380×86 single-row window; it always keeps the ledger
// style whatever the main window is set to.
const isWidgetWindow = () =>
  typeof window !== 'undefined' && window.location.hash.startsWith('#/widget')

export const ThemeContextProvider = ({ children }) => {
  // Initialize state from local storage or default to 'light'
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('workTracker_themeMode') || 'light'
  })

  // Visual style: the default ledger, or the Filofax organiser
  const [uiStyle, setUiStyle] = useState(() => {
    const stored = localStorage.getItem('workTracker_uiStyle')
    return UI_STYLES.includes(stored) ? stored : 'ledger'
  })

  // Update local storage when mode changes
  useEffect(() => {
    localStorage.setItem('workTracker_themeMode', mode)
  }, [mode])

  useEffect(() => {
    localStorage.setItem('workTracker_uiStyle', uiStyle)
  }, [uiStyle])

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
  }

  const effectiveStyle = isWidgetWindow() ? 'ledger' : uiStyle

  // Generate the theme based on the current mode and style
  const theme = useMemo(
    () =>
      effectiveStyle === 'filofax' ? getFilofaxTheme(mode) : getTheme(mode),
    [mode, effectiveStyle]
  )

  const value = {
    mode,
    toggleTheme,
    uiStyle: effectiveStyle,
    setUiStyle,
  }

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
