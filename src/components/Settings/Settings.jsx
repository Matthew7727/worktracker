import React from 'react';
import { Grid, Column, Button, Toggle, Tile } from '@carbon/react';
import { useAppContext } from '../../context/AppContext';

const Settings = () => {
    const { selectedDirectory, setProjectDirectory, theme, toggleTheme } = useAppContext();

    return (
        <Grid className="settings-page animate-slide-up" fullWidth style={{ padding: '3rem' }}>
            <Column lg={16} md={8} sm={4}>
                <h1 style={{ marginBottom: '3rem', fontWeight: 950, fontSize: '4rem', color: 'var(--text-primary)', letterSpacing: '-0.05em' }}>Settings</h1>
            </Column>

            <Column lg={10} md={8} sm={4}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {/* Workspace Section */}
                    <Tile className="light-panel" style={{ padding: '3rem', border: '3px solid var(--text-primary)', background: 'white' }}>
                        <h4 style={{ marginBottom: '2rem', fontWeight: 900, color: 'var(--text-primary)', fontSize: '1.5rem' }}>Active Workspace</h4>
                        <div style={{
                            marginBottom: '2rem',
                            fontFamily: '"JetBrains Mono", monospace',
                            background: 'var(--bg-sidebar)',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            border: '2px solid var(--text-primary)',
                            wordBreak: 'break-all',
                            color: 'var(--text-primary)',
                            fontWeight: 800,
                            fontSize: '1.1rem'
                        }}>
                            {selectedDirectory}
                        </div>
                        <Button
                            kind="danger--tertiary"
                            onClick={() => setProjectDirectory(null)}
                            style={{
                                borderRadius: '12px',
                                border: '2px solid currentColor',
                                fontWeight: 900,
                                padding: '0 2rem'
                            }}
                            size="lg"
                        >
                            Switch to different folder
                        </Button>
                    </Tile>

                    {/* Appearance Section */}
                    <Tile className="light-panel" style={{ padding: '3rem', border: '3px solid var(--text-primary)', background: 'white' }}>
                        <h4 style={{ marginBottom: '2rem', fontWeight: 900, color: 'var(--text-primary)', fontSize: '1.5rem' }}>Preferences</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.2rem' }}>Interface Theme (Light / Dark)</span>
                            <Toggle
                                id="theme-toggle"
                                labelText=""
                                labelA="Light"
                                labelB="Dark"
                                toggled={theme !== 'white'}
                                onToggle={toggleTheme}
                                size="md"
                                style={{ transform: 'scale(1.2)' }}
                            />
                        </div>
                    </Tile>

                    {/* About Section */}
                    <div className="light-panel" style={{ padding: '3rem', background: 'transparent', border: '3px dashed var(--text-primary)', opacity: 0.8, borderRadius: '24px' }}>
                        <h4 style={{ marginBottom: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', fontSize: '1.25rem' }}>About System</h4>
                        <p style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Work Tracker v0.1.0</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 600 }}>Built with Electron, React & High-Contrast Bold Design System</p>
                    </div>
                </div>
            </Column>
        </Grid>
    );
};

export default Settings;
