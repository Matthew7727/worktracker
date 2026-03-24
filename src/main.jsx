import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { Buffer } from 'buffer'

if (typeof window !== 'undefined') {
  window.Buffer = Buffer
}
import { ThemeContextProvider } from './context/ThemeContext'
import CssBaseline from '@mui/material/CssBaseline'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
// import { theme } from './theme'; // Theme is now handled in ThemeContext
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { setupElectronMock } from './mocks/electronMock'

// Setup mock for browser development
setupElectronMock()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <ThemeContextProvider>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <HashRouter>
            <App />
          </HashRouter>
        </LocalizationProvider>
      </ThemeContextProvider>
    </AppProvider>
  </StrictMode>
)
