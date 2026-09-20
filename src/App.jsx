import React, { useEffect } from 'react'
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAppContext } from './context/AppContext'
import { useThemeContext } from './context/ThemeContext'
import WelcomeScreen from './components/Onboarding/WelcomeScreen'
import StreamSetup from './components/Onboarding/StreamSetup'
import MainLayout from './components/Layout/MainLayout'
import DailyEditor from './components/DailyEditor/DailyEditor'
import ActivitiesBoard from './components/ActivitiesBoard/ActivitiesBoard'
import ActivityDetailsPage from './components/ActivitiesBoard/ActivityDetailsPage'
import NotesBoard from './components/Notes/NotesBoard'
import GoalsPage from './components/Goals/GoalsPage'
import Dashboard from './components/Dashboard/Dashboard'
import Reports from './components/Reports/Reports'
import Settings from './components/Settings/Settings'
import Documentation from './components/Documentation/Documentation'
import TrayWidget from './components/Widget/TrayWidget'
import WorkspaceExplorer from './components/Workspace/WorkspaceExplorer'
import UpdateSnackbar from './components/Updates/UpdateSnackbar'
import FilofaxApp from './filofax/FilofaxApp'
import './App.css'

function App() {
  const {
    selectedDirectory,
    workspaceReady,
    streamConfigLoading,
    needsStreamSetup,
  } = useAppContext()
  const { uiStyle } = useThemeContext()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (window.electronAPI && window.electronAPI.onStartFlowGlobal) {
      window.electronAPI.onStartFlowGlobal(() => {
        navigate('/editor', { state: { autoStartFlow: true } })
      })
      return () => {
        if (window.electronAPI.removeStartFlowGlobalListeners) {
          window.electronAPI.removeStartFlowGlobalListeners()
        }
      }
    }
  }, [navigate])

  useEffect(() => {
    if (window.electronAPI?.onNavigateGlobal) {
      window.electronAPI.onNavigateGlobal((route) => navigate(route))
      return () => window.electronAPI.removeNavigateGlobalListeners?.()
    }
  }, [navigate])

  if (location.pathname === '/widget') {
    return <TrayWidget />
  }

  let content
  if (!selectedDirectory) {
    content = <WelcomeScreen />
  } else if (!workspaceReady || streamConfigLoading) {
    content = (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    )
  } else if (needsStreamSetup) {
    content = <StreamSetup />
  } else if (uiStyle === 'filofax') {
    content = <FilofaxApp />
  } else {
    content = (
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/editor" element={<DailyEditor />} />
          <Route path="/todos" element={<ActivitiesBoard />} />
          <Route
            path="/todos/:itemType/:itemId"
            element={<ActivityDetailsPage />}
          />
          <Route path="/notes" element={<NotesBoard />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/goals/:goalId" element={<GoalsPage />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/docs" element={<Documentation />} />
          <Route path="/workspace" element={<WorkspaceExplorer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    )
  }

  return (
    <>
      {content}
      <UpdateSnackbar />
    </>
  )
}

export default App
