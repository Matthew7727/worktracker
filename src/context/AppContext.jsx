import { createContext, useContext, useState, useEffect } from 'react'
import {
  loadStreamConfig,
  saveStreamConfig,
  getActiveStreams,
  getMainFocusStream,
} from '../utils/streamConfig'

const AppContext = createContext()

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => {
  return useContext(AppContext)
}

export const AppProvider = ({ children }) => {
  // Initialize state from local storage explicitly
  const [selectedDirectory, setSelectedDirectory] = useState(() => {
    return localStorage.getItem('workTracker_projectDir') || null
  })
  const [workspaceReady, setWorkspaceReady] = useState(!selectedDirectory)

  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Workspace stream configuration
  const [streamConfig, setStreamConfig] = useState(null)
  const [streamConfigLoading, setStreamConfigLoading] = useState(false)
  const [needsStreamSetup, setNeedsStreamSetup] = useState(false)

  // Main-process filesystem access is limited to this user-selected root.
  // Establish that approval before any workspace consumer begins reading.
  useEffect(() => {
    let cancelled = false
    const authorise = async () => {
      if (!selectedDirectory || !window.electronAPI?.loadSettings) {
        if (!cancelled) setWorkspaceReady(true)
        return
      }
      setWorkspaceReady(false)
      try {
        const settings = await window.electronAPI.loadSettings()
        const result = await window.electronAPI.saveSettings({
          ...settings,
          selectedDirectory,
        })
        if (!cancelled) setWorkspaceReady(!!result?.success)
      } catch {
        if (!cancelled) setWorkspaceReady(false)
      }
    }
    authorise()
    return () => {
      cancelled = true
    }
  }, [selectedDirectory])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!selectedDirectory) {
        setStreamConfig(null)
        setNeedsStreamSetup(false)
        return
      }
      if (!workspaceReady) return
      setStreamConfigLoading(true)
      try {
        const config = await loadStreamConfig(selectedDirectory)
        if (cancelled) return
        setStreamConfig(config)
        setNeedsStreamSetup(!config)
      } catch (e) {
        console.error('Failed to load stream config:', e)
      } finally {
        if (!cancelled) setStreamConfigLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [selectedDirectory, workspaceReady])

  // Persists a new/updated stream config and updates app state
  const updateStreamConfig = async (config) => {
    setStreamConfig(config)
    setNeedsStreamSetup(false)
    if (selectedDirectory) {
      await saveStreamConfig(selectedDirectory, config)
    }
  }

  const rerunStreamSetup = () => {
    setNeedsStreamSetup(true)
  }

  // Watch for external file changes
  useEffect(() => {
    if (selectedDirectory && workspaceReady && window.electronAPI) {
      window.electronAPI.watchWorkspace(selectedDirectory)
      window.electronAPI.onWorkspaceChanged((data) => {
        console.log('Workspace changed externally:', data)
        setRefreshTrigger((prev) => prev + 1)
      })
      return () => window.electronAPI.removeWorkspaceChangedListeners?.()
    }
  }, [selectedDirectory, workspaceReady])

  // Helper to update state and persist
  const setProjectDirectory = (path) => {
    setWorkspaceReady(!path)
    setSelectedDirectory(path)
    if (path) {
      localStorage.setItem('workTracker_projectDir', path)
    } else {
      localStorage.removeItem('workTracker_projectDir')
    }
  }

  // Global Notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info',
  })

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity })
  }

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }))
  }

  const streams = getActiveStreams(streamConfig)
  const mainFocusStream = getMainFocusStream(streamConfig)

  const value = {
    selectedDirectory,
    workspaceReady,
    setProjectDirectory,
    refreshTrigger,
    notification,
    showNotification,
    hideNotification,
    streamConfig,
    streams,
    mainFocusStream,
    streamConfigLoading,
    needsStreamSetup,
    updateStreamConfig,
    rerunStreamSetup,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
