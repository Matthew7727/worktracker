import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom';
import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getTheme } from './theme';
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'

const ThemedApp = () => {
  const { theme: themeMode } = useAppContext();
  const activeTheme = React.useMemo(() => getTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <HashRouter>
          <App />
        </HashRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <ThemedApp />
    </AppProvider>
  </StrictMode>,
)
