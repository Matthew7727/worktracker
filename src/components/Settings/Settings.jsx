import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Switch,
  Stack,
  Fade,
  TextField,
  Divider,
  LinearProgress,
} from '@mui/material'
import {
  NotificationsActive,
  Schedule,
  BugReport,
  SystemUpdateAlt,
  TrendingUp,
  Assessment,
} from '@mui/icons-material'
import { useAppContext } from '../../context/AppContext'
import StreamSettings from './StreamSettings'

const Settings = () => {
  const navigate = useNavigate()
  const {
    selectedDirectory,
    setProjectDirectory,
    showNotification,
    streamConfig,
    mainFocusStream,
    rerunStreamSetup,
  } = useAppContext()

  const utilisationEnabled = !!streamConfig?.features?.utilisation

  // Notification State
  const [notifEnabled, setNotifEnabled] = useState(false)
  const [notifTime, setNotifTime] = useState('17:00')
  const [isSaving, setIsSaving] = useState(false)

  // Utilisation Target
  const [utilisationTarget, setUtilisationTarget] = useState(70)
  const [isUtilSaving, setIsUtilSaving] = useState(false)

  // Auto Update State
  const [appVersion, setAppVersion] = useState('')
  const [updateStatus, setUpdateStatus] = useState('idle')
  const [updateProgress, setUpdateProgress] = useState(0)
  const [updateError, setUpdateError] = useState(null)

  // Initialize version
  useEffect(() => {
    if (window.electronAPI && window.electronAPI.getVersion) {
      window.electronAPI
        .getVersion()
        .then(setAppVersion)
        .catch(() => {})
    }
  }, [])

  // Setup Update Listeners
  useEffect(() => {
    if (!window.electronAPI || !window.electronAPI.onUpdateAvailable) return

    window.electronAPI.onUpdateChecking(() => setUpdateStatus('checking'))
    window.electronAPI.onUpdateAvailable(() => setUpdateStatus('available'))
    window.electronAPI.onUpdateNotAvailable(() => {
      setUpdateStatus('not-available')
      showNotification('You are on the latest version.', 'success')
      setTimeout(() => setUpdateStatus('idle'), 3000)
    })
    window.electronAPI.onUpdateProgress((percent) => {
      setUpdateStatus('downloading')
      setUpdateProgress(Math.floor(percent))
    })
    window.electronAPI.onUpdateDownloaded(() => setUpdateStatus('downloaded'))
    window.electronAPI.onUpdateError((err) => {
      setUpdateStatus('error')
      setUpdateError(err)
    })

    return () => {
      if (window.electronAPI.removeAllUpdateListeners) {
        window.electronAPI.removeAllUpdateListeners()
      }
    }
  }, [showNotification])

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
      }
    }
    fetchSettings()
  }, [])

  const handleSaveUtilisation = async (value) => {
    const parsed = Math.min(100, Math.max(0, parseInt(value, 10) || 0))
    setIsUtilSaving(true)
    try {
      const current = window.electronAPI?.loadSettings
        ? await window.electronAPI.loadSettings()
        : {}
      const result = await window.electronAPI.saveSettings({
        ...current,
        utilisationTarget: parsed,
      })
      if (result.success) {
        setUtilisationTarget(parsed)
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

  return (
    <Fade in={true} timeout={600}>
      <Box
        className="settings-page"
        sx={{
          maxWidth: '1000px',
          mx: 'auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          pb: 10,
        }}
      >
        <Typography variant="h1" sx={{ textAlign: 'center', fontWeight: 950 }}>
          Settings
        </Typography>

        <Grid container spacing={6} justifyContent="center">
          <Grid item xs={12} md={10}>
            <Stack spacing={4}>
              {/* Work Streams Section */}
              <StreamSettings />

              {/* Notifications Section */}
              <Paper
                sx={{
                  p: 6,
                  borderRadius: '40px',
                  border: '4px solid',
                  borderColor: 'text.primary',
                  boxShadow: (theme) =>
                    `10px 10px 0px ${theme.palette.text.primary}`,
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  sx={{ mb: 4 }}
                >
                  <NotificationsActive sx={{ fontSize: '2.5rem' }} />
                  <Typography variant="h3" sx={{ fontWeight: 950 }}>
                    Daily Reminders
                  </Typography>
                </Stack>

                <Typography
                  variant="body1"
                  sx={{ mb: 4, fontWeight: 700, opacity: 0.8 }}
                >
                  Stay consistent by scheduling a daily nudge to log your
                  achievements.
                </Typography>

                <Stack spacing={4}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 3,
                      bgcolor: 'action.hover',
                      borderRadius: '20px',
                      border: '3px solid',
                      borderColor: 'text.primary',
                    }}
                  >
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 900 }}>
                        Enable Notifications
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, opacity: 0.7 }}
                      >
                        Get a desktop alert at your preferred time.
                      </Typography>
                    </Box>
                    <Switch
                      checked={notifEnabled}
                      onChange={handleToggleNotifs}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: 'primary.main',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiLinearProgress-bar':
                          { bgcolor: 'primary.main' },
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 3,
                      bgcolor: 'action.hover',
                      borderRadius: '20px',
                      border: '3px solid',
                      borderColor: 'text.primary',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Schedule />
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>
                          Reminder Time
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, opacity: 0.7 }}
                        >
                          When should we nudge you?
                        </Typography>
                      </Box>
                    </Box>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <TextField
                        type="time"
                        value={notifTime}
                        onChange={handleTimeChange}
                        disabled={!notifEnabled}
                        sx={{
                          '& .MuiInputBase-root': {
                            fontWeight: 900,
                            fontSize: '1.2rem',
                            borderRadius: '12px',
                            border: '2px solid',
                            borderColor: 'text.primary',
                          },
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={() =>
                          handleSaveSettings(notifEnabled, notifTime)
                        }
                        disabled={!notifEnabled || isSaving}
                        sx={{
                          fontWeight: 900,
                          px: 3,
                          backgroundImage: 'none',
                          bgcolor: 'background.paper',
                          color: 'text.primary',
                          border: '2px solid',
                          borderColor: 'text.primary',
                          boxShadow: (theme) =>
                            `4px 4px 0px ${theme.palette.text.primary}`,
                          '&:hover': {
                            bgcolor: '#f0f0f0',
                            boxShadow: (theme) =>
                              `2px 2px 0px ${theme.palette.text.primary}`,
                            transform: 'translate(2px, 2px)',
                          },
                          '&.Mui-disabled': {
                            opacity: 0.5,
                            boxShadow: 'none',
                            transform: 'none',
                            border: '2px solid #999',
                            bgcolor: '#f0f0f0',
                          },
                        }}
                      >
                        UPDATE
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              </Paper>

              {/* Utilisation Target Section */}
              {utilisationEnabled && (
                <Paper
                  sx={{
                    p: 6,
                    borderRadius: '40px',
                    border: '4px solid',
                    borderColor: 'text.primary',
                    boxShadow: (theme) =>
                      `10px 10px 0px ${theme.palette.text.primary}`,
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{ mb: 4 }}
                  >
                    <TrendingUp sx={{ fontSize: '2.5rem' }} />
                    <Typography variant="h3" sx={{ fontWeight: 950 }}>
                      Utilisation Target
                    </Typography>
                  </Stack>

                  <Typography
                    variant="body1"
                    sx={{ mb: 4, fontWeight: 700, opacity: 0.8 }}
                  >
                    Set the percentage of your total logged work that should be{' '}
                    {mainFocusStream?.name || 'your main goal'}. This will be
                    tracked on your dashboard.
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 3,
                      bgcolor: 'action.hover',
                      borderRadius: '20px',
                      border: '3px solid',
                      borderColor: 'text.primary',
                    }}
                  >
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 900 }}>
                        {mainFocusStream?.name || 'Main Goal'} Target
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, opacity: 0.7 }}
                      >
                        What % of your time should go here?
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <TextField
                        type="number"
                        value={utilisationTarget}
                        onChange={(e) => setUtilisationTarget(e.target.value)}
                        inputProps={{ min: 0, max: 100, step: 5 }}
                        sx={{
                          width: 100,
                          '& .MuiInputBase-root': {
                            fontWeight: 900,
                            fontSize: '1.2rem',
                            borderRadius: '12px',
                            border: '2px solid',
                            borderColor: 'text.primary',
                          },
                        }}
                      />
                      <Typography variant="h5" sx={{ fontWeight: 900 }}>
                        %
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => handleSaveUtilisation(utilisationTarget)}
                        disabled={isUtilSaving}
                        sx={{
                          fontWeight: 900,
                          px: 3,
                          backgroundImage: 'none',
                          bgcolor: 'background.paper',
                          color: 'text.primary',
                          border: '2px solid',
                          borderColor: 'text.primary',
                          boxShadow: (theme) =>
                            `4px 4px 0px ${theme.palette.text.primary}`,
                          '&:hover': {
                            bgcolor: '#f0f0f0',
                            boxShadow: (theme) =>
                              `2px 2px 0px ${theme.palette.text.primary}`,
                            transform: 'translate(2px, 2px)',
                          },
                          '&.Mui-disabled': {
                            opacity: 0.5,
                            boxShadow: 'none',
                            border: '2px solid #999',
                            bgcolor: '#f0f0f0',
                          },
                        }}
                      >
                        SAVE
                      </Button>
                    </Stack>
                  </Box>
                </Paper>
              )}

              {/* Workspace Section */}
              <Paper
                sx={{
                  p: 6,
                  borderRadius: '40px',
                  border: '4px solid',
                  borderColor: 'text.primary',
                  boxShadow: (theme) =>
                    `10px 10px 0px ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 950 }}>
                  Active Workspace
                </Typography>
                <Box
                  sx={{
                    mb: 4,
                    fontFamily: '"JetBrains Mono", monospace',
                    bgcolor: 'rgba(0,0,0,0.04)',
                    p: 3,
                    borderRadius: '16px',
                    border: '2px solid',
                    borderColor: 'text.primary',
                    wordBreak: 'break-all',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                  }}
                >
                  {selectedDirectory}
                </Box>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  sx={{ justifyContent: 'center' }}
                >
                  <Button
                    variant="contained"
                    onClick={rerunStreamSetup}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontWeight: 900,
                      backgroundImage: 'none',
                      bgcolor: 'background.paper',
                      color: 'text.primary',
                      border: '2px solid',
                      borderColor: 'text.primary',
                      boxShadow: (theme) =>
                        `4px 4px 0px ${theme.palette.text.primary}`,
                      '&:hover': {
                        bgcolor: 'action.hover',
                        boxShadow: (theme) =>
                          `2px 2px 0px ${theme.palette.text.primary}`,
                        transform: 'translate(2px, 2px)',
                      },
                    }}
                  >
                    RE-RUN STARTUP SETUP
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setProjectDirectory(null)}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontWeight: 900,
                      backgroundImage: 'none',
                      bgcolor: '#f44336',
                      color: 'background.paper',
                      border: '2px solid',
                      borderColor: 'text.primary',
                      boxShadow: (theme) =>
                        `4px 4px 0px ${theme.palette.text.primary}`,
                      '&:hover': {
                        bgcolor: '#d32f2f',
                        boxShadow: (theme) =>
                          `2px 2px 0px ${theme.palette.text.primary}`,
                        transform: 'translate(2px, 2px)',
                      },
                    }}
                  >
                    SWITCH WORKSPACE
                  </Button>
                </Stack>
              </Paper>

              {/* Reports Shortcut Section */}
              <Paper
                sx={{
                  p: 6,
                  borderRadius: '40px',
                  border: '4px solid',
                  borderColor: 'text.primary',
                  boxShadow: (theme) =>
                    `10px 10px 0px ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  sx={{ mb: 4 }}
                >
                  <Assessment sx={{ fontSize: '2.5rem' }} />
                  <Typography variant="h3" sx={{ fontWeight: 950 }}>
                    Reports & Analytics
                  </Typography>
                </Stack>
                <Typography
                  variant="body1"
                  sx={{ mb: 4, fontWeight: 700, opacity: 0.8 }}
                >
                  View deep insights of where your time has been spent across
                  your work streams over an extended period.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/reports')}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontWeight: 900,
                      backgroundImage: 'none',
                      bgcolor: 'background.paper',
                      color: 'text.primary',
                      border: '2px solid',
                      borderColor: 'text.primary',
                      boxShadow: (theme) =>
                        `4px 4px 0px ${theme.palette.text.primary}`,
                      '&:hover': {
                        bgcolor: 'action.hover',
                        boxShadow: (theme) =>
                          `2px 2px 0px ${theme.palette.text.primary}`,
                        transform: 'translate(2px, 2px)',
                      },
                    }}
                  >
                    OPEN REPORTS DASHBOARD
                  </Button>
                </Box>
              </Paper>

              {/* App Updates Section */}
              <Paper
                sx={{
                  p: 6,
                  borderRadius: '40px',
                  border: '4px solid',
                  borderColor: 'text.primary',
                  boxShadow: (theme) =>
                    `10px 10px 0px ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  sx={{ mb: 4 }}
                >
                  <SystemUpdateAlt sx={{ fontSize: '2.5rem' }} />
                  <Typography variant="h3" sx={{ fontWeight: 950 }}>
                    Application Updates
                  </Typography>
                </Stack>

                <Typography variant="h6" sx={{ mb: 4, fontWeight: 800 }}>
                  Current Version: {appVersion ? `v${appVersion}` : 'Unknown'}
                </Typography>

                <Box
                  sx={{
                    p: 4,
                    bgcolor: 'action.hover',
                    borderRadius: '20px',
                    border: '3px solid',
                    borderColor: 'text.primary',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {updateStatus === 'idle' ||
                  updateStatus === 'not-available' ? (
                    <Button
                      variant="contained"
                      onClick={() => {
                        if (
                          window.electronAPI &&
                          window.electronAPI.checkForUpdates
                        ) {
                          window.electronAPI.checkForUpdates().then((res) => {
                            if (res && res.status === 'dev') {
                              showNotification(
                                'Cannot check for updates in development mode.',
                                'info'
                              )
                            }
                          })
                        }
                      }}
                      sx={{
                        fontWeight: 900,
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        backgroundImage: 'none',
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        border: '2px solid',
                        borderColor: 'text.primary',
                        boxShadow: (theme) =>
                          `4px 4px 0px ${theme.palette.text.primary}`,
                        '&:hover': {
                          bgcolor: '#f0f0f0',
                          boxShadow: (theme) =>
                            `2px 2px 0px ${theme.palette.text.primary}`,
                          transform: 'translate(2px, 2px)',
                        },
                      }}
                    >
                      CHECK FOR UPDATES
                    </Button>
                  ) : null}

                  {updateStatus === 'checking' ? (
                    <Button
                      disabled
                      variant="contained"
                      sx={{
                        fontWeight: 900,
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        backgroundImage: 'none',
                        bgcolor: '#e0e0e0',
                        color: 'text.primary',
                        border: '2px solid',
                        borderColor: 'text.primary',
                        boxShadow: 'none',
                        opacity: 0.7,
                      }}
                    >
                      CHECKING...
                    </Button>
                  ) : null}

                  {updateStatus === 'available' ||
                  updateStatus === 'downloading' ? (
                    <Box sx={{ width: '100%', maxWidth: '500px' }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 800, mb: 2, textAlign: 'center' }}
                      >
                        Downloading Update... {updateProgress}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={updateProgress}
                        sx={{
                          height: 16,
                          borderRadius: 8,
                          border: '3px solid',
                          borderColor: 'text.primary',
                          bgcolor: 'background.paper',
                          '& .MuiLinearProgress-bar': { bgcolor: '#4caf50' },
                        }}
                      />
                    </Box>
                  ) : null}

                  {updateStatus === 'downloaded' ? (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => window.electronAPI.quitAndInstall()}
                      sx={{
                        fontWeight: 900,
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        backgroundImage: 'none',
                        bgcolor: '#4caf50',
                        color: '#fff',
                        border: '2px solid',
                        borderColor: 'text.primary',
                        boxShadow: (theme) =>
                          `4px 4px 0px ${theme.palette.text.primary}`,
                        '&:hover': {
                          bgcolor: '#388e3c',
                          boxShadow: (theme) =>
                            `2px 2px 0px ${theme.palette.text.primary}`,
                          transform: 'translate(2px, 2px)',
                        },
                      }}
                    >
                      RESTART & INSTALL
                    </Button>
                  ) : null}

                  {updateStatus === 'error' ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography
                        variant="body1"
                        color="error"
                        sx={{ fontWeight: 800, mb: 3 }}
                      >
                        Error: {updateError}
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => setUpdateStatus('idle')}
                        sx={{
                          fontWeight: 900,
                          px: 4,
                          py: 1.5,
                          backgroundImage: 'none',
                          bgcolor: 'background.paper',
                          color: 'text.primary',
                          border: '2px solid',
                          borderColor: 'text.primary',
                          boxShadow: (theme) =>
                            `4px 4px 0px ${theme.palette.text.primary}`,
                          '&:hover': {
                            bgcolor: '#f0f0f0',
                            boxShadow: (theme) =>
                              `2px 2px 0px ${theme.palette.text.primary}`,
                            transform: 'translate(2px, 2px)',
                          },
                        }}
                      >
                        TRY AGAIN
                      </Button>
                    </Box>
                  ) : null}
                </Box>
              </Paper>

              {/* About Section */}
              <Paper
                sx={{
                  p: 6,
                  borderRadius: '24px',
                  border: '4px dashed',
                  borderColor: 'text.primary',
                  bgcolor: 'transparent',
                }}
              >
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 950 }}>
                  About System
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 800, mb: 1 }}>
                  Work Tracker {appVersion ? `v${appVersion}` : 'Unknown'}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, opacity: 0.7 }}
                >
                  Built with Electron, React & High-Contrast Stream-Based Design
                </Typography>
              </Paper>

              {/* Developer Tools Section (Browser Mock Only) */}
              {window.electronAPI && window.electronAPI.isMock && (
                <Paper
                  sx={{
                    p: 6,
                    borderRadius: '40px',
                    border: '4px solid',
                    borderColor: 'text.primary',
                    boxShadow: (theme) =>
                      `10px 10px 0px ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{ mb: 4 }}
                  >
                    <BugReport sx={{ fontSize: '2.5rem' }} />
                    <Typography variant="h3" sx={{ fontWeight: 950 }}>
                      Developer Tools
                    </Typography>
                  </Stack>

                  <Typography
                    variant="body1"
                    sx={{ mb: 4, fontWeight: 700, opacity: 0.8 }}
                  >
                    Browser dev mode testing tools. These are only visible when
                    running locally over the browser web down view.
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={3}
                    justifyContent="center"
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ gap: 3 }}
                  >
                    <Button
                      variant="contained"
                      onClick={() => {
                        if (
                          window.electronAPI &&
                          window.electronAPI.testNotification
                        ) {
                          window.electronAPI.testNotification()
                        }
                      }}
                      sx={{
                        fontWeight: 900,
                        px: 4,
                        py: 1.5,
                        backgroundImage: 'none',
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        border: '2px solid',
                        borderColor: 'text.primary',
                        boxShadow: (theme) =>
                          `4px 4px 0px ${theme.palette.text.primary}`,
                        '&:hover': {
                          bgcolor: '#f0f0f0',
                          boxShadow: (theme) =>
                            `2px 2px 0px ${theme.palette.text.primary}`,
                          transform: 'translate(2px, 2px)',
                        },
                      }}
                    >
                      TEST NOTIFICATION
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => {
                        if (
                          window.electronAPI &&
                          window.electronAPI.devSimulateUpdate
                        ) {
                          window.electronAPI.devSimulateUpdate()
                        }
                      }}
                      sx={{
                        fontWeight: 900,
                        px: 4,
                        py: 1.5,
                        backgroundImage: 'none',
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        border: '2px solid',
                        borderColor: 'text.primary',
                        boxShadow: (theme) =>
                          `4px 4px 0px ${theme.palette.text.primary}`,
                        '&:hover': {
                          bgcolor: '#f0f0f0',
                          boxShadow: (theme) =>
                            `2px 2px 0px ${theme.palette.text.primary}`,
                          transform: 'translate(2px, 2px)',
                        },
                      }}
                    >
                      SIMULATE UPDATE
                    </Button>
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  )
}

export default Settings
