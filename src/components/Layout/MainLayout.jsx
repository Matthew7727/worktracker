import React from 'react';
import {
    AppBar,
    Toolbar,
    Box,
    Zoom,
    useScrollTrigger,
    Fab,
    IconButton,
    Tooltip,
    Stack
} from '@mui/material';
import {
    Home,
    Notes,
    Settings,
    FolderOpen,
    Assessment,
    MenuBook as DocsIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
    Checklist,
    Brightness4,
    Brightness7
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';
import { useThemeContext } from '../../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';

// Sub-components
import Brand from './components/Brand';
import Navigation from './components/Navigation';
import GlobalSearch from './components/GlobalSearch';
import FeedbackSystem from './components/FeedbackSystem';
import { appBarStyles, toolbarStyles, fabStyles, toolbarIconStyles } from './MainLayout.styles';

function ScrollTop({ children }) {
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 100,
    });

    const handleClick = (event) => {
        const anchor = (event.target.ownerDocument || document).querySelector('#back-to-top-anchor');
        if (anchor) anchor.scrollIntoView({ block: 'center', behavior: 'smooth' });
    };

    return (
        <Zoom in={trigger}>
            <Box onClick={handleClick} role="presentation" sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000 }}>
                {children}
            </Box>
        </Zoom>
    );
}

const MainLayout = ({ children }) => {
    const { selectedDirectory, setProjectDirectory, notification, hideNotification } = useAppContext();
    const { mode, toggleTheme } = useThemeContext();
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { label: 'Dashboard', path: '/', icon: <Home /> },
        { label: 'Entries', path: '/editor', icon: <Notes /> },
        { label: 'To-Dos', path: '/todos', icon: <Checklist /> },
        { label: 'Reports', path: '/reports', icon: <Assessment /> },
        { label: 'Settings', path: '/settings', icon: <Settings /> },
    ];

    const handleSearchResultClick = (date) => {
        navigate('/', { state: { initialDate: date } });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div id="back-to-top-anchor" style={{ position: 'absolute', top: 0 }} />

            <AppBar position="fixed" elevation={0} sx={appBarStyles}>
                <Toolbar sx={toolbarStyles}>
                    <Brand onClick={() => navigate('/')} />

                    <Navigation
                        items={navItems}
                        currentPath={location.pathname}
                        onNavigate={navigate}
                    />

                    <Box sx={{ flexGrow: 1 }} />

                    <Stack direction="row" spacing={2} alignItems="center">
                        <GlobalSearch
                            rootDir={selectedDirectory}
                            onResultClick={handleSearchResultClick}
                        />

                        <Tooltip title="Application Docs" arrow>
                            <IconButton
                                onClick={() => navigate('/docs')}
                                sx={{
                                    ...toolbarIconStyles,
                                    color: location.pathname === '/docs' ? 'primary.main' : 'inherit',
                                    borderColor: location.pathname === '/docs' ? 'primary.main' : 'black'
                                }}
                            >
                                <DocsIcon />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Switch Workspace" arrow>
                            <IconButton
                                onClick={() => setProjectDirectory(null)}
                                sx={toolbarIconStyles}
                            >
                                <FolderOpen />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`} arrow>
                            <IconButton onClick={toggleTheme} sx={toolbarIconStyles}>
                                {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Toolbar>
            </AppBar>

            <Box component="main" sx={{ flexGrow: 1, pt: '5.5rem', overflowY: 'auto', bgcolor: 'background.default' }}>
                <Box sx={{ py: 6, px: '4rem' }}>
                    {children}
                </Box>
            </Box>

            <ScrollTop>
                <Fab color="primary" size="large" aria-label="scroll back to top" sx={fabStyles}>
                    <KeyboardArrowUpIcon sx={{ fontSize: '2rem', color: 'white' }} />
                </Fab>
            </ScrollTop>

            <FeedbackSystem notification={notification} onHide={hideNotification} />
        </Box>
    );
};

export default MainLayout;
