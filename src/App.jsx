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
import WelcomeScreen from './components/Onboarding/WelcomeScreen'
import StreamSetup from './components/Onboarding/StreamSetup'
import MainLayout from './components/Layout/MainLayout'
import DailyEditor from './components/DailyEditor/DailyEditor'
import ActivitiesBoard from './components/ActivitiesBoard/ActivitiesBoard'
import TodoBoard from './components/TodoBoard/TodoBoard'
import Dashboard from './components/Dashboard/Dashboard'
import Reports from './components/Reports/Reports'
import Settings from './components/Settings/Settings'
import Documentation from './components/Documentation/Documentation'
import TrayWidget from './components/Widget/TrayWidget'
import WorkspaceExplorer from './components/Workspace/WorkspaceExplorer'
import './App.css'

function App() {
  const { selectedDirectory, streamConfigLoading, needsStreamSetup } =
    useAppContext()
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

  if (location.pathname === '/widget') {
    return <TrayWidget />
  }

  if (!selectedDirectory) {
    return <WelcomeScreen />
  }

  if (streamConfigLoading) {
    return (
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
  }

  if (needsStreamSetup) {
    return <StreamSetup />
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/editor" element={<DailyEditor />} />
        <Route path="/todos" element={<ActivitiesBoard />} />
        <Route path="/tasks" element={<TodoBoard />} />
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

export default App
