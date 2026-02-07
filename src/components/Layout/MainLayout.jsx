import React from 'react';
import {
    Header,
    HeaderName,
    HeaderGlobalBar,
    Content,
    Theme,
    Search,
    Modal,
    TextInput,
    Button
} from '@carbon/react';
import {
    Home,
    Catalog,
    Settings,
    FolderOpen,
    Analytics
} from '@carbon/icons-react';
import { useAppContext } from '../../context/AppContext';

import { useNavigate, useLocation } from 'react-router-dom';

const MainLayout = ({ children }) => {
    const { selectedDirectory, setProjectDirectory, theme } = useAppContext();
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
                // Focus the search input in the modal after it opens
                setTimeout(() => {
                    const modalInput = document.getElementById('modal-search-input');
                    if (modalInput) modalInput.focus();
                }, 100);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <Theme theme={theme}>
            <div className="container">
                <Header aria-label="Work Tracker" className="premium-header" style={{ height: '5.5rem', padding: '0 4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <HeaderName href="#" prefix="Work" onClick={() => navigate('/')} className="premium-header-name">
                            Tracker
                        </HeaderName>

                        <nav className="nav-container">
                            <div
                                className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
                                onClick={() => navigate('/')}
                            >
                                <Catalog size={20} />
                                Editor
                            </div>
                            <div
                                className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
                                onClick={() => navigate('/dashboard')}
                            >
                                <Home size={20} />
                                Dashboard
                            </div>
                            <div
                                className={`nav-item ${location.pathname === '/reports' ? 'active' : ''}`}
                                onClick={() => navigate('/reports')}
                            >
                                <Analytics size={20} />
                                Reports
                            </div>
                            <div
                                className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
                                onClick={() => navigate('/settings')}
                            >
                                <Settings size={20} />
                                Settings
                            </div>
                        </nav>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ width: '350px' }}>
                            <Search
                                size="lg"
                                labelText="Search entries"
                                placeholder="Find achievements..."
                                id="global-search"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (e.target.value.length > 2) setIsSearchOpen(true);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && searchQuery.length > 0) setIsSearchOpen(true);
                                }}
                                style={{
                                    borderRadius: '12px',
                                    border: '2px solid var(--text-primary)',
                                    background: 'white'
                                }}
                            />
                        </div>
                        <Button
                            kind="ghost"
                            renderIcon={FolderOpen}
                            onClick={() => setProjectDirectory(null)}
                            style={{ fontWeight: 800, color: 'var(--text-primary)' }}
                        >
                            Switch Workspace
                        </Button>
                    </div>
                </Header>

                <Modal
                    open={isSearchOpen}
                    onRequestClose={() => setIsSearchOpen(false)}
                    modalHeading="GLOBAL SEARCH"
                    primaryButtonText="Close"
                    secondaryButtonText=""
                    passiveModal
                    size="lg"
                    className="search-results-modal"
                >
                    <div style={{ padding: '1rem 0' }}>
                        <TextInput
                            id="modal-search-input"
                            labelText="Search query"
                            hideLabel
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Type keywords to find logs..."
                            className="search-input-large"
                            style={{
                                fontSize: '1.5rem',
                                height: '4rem',
                                border: '3px solid var(--text-primary)',
                                borderRadius: '16px'
                            }}
                        />
                        <div style={{ marginTop: '2.5rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '1rem' }}>
                            {isSearching ? (
                                <p style={{ textAlign: 'center', padding: '2rem', fontWeight: 800 }}>SEARCHING THE ARCHIVE...</p>
                            ) : searchResults.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {searchResults.map((result, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleResultClick(result.date)}
                                            style={{
                                                padding: '1.5rem',
                                                borderRadius: '16px',
                                                background: 'white',
                                                cursor: 'pointer',
                                                border: '3px solid var(--text-primary)',
                                                transition: 'all 0.2s',
                                                boxShadow: '0 4px 0 var(--text-primary)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 6px 0 var(--text-primary)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 4px 0 var(--text-primary)';
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                                <span style={{ fontWeight: 900, color: 'var(--accent-primary)', fontSize: '1.25rem' }}>{result.date}</span>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.5 }}>{result.fileName}</span>
                                            </div>
                                            <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 600, fontStyle: 'italic', lineHeight: '1.5' }}>
                                                "{result.snippet}"
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ opacity: 0.6, textAlign: 'center', padding: '2rem', fontWeight: 800 }}>
                                    {searchQuery.length >= 3 ? `NO RESULTS FOR "${searchQuery.toUpperCase()}"` : 'TYPE AT LEAST 3 CHARACTERS...'}
                                </p>
                            )}
                        </div>
                    </div>
                </Modal>
                <Content className="content-wrapper">
                    {children}
                </Content>
            </div>
        </Theme>
    );
};

export default MainLayout;
