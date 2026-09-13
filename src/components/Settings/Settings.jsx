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
import { useUpdate } from '../../context/UpdateContext'
import StreamSettings from './StreamSettings'
import { RULE, OFFSET, hardShadow, FONT, SIGNAL } from '../../styles/tokens'

const panelSx = {
  p: 6,
  border: `${RULE.base}px solid`,
  borderColor: 'text.primary',
  boxShadow: (theme) => hardShadow(OFFSET.hero, theme.palette.text.primary),
}

const dashedPanelSx = {
  p: 6,
  border: `${RULE.base}px dashed`,
  borderColor: 'text.primary',
  bgcolor: 'transparent',
}

const ledgerRowSx = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  p: 3,
  bgcolor: 'action.hover',
  border: `${RULE.hair}px solid`,
  borderColor: 'text.primary',
  '& + &': {
    borderTop: 0,
  },
}

const inputRootSx = {
  fontWeight: 800,
  fontSize: '1.2rem',
  fontFamily: FONT.data,
  border: `${RULE.hair}px solid`,
  borderColor: 'text.primary',
}

const buttonHoverSx = {
  boxShadow: (theme) => hardShadow(OFFSET.press, theme.palette.text.primary),
  transform: `translate(${OFFSET.press}px, ${OFFSET.press}px)`,
}

const hardButtonSx = {
  fontWeight: 800,
  backgroundImage: 'none',
  bgcolor: 'background.paper',
  color: 'text.primary',
  border: `${RULE.hair}px solid`,
  borderColor: 'text.primary',
  boxShadow: (theme) => hardShadow(OFFSET.base, theme.palette.text.primary),
  '&:hover': {
    ...buttonHoverSx,
    bgcolor: 'action.hover',
  },
  '&.Mui-disabled': {
    opacity: 0.5,
    boxShadow: 'none',
    transform: 'none',
    border: `${RULE.hair}px solid #999`,
    bgcolor: '#f0f0f0',
  },
}

const successButtonSx = {
  ...hardButtonSx,
  bgcolor: SIGNAL.go,
  color: '#fff',
  '&:hover': {
    ...buttonHoverSx,
    bgcolor: SIGNAL.goDark,
  },
}

const progressSx = {
  height: 16,
  border: `${RULE.base}px solid`,
  borderColor: 'text.primary',
  bgcolor: 'background.paper',
  '& .MuiLinearProgress-bar': { bgcolor: SIGNAL.go },
}

