import React, { useState, useEffect } from 'react';
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
    LinearProgress
} from '@mui/material';
import { NotificationsActive, Schedule, BugReport, SystemUpdateAlt } from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';

const Settings = () => {
    const { selectedDirectory, setProjectDirectory, showNotification } = useAppContext();
    
    // Notification State
    const [notifEnabled, setNotifEnabled] = useState(false);
    const [notifTime, setNotifTime] = useState('17:00');
    const [isSaving, setIsSaving] = useState(false);

    // Auto Update State
    const [appVersion, setAppVersion] = useState('');
    const [updateStatus, setUpdateStatus] = useState('idle');
    const [updateProgress, setUpdateProgress] = useState(0);
    const [updateError, setUpdateError] = useState(null);

    // Initialize version
    useEffect(() => {
        if (window.electronAPI && window.electronAPI.getVersion) {
            window.electronAPI.getVersion().then(setAppVersion).catch(() => {});
        }
    }, []);

    // Setup Update Listeners
    useEffect(() => {
        if (!window.electronAPI || !window.electronAPI.onUpdateAvailable) return;

        window.electronAPI.onUpdateChecking(() => setUpdateStatus('checking'));
        window.electronAPI.onUpdateAvailable(() => setUpdateStatus('available'));
        window.electronAPI.onUpdateNotAvailable(() => {
            setUpdateStatus('not-available');
            showNotification('You are on the latest version.', 'success');
            setTimeout(() => setUpdateStatus('idle'), 3000);
        });
        window.electronAPI.onUpdateProgress((percent) => {
            setUpdateStatus('downloading');
            setUpdateProgress(Math.floor(percent));
        });
        window.electronAPI.onUpdateDownloaded(() => setUpdateStatus('downloaded'));
        window.electronAPI.onUpdateError((err) => {
            setUpdateStatus('error');
            setUpdateError(err);
        });

        return () => {
            if (window.electronAPI.removeAllUpdateListeners) {
                window.electronAPI.removeAllUpdateListeners();
            }
        };
    }, [showNotification]);

    // Load initial settings
    useEffect(() => {
        const fetchSettings = async () => {
            if (window.electronAPI) {
                const settings = await window.electronAPI.loadSettings();
                setNotifEnabled(settings.notificationsEnabled || false);
                setNotifTime(settings.notificationTime || '17:00');
            }
        };
        fetchSettings();
    }, []);

    const handleSaveSettings = async (enabled, time) => {
        setIsSaving(true);
        try {
            const result = await window.electronAPI.saveSettings({
                notificationsEnabled: enabled,
                notificationTime: time,
                selectedDirectory // Keep existing
            });
            if (result.success) {
                showNotification('Settings updated successfully', 'success');
            }
        } catch (error) {
            showNotification('Failed to save settings', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleNotifs = (e) => {
        const val = e.target.checked;
        setNotifEnabled(val);
        handleSaveSettings(val, notifTime);
    };

    const handleTimeChange = (e) => {
        const val = e.target.value;
        setNotifTime(val);
        // We don't auto-save time to avoid too many writes, or we can use a debouncer
    };

    const handleTestNotif = async () => {
        await window.electronAPI.testNotification();
    };

    return (
        <Fade in={true} timeout={600}>
            <Box className="settings-page" sx={{ maxWidth: '1000px', mx: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 6, pb: 10 }}>
                <Typography variant="h1" sx={{ textAlign: 'center', fontWeight: 950 }}>Settings</Typography>

                <Grid container spacing={6} justifyContent="center">
                    <Grid item xs={12} md={10}>
                        <Stack spacing={4}>
                            
                            {/* Notifications Section */}
                            <Paper sx={{ p: 6, borderRadius: '40px', border: '4px solid black', boxShadow: '10px 10px 0px black' }}>
                                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                                    <NotificationsActive sx={{ fontSize: '2.5rem' }} />
                                    <Typography variant="h3" sx={{ fontWeight: 950 }}>Daily Reminders</Typography>
                                </Stack>
                                
                                <Typography variant="body1" sx={{ mb: 4, fontWeight: 700, opacity: 0.8 }}>
                                    Stay consistent by scheduling a daily nudge to log your achievements.
                                </Typography>

                                <Stack spacing={4}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, bgcolor: 'action.hover', borderRadius: '20px', border: '3px solid black' }}>
                                        <Box>
                                            <Typography variant="h5" sx={{ fontWeight: 900 }}>Enable Notifications</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.7 }}>Get a desktop alert at your preferred time.</Typography>
                                        </Box>
                                        <Switch 
                                            checked={notifEnabled} 
                                            onChange={handleToggleNotifs}
                                            sx={{ 
                                                '& .MuiSwitch-switchBase.Mui-checked': { color: 'primary.main' },
                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiLinearProgress-bar': { bgcolor: 'primary.main' }
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, bgcolor: 'action.hover', borderRadius: '20px', border: '3px solid black' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Schedule />
                                            <Box>
                                                <Typography variant="h5" sx={{ fontWeight: 900 }}>Reminder Time</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.7 }}>When should we nudge you?</Typography>
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
                                                        border: '2px solid black'
                                                    }
                                                }}
                                            />
                                            <Button 
                                                variant="contained" 
                                                onClick={() => handleSaveSettings(notifEnabled, notifTime)}
                                                disabled={!notifEnabled || isSaving}
                                                sx={{ fontWeight: 900, px: 3 }}
                                            >
                                                UPDATE
                                            </Button>
                                        </Stack>
                                    </Box>

                                    <Button 
                                        variant="outlined" 
                                        startIcon={<BugReport />}
                                        onClick={handleTestNotif}
                                        sx={{ 
                                            alignSelf: 'flex-start', 
                                            border: '3px solid black', 
                                            color: 'black', 
                                            fontWeight: 900,
                                            '&:hover': { borderWidth: '3px' }
                                        }}
                                    >
                                        TEST NOTIFICATION
                                    </Button>
                                </Stack>
                            </Paper>

                            {/* Workspace Section */}
                            <Paper sx={{ p: 6, borderRadius: '40px', border: '4px solid black', boxShadow: '10px 10px 0px rgba(0,0,0,0.1)' }}>
                                <Typography variant="h4" sx={{ mb: 4, fontWeight: 950 }}>Active Workspace</Typography>
                                <Box sx={{
                                    mb: 4,
                                    fontFamily: '"JetBrains Mono", monospace',
                                    bgcolor: 'rgba(0,0,0,0.04)',
                                    p: 3,
                                    borderRadius: '16px',
                                    border: '2px solid black',
                                    wordBreak: 'break-all',
                                    fontWeight: 800,
                                    fontSize: '1.1rem'
                                }}>
                                    {selectedDirectory}
                                </Box>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => setProjectDirectory(null)}
                                    sx={{
                                        px: 4,
                                        fontWeight: 900,
                                        borderWidth: '3px',
                                        borderColor: 'black',
                                        color: 'black',
                                        '&:hover': { borderWidth: '3px', bgcolor: 'error.main', color: 'white', borderColor: 'black' }
                                    }}
                                >
                                    Switch Workspace
                                </Button>
                            </Paper>

                            {/* App Updates Section */}
                            <Paper sx={{ p: 6, borderRadius: '40px', border: '4px solid black', boxShadow: '10px 10px 0px rgba(0,0,0,0.1)' }}>
                                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                                    <SystemUpdateAlt sx={{ fontSize: '2.5rem' }} />
                                    <Typography variant="h3" sx={{ fontWeight: 950 }}>Application Updates</Typography>
                                </Stack>

                                <Typography variant="h6" sx={{ mb: 4, fontWeight: 800 }}>
                                    Current Version: {appVersion ? `v${appVersion}` : 'Unknown'}
                                </Typography>

                                <Box sx={{ p: 3, bgcolor: 'action.hover', borderRadius: '20px', border: '3px solid black' }}>
                                    {updateStatus === 'idle' || updateStatus === 'not-available' ? (
                                        <Button
                                            variant="contained"
                                            onClick={() => {
                                                if (window.electronAPI && window.electronAPI.checkForUpdates) {
                                                    window.electronAPI.checkForUpdates().then(res => {
                                                        if (res && res.status === 'dev') {
                                                            showNotification('Cannot check for updates in development mode.', 'info');
                                                        }
                                                    });
                                                }
                                            }}
                                            sx={{ fontWeight: 900, px: 4, py: 1.5, fontSize: '1.1rem' }}
                                        >
                                            CHECK FOR UPDATES
                                        </Button>
                                    ) : null}

                                    {updateStatus === 'checking' ? (
                                        <Button disabled variant="contained" sx={{ fontWeight: 900, px: 4, py: 1.5, fontSize: '1.1rem' }}>
                                            CHECKING...
                                        </Button>
                                    ) : null}

                                    {updateStatus === 'available' || updateStatus === 'downloading' ? (
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                                                Downloading Update... {updateProgress}%
                                            </Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={updateProgress}
                                                sx={{ height: 12, borderRadius: 6, border: '2px solid black' }}
                                            />
                                        </Box>
                                    ) : null}

                                    {updateStatus === 'downloaded' ? (
                                        <Button
                                            variant="contained"
                                            color="success"
                                            onClick={() => window.electronAPI.quitAndInstall()}
                                            sx={{ fontWeight: 900, px: 4, py: 1.5, fontSize: '1.1rem', bgcolor: '#4caf50', color: '#fff', '&:hover': { bgcolor: '#388e3c' } }}
                                        >
                                            RESTART & INSTALL
                                        </Button>
                                    ) : null}

                                    {updateStatus === 'error' ? (
                                        <Box>
                                            <Typography variant="body1" color="error" sx={{ fontWeight: 800, mb: 2 }}>
                                                Error: {updateError}
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                onClick={() => setUpdateStatus('idle')}
                                                sx={{ fontWeight: 900, borderWidth: '3px', borderColor: 'black', color: 'black' }}
                                            >
                                                TRY AGAIN
                                            </Button>
                                        </Box>
                                    ) : null}
                                </Box>
                            </Paper>

                            {/* About Section */}
                            <Paper sx={{ p: 6, borderRadius: '24px', border: '4px dashed black', bgcolor: 'transparent' }}>
                                <Typography variant="h5" sx={{ mb: 2, fontWeight: 950 }}>About System</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 800, mb: 1 }}>Work Tracker v1.0.0</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.7 }}>
                                    Built with Electron, React & High-Contrast Stream-Based Design
                                </Typography>
                            </Paper>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>
        </Fade>
    );
};

export default Settings;
