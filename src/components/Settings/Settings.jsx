import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Button,
    Switch,
    Stack,
    Fade
} from '@mui/material';
import { useAppContext } from '../../context/AppContext';

const Settings = () => {
    const { selectedDirectory, setProjectDirectory } = useAppContext();

    return (
        <Fade in={true} timeout={600}>
            <Box className="settings-page" sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Typography variant="h1">Settings</Typography>

                <Grid container spacing={6}>
                    <Grid item xs={12} md={8}>
                        <Stack spacing={4}>
                            {/* Workspace Section */}
                            <Paper sx={{ p: 6, borderRadius: '24px', border: '3px solid black' }}>
                                <Typography variant="h4" sx={{ mb: 4 }}>Active Workspace</Typography>
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
                                        borderWidth: '2px',
                                        '&:hover': { borderWidth: '2px' }
                                    }}
                                >
                                    Switch Workspace
                                </Button>
                            </Paper>

                            {/* Appearance Section */}
                            {/* Theme settings removed - Light Mode Enforced */}

                            {/* About Section */}
                            <Paper sx={{ p: 6, borderRadius: '24px', border: '3px dashed black', bgcolor: 'transparent' }}>
                                <Typography variant="h5" sx={{ mb: 2, fontWeight: 900 }}>About System</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 800, mb: 1 }}>Work Tracker v0.1.0</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.7 }}>
                                    Built with Electron, React & MUI High-Contrast Design System
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