const Settings = () => {
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
        <Typography
          variant="h1"
          sx={{
            textAlign: 'center',
            fontWeight: 800,
            letterSpacing: '-0.05em',
          }}
        >
          Settings
        </Typography>

        <Grid container spacing={6} justifyContent="center">
          <Grid item xs={12} md={10}>
            <Stack spacing={4}>
              {/* Work Streams Section */}
              <StreamSettings />

              {/* Notifications Section */}
              <Paper sx={panelSx}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  sx={{ mb: 4 }}
                >
                  <NotificationsActive sx={{ fontSize: '2.5rem' }} />
                  <Typography
                    variant="h3"
                    sx={{ fontWeight: 800, letterSpacing: '-0.04em' }}
                  >
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

                <Stack spacing={0}>
                  <Box sx={ledgerRowSx}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>
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

                  <Box sx={ledgerRowSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Schedule />
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
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
                            ...inputRootSx,
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
                          ...hardButtonSx,
                          px: 3,
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
                <Paper sx={panelSx}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{ mb: 4 }}
                  >
                    <TrendingUp sx={{ fontSize: '2.5rem' }} />
                    <Typography
                      variant="h3"
                      sx={{ fontWeight: 800, letterSpacing: '-0.04em' }}
                    >
                      Utilisation Target
                    </Typography>
                  </Stack>

                  <Typography
                    variant="body1"
                    sx={{ mb: 4, fontWeight: 700, opacity: 0.8 }}
                  >
                    Utilisation is predicted from the hours you declare in
                    STAFFIT each week (client work only), tracked against your
                    standard week, over the 1 June – 31 May cycle.
                  </Typography>

                  <Stack spacing={0}>
                    <Box sx={ledgerRowSx}>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                          Utilisation Target
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, opacity: 0.7 }}
                        >
                          What % of a standard week should be chargeable?
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
                              ...inputRootSx,
                            },
                          }}
                        />
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                          %
                        </Typography>
                      </Stack>
                    </Box>

                    <Box sx={ledgerRowSx}>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                          Standard Week
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, opacity: 0.7 }}
                        >
                          Hours in a full, standard working week
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <TextField
                          type="number"
                          value={standardWeeklyHours}
                          onChange={(e) =>
                            setStandardWeeklyHours(e.target.value)
                          }
                          inputProps={{ min: 0, step: 0.5 }}
                          sx={{
                            width: 100,
                            '& .MuiInputBase-root': {
                              ...inputRootSx,
                            },
                          }}
                        />
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                          hrs
                        </Typography>
                      </Stack>
                    </Box>

                    <Button
                      variant="contained"
                      onClick={() =>
                        handleSaveUtilisation(
                          utilisationTarget,
                          standardWeeklyHours
                        )
                      }
                      disabled={isUtilSaving}
                      sx={{
                        ...hardButtonSx,
                        alignSelf: 'flex-end',
                        mt: 2,
                        px: 3,
                      }}
                    >
                      SAVE
                    </Button>
                  </Stack>
                </Paper>
              )}

              {/* Workspace Section */}
              <Paper sx={panelSx}>
                <Typography
                  variant="h4"
                  sx={{ mb: 4, fontWeight: 800, letterSpacing: '-0.04em' }}
                >
                  Active Workspace
                </Typography>
                <Box
                  sx={{
                    mb: 4,
                    fontFamily: FONT.data,
                    bgcolor: 'rgba(0,0,0,0.04)',
                    p: 3,
                    border: `${RULE.hair}px solid`,
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
                      ...hardButtonSx,
                      px: 4,
                      py: 1.5,
                    }}
                  >
                    RE-RUN STARTUP SETUP
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setProjectDirectory(null)}
                    sx={{
                      ...hardButtonSx,
                      px: 4,
                      py: 1.5,
                      bgcolor: SIGNAL.stop,
                      color: 'background.paper',
                      '&:hover': {
                        ...buttonHoverSx,
                        bgcolor: SIGNAL.stop,
                      },
                    }}
                  >
                    SWITCH WORKSPACE
                  </Button>
                </Stack>
              </Paper>

              {/* Reports Shortcut Section */}
              <Paper sx={panelSx}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  sx={{ mb: 4 }}
                >
                  <Assessment sx={{ fontSize: '2.5rem' }} />
                  <Typography
                    variant="h3"
                    sx={{ fontWeight: 800, letterSpacing: '-0.04em' }}
                  >
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
                      ...hardButtonSx,
                      px: 4,
                      py: 1.5,
                    }}
                  >
                    OPEN REPORTS DASHBOARD
                  </Button>
                </Box>
              </Paper>

              {/* App Updates Section */}
              <Paper sx={panelSx}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  sx={{ mb: 4 }}
                >
                  <SystemUpdateAlt sx={{ fontSize: '2.5rem' }} />
                  <Typography
                    variant="h3"
                    sx={{ fontWeight: 800, letterSpacing: '-0.04em' }}
                  >
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
                    border: `${RULE.hair}px solid`,
                    borderColor: 'text.primary',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {updateStatus === 'up-to-date' ? (
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 800, mb: 2, color: SIGNAL.go }}
                    >
                      ✓ You&apos;re on the latest version
                    </Typography>
                  ) : null}

                  {updateStatus === 'idle' || updateStatus === 'up-to-date' ? (
                    <Button
                      variant="contained"
                      onClick={() => {
                        checkForUpdates().then((res) => {
                          if (res && res.status === 'dev') {
                            showNotification(
                              'Cannot check for updates in development mode.',
                              'info'
                            )
                          }
                        })
                      }}
                      sx={{
                        ...hardButtonSx,
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
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
                        fontWeight: 800,
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        backgroundImage: 'none',
                        bgcolor: '#e0e0e0',
                        color: 'text.primary',
                        border: `${RULE.hair}px solid`,
                        borderColor: 'text.primary',
                        boxShadow: 'none',
                        opacity: 0.7,
                      }}
                    >
                      CHECKING...
                    </Button>
                  ) : null}

                  {updateStatus === 'available' ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                        Version {updateInfo?.version} is available
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={downloadUpdate}
                        sx={{
                          ...hardButtonSx,
                          px: 4,
                          py: 1.5,
                          fontSize: '1.1rem',
                        }}
                      >
                        DOWNLOAD UPDATE
                      </Button>
                    </Box>
                  ) : null}

                  {updateStatus === 'downloading' ? (
                    <Box sx={{ width: '100%', maxWidth: '500px' }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 800, mb: 2, textAlign: 'center' }}
                      >
                        Downloading Update...{' '}
                        {Math.floor(updateProgress?.percent || 0)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={updateProgress?.percent || 0}
                        sx={progressSx}
                      />
                    </Box>
                  ) : null}

                  {updateStatus === 'downloaded' ? (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={installUpdate}
                      sx={{
                        ...successButtonSx,
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
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
                        onClick={resetUpdate}
                        sx={{
                          ...hardButtonSx,
                          px: 4,
                          py: 1.5,
                        }}
                      >
                        TRY AGAIN
                      </Button>
                    </Box>
                  ) : null}
                </Box>
              </Paper>

              {/* About Section */}
              <Paper sx={dashedPanelSx}>
                <Typography
                  variant="h5"
                  sx={{ mb: 2, fontWeight: 800, letterSpacing: '-0.03em' }}
                >
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
                <Paper sx={panelSx}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{ mb: 4 }}
                  >
                    <BugReport sx={{ fontSize: '2.5rem' }} />
                    <Typography
                      variant="h3"
                      sx={{ fontWeight: 800, letterSpacing: '-0.04em' }}
                    >
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
                        ...hardButtonSx,
                        px: 4,
                        py: 1.5,
                      }}
                    >
                      TEST NOTIFICATION
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
