import React, { useState } from 'react';
import { Button } from '@carbon/react';
import { useAppContext } from '../../context/AppContext';

const WelcomeScreen = () => {
    const { setProjectDirectory } = useAppContext();
    const [error, setError] = useState(null);

    const handleSelectDirectory = async () => {
        try {
            const path = await window.electronAPI.selectDirectory();
            if (path) {
                setProjectDirectory(path);
            }
        } catch (err) {
            console.error("Failed to select directory:", err);
            setError("Failed to select directory. Please try again.");
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            gap: '1rem',
            padding: '2rem',
            textAlign: 'center'
        }}>
            <h1>Welcome to Work Tracker</h1>
            <p style={{ marginBottom: '2rem' }}>
                Please select a directory where your daily logs will be stored.
            </p>
            <Button onClick={handleSelectDirectory}>
                Select Directory
            </Button>
            {error && <p style={{ color: '#da1e28', marginTop: '1rem' }}>{error}</p>}
        </div>
    );
};

export default WelcomeScreen;
