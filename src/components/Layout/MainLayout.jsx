import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Container,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    InputAdornment,
    IconButton,
    Paper,
    Snackbar,
    Alert,
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
    Search as SearchIcon,
    Close as CloseIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';

function ScrollTop(props) {
    const { children } = props;
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 100,
    });

    const handleClick = (event) => {
        const anchor = (event.target.ownerDocument || document).querySelector(
            '#back-to-top-anchor',
        );

        if (anchor) {
            anchor.scrollIntoView({
                block: 'center',
                behavior: 'smooth'
            });
        }
    };

    return (
        <Zoom in={trigger}>
            <Box
                onClick={handleClick}
                role="presentation"
                sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000 }}
            >
                {children}
            </Box>
        </Zoom>
    );
}

const MainLayout = ({ children }) => {
    const { selectedDirectory, setProjectDirectory, notification, hideNotification } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSearchOpen, setIsSearchOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);
    const [isSearching, setIsSearching] = React.useState(false);

    const performSearch = React.useCallback(async (query) => {
        if (!query || query.length < 3 || !selectedDirectory) return;
        setIsSearching(true);
        try {
            const response = await window.electronAPI.searchEntries({ rootDir: selectedDirectory, query });
            if (response.success) {
                setSearchResults(response.results);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    }, [selectedDirectory]);

    React.useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length >= 3) {
                performSearch(searchQuery);
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, performSearch]);

    const handleResultClick = (date) => {
        setIsSearchOpen(false);
        setSearchQuery('');
        navigate('/', { state: { initialDate: date } });
    };

    // Global Keyboard Shortcuts
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const navItems = [
        { label: 'Editor', path: '/', icon: <Notes /> },
        { label: 'Dashboard', path: '/dashboard', icon: <Home /> },
        { label: 'Reports', path: '/reports', icon: <Assessment /> },
        { label: 'Settings', path: '/settings', icon: <Settings /> },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div id="back-to-top-anchor" style={{ position: 'absolute', top: 0 }} />
            <AppBar position="fixed" elevation={0} sx={{ zIndex: 1100, borderBottom: '3px solid black' }}>
                <Toolbar sx={{ height: '5.5rem', px: '4rem !important', display: 'flex', gap: 4, bgcolor: 'white', color: 'black' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <Typography
                            variant="h5"
                            onClick={() => navigate('/')}
                            sx={{
                                cursor: 'pointer',
                                fontWeight: 950,
                                mr: 4,
                                letterSpacing: '-0.05em',
                                '& span': { color: 'primary.main' },
                                whiteSpace: 'nowrap'
                            }}
                        >
                            WORK<span>TRACKER</span>
                        </Typography>
                    </Box>

                    <Box component="nav" sx={{ display: 'flex', gap: 2, height: '5.5rem', flexGrow: 1, overflow: 'hidden' }}>
                        {navItems.map((item) => (
                            <Box
                                key={item.label}
                                onClick={() => navigate(item.path)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    px: 2,
                                    height: '100%',
                                    cursor: 'pointer',
                                    fontWeight: 900,
                                    fontSize: '1rem',
                                    color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                                    borderBottom: '4px solid',
                                    borderColor: location.pathname === item.path ? 'primary.main' : 'transparent',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap',
                                    '&:hover': {
                                        bgcolor: 'rgba(0,0,0,0.04)'
                                    }
                                }}
                            >
                                {React.cloneElement(item.icon, { sx: { fontSize: '1.2rem' } })}
                                {item.label}
                            </Box>
                        ))}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 2, justifyContent: 'flex-end', minWidth: 0 }}>
                        <TextField
                            size="small"
                            placeholder="Search archive..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (e.target.value.length > 2) setIsSearchOpen(true);
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: 'text.primary' }} />
                                    </InputAdornment>
                                ),
                                sx: {
                                    borderRadius: '12px',
                                    bgcolor: 'white',
                                    '& fieldset': { borderWidth: '2px', borderColor: 'black !important' },
                                    maxWidth: '400px',
                                    minWidth: '150px'
                                }
                            }}
                            sx={{ flexGrow: 1 }}
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
                    </Box>
                </Toolbar>
            </AppBar>

            <Dialog
                open={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: { p: 2, borderRadius: '24px', border: '4px solid black' }
                }}
            >
                <DialogTitle sx={{ fontWeight: 900, fontSize: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid black', mb: 2 }}>
                    GLOBAL SEARCH
                    <IconButton onClick={() => setIsSearchOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        autoFocus
                        placeholder="Type keywords to find logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        variant="outlined"
                        sx={{
                            mt: 2,
                            '& .MuiOutlinedInput-root': {
                                fontSize: '1.5rem',
                                height: '4rem',
                                borderRadius: '16px',
                                '& fieldset': { borderWidth: '3px', borderColor: 'black !important' }
                            }
                        }}
                    />
                    <Box sx={{ mt: 5, maxHeight: '500px', overflowY: 'auto', pr: 2 }}>
                        {isSearching ? (
                            <Typography sx={{ textAlign: 'center', p: 4, fontWeight: 800 }}>SEARCHING THE ARCHIVE...</Typography>
                        ) : searchResults.length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {searchResults.map((result, index) => (
                                    <Paper
                                        key={index}
                                        onClick={() => handleResultClick(result.date)}
                                        sx={{
                                            p: 3,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            border: '3px solid black',
                                            borderRadius: '16px',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 0 black'
                                            },
                                            boxShadow: '0 4px 0 black'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                            <Typography sx={{ fontWeight: 900, color: 'primary.main', fontSize: '1.25rem' }}>{result.date}</Typography>
                                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.5 }}>{result.fileName}</Typography>
                                        </Box>
                                        <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, fontStyle: 'italic', lineHeight: '1.5' }}>
                                            "{result.snippet}"
                                        </Typography>
                                    </Paper>
                                ))}
                            </Box>
                        ) : (
                            <Typography sx={{ opacity: 0.6, textAlign: 'center', p: 4, fontWeight: 800 }}>
                                {searchQuery.length >= 3 ? `NO RESULTS FOR "${searchQuery.toUpperCase()}"` : 'TYPE AT LEAST 3 CHARACTERS...'}
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
            </Dialog>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    pt: '5.5rem',
                    overflowY: 'auto',
                    bgcolor: 'background.default'
                }}
            >
                <Container maxWidth={false} sx={{ py: 6, px: '4rem !important' }}>
                    {children}
                </Container>
            </Box>

            <ScrollTop>
                <Fab
                    color="primary"
                    size="large"
                    aria-label="scroll back to top"
                    sx={{
                        border: '3px solid black',
                        boxShadow: '0 6px 0 black',
                        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 0 black' }
                    }}
                >
                    <KeyboardArrowUpIcon sx={{ fontSize: '2rem', color: 'white' }} />
                </Fab>
            </ScrollTop>

            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={hideNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={hideNotification}
                    severity={notification.severity}
                    variant="filled"
                    sx={{
                        width: '100%',
                        fontWeight: 900,
                        border: '3px solid black',
                        borderRadius: '16px',
                        boxShadow: '0 8px 0 black',
                        '& .MuiAlert-icon': { fontSize: '1.5rem' }
                    }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default MainLayout;
