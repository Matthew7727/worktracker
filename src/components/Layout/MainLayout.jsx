import React from 'react';
import {
    AppBar,
    Toolbar,
    Box,
    Container,
    Button,
    Zoom,
    useScrollTrigger,
    Fab
} from '@mui/material';
import {
    Home,
    Notes,
    Settings,
    FolderOpen,
    Assessment,
    KeyboardArrowUp as KeyboardArrowUpIcon
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';

// Sub-components
import Brand from './components/Brand';
import Navigation from './components/Navigation';
import GlobalSearch from './components/GlobalSearch';
import FeedbackSystem from './components/FeedbackSystem';
import { appBarStyles, toolbarStyles, fabStyles } from './MainLayout.styles';

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
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { label: 'Editor', path: '/', icon: <Notes /> },
        { label: 'Dashboard', path: '/dashboard', icon: <Home /> },
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

                    <GlobalSearch
                        rootDir={selectedDirectory}
                        onResultClick={handleSearchResultClick}
                    />

                    <Button
                        variant="text"
                        startIcon={<FolderOpen />}
                        onClick={() => setProjectDirectory(null)}
                        sx={{
                            fontWeight: 800,
                            color: 'text.primary',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            display: { xs: 'none', md: 'flex' },
                            '&:hover': { bgcolor: 'transparent', opacity: 0.7 }
                        }}
                    >
                        Switch Workspace
                    </Button>
                </Toolbar>
            </AppBar>

            <Box component="main" sx={{ flexGrow: 1, pt: '5.5rem', overflowY: 'auto', bgcolor: 'background.default' }}>
                <Container maxWidth={false} sx={{ py: 6, px: '4rem !important' }}>
                    {children}
                </Container>
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
