import { createContext, useContext, useState, useEffect } from 'react'

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

  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Watch for external file changes
  useEffect(() => {
    if (selectedDirectory) {
      window.electronAPI.watchWorkspace(selectedDirectory)
      window.electronAPI.onWorkspaceChanged((data) => {
        console.log('Workspace changed externally:', data)
        setRefreshTrigger((prev) => prev + 1)
      })
    }
  }, [selectedDirectory])

  // Helper to update state and persist
  const setProjectDirectory = (path) => {
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

  const value = {
    selectedDirectory,
    setProjectDirectory,
    refreshTrigger,
    notification,
    showNotification,
    hideNotification,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
