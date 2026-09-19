import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../../context/AppContext'
import { useUpdate } from '../../../context/UpdateContext'

/**
 * Settings state and actions (reminders, utilisation, updates, workspace).
 * Shared by the ledger Settings page and the Filofax Info section.
 */
const useSettingsState = () => {
  const navigate = useNavigate()
  const {
    selectedDirectory,
    setProjectDirectory,
    showNotification,
    streamConfig,
    rerunStreamSetup,
  } = useAppContext()

  const utilisationEnabled = !!streamConfig?.features?.utilisation

  // Notification State
  const [notifEnabled, setNotifEnabled] = useState(false)
  const [notifTime, setNotifTime] = useState('17:00')
  const [isSaving, setIsSaving] = useState(false)

  // Utilisation Target
  const [utilisationTarget, setUtilisationTarget] = useState(70)
  const [standardWeeklyHours, setStandardWeeklyHours] = useState(37.5)
  const [isUtilSaving, setIsUtilSaving] = useState(false)

  // Auto Update (state lives in UpdateContext; this page is just a view)
  const [appVersion, setAppVersion] = useState('')
  const {
    status: updateStatus,
    info: updateInfo,
    progress: updateProgress,
    error: updateError,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    reset: resetUpdate,
  } = useUpdate()

  // Initialize version
  useEffect(() => {
    if (window.electronAPI && window.electronAPI.getVersion) {
      window.electronAPI
        .getVersion()
        .then(setAppVersion)
        .catch(() => {})
    }
  }, [])

  // Load initial settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (window.electronAPI) {
        const settings = await window.electronAPI.loadSettings()
        setNotifEnabled(settings.notificationsEnabled || false)
        setNotifTime(settings.notificationTime || '17:00')
        if (settings.utilisationTarget !== undefined) {
          setUtilisationTarget(settings.utilisationTarget)
        }
        if (settings.standardWeeklyHours !== undefined) {
          setStandardWeeklyHours(settings.standardWeeklyHours)
        }
      }
    }
    fetchSettings()
  }, [])

  const handleSaveUtilisation = async (targetValue, weeklyHoursValue) => {
    const parsedTarget = Math.min(
      100,
      Math.max(0, parseInt(targetValue, 10) || 0)
    )
    const parsedHours = Math.max(0, parseFloat(weeklyHoursValue) || 0)
    setIsUtilSaving(true)
    try {
      const current = window.electronAPI?.loadSettings
        ? await window.electronAPI.loadSettings()
        : {}
      const result = await window.electronAPI.saveSettings({
        ...current,
        utilisationTarget: parsedTarget,
        standardWeeklyHours: parsedHours,
      })
      if (result.success) {
        setUtilisationTarget(parsedTarget)
        setStandardWeeklyHours(parsedHours)
        showNotification('Utilisation target updated', 'success')
      }
    } catch {
      showNotification('Failed to save utilisation target', 'error')
    } finally {
      setIsUtilSaving(false)
    }
  }

  const handleSaveSettings = async (enabled, time) => {
    setIsSaving(true)
    try {
      const current = window.electronAPI?.loadSettings
        ? await window.electronAPI.loadSettings()
        : {}
      const result = await window.electronAPI.saveSettings({
        ...current,
        notificationsEnabled: enabled,
        notificationTime: time,
        selectedDirectory,
      })
      if (result.success) {
        showNotification('Settings updated successfully', 'success')
      }
    } catch (error) {
      console.log(error)
      showNotification('Failed to save settings', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleNotifs = (e) => {
    const val = e.target.checked
    setNotifEnabled(val)
    handleSaveSettings(val, notifTime)
  }

  const handleTimeChange = (e) => {
    const val = e.target.value
    setNotifTime(val)
    // We don't auto-save time to avoid too many writes, or we can use a debouncer
  }

  const isMock = !!window.electronAPI?.isMock
  const sections = [
    { id: 'appearance', label: 'Appearance' },
    { id: 'streams', label: 'Work streams' },
    { id: 'features', label: 'Features' },
    { id: 'reminders', label: 'Reminders' },
    utilisationEnabled && { id: 'utilisation', label: 'Utilisation' },
    { id: 'workspace', label: 'Workspace' },
    { id: 'updates', label: 'Updates' },
    isMock && { id: 'developer', label: 'Developer' },
  ].filter(Boolean)

  const versionLabel = appVersion ? `v${appVersion}` : 'Version unknown'
  const updateStateText = {
    idle: 'Check to see whether a newer version is out.',
    checking: 'Checking for a newer version…',
    'up-to-date': "You're on the latest version.",
    available: `Version ${updateInfo?.version} is ready to download.`,
    downloading: `Downloading ${Math.floor(updateProgress?.percent || 0)}%`,
    downloaded: 'The update is downloaded. Restart to install it.',
    error: `The update failed: ${updateError}`,
  }[updateStatus]

  return {
    navigate,
    selectedDirectory,
    setProjectDirectory,
    showNotification,
    rerunStreamSetup,
    utilisationEnabled,
    notifEnabled,
    notifTime,
    isSaving,
    utilisationTarget,
    setUtilisationTarget,
    standardWeeklyHours,
    setStandardWeeklyHours,
    isUtilSaving,
    appVersion,
    updateStatus,
    updateProgress,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    resetUpdate,
    handleSaveUtilisation,
    handleSaveSettings,
    handleToggleNotifs,
    handleTimeChange,
    isMock,
    sections,
    versionLabel,
    updateStateText,
  }
}

export default useSettingsState
