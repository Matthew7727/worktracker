import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog, DialogTitle, DialogContent, IconButton, Typography,
    Paper, Box, TextField, Tooltip
} from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
import { searchDialogStyles, toolbarIconStyles } from '@/components/Layout/MainLayout.styles';

const GlobalSearch = ({ rootDir, onResultClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const performSearch = useCallback(async (q) => {
        if (!q || q.length < 3 || !rootDir) return;
        setIsSearching(true);
        try {
            const response = await window.electronAPI.searchEntries({ rootDir, query: q });
            if (response.success) {
                setResults(response.results);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    }, [rootDir]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.length >= 3) performSearch(query);
            else setResults([]);
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [query, performSearch]);

    // Global shortcut (Ctrl+F)
    useEffect(() => {
        const handleKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
                e.preventDefault();
                setIsOpen(true);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    const handleSelect = (date) => {
        setIsOpen(false);
        setQuery('');
        onResultClick(date);
    };

    return (
        <>
            <Tooltip title="Search Archive (Ctrl+F)" arrow>
                <IconButton
                    onClick={() => setIsOpen(true)}
                    sx={toolbarIconStyles}
                    aria-label="Open search"
                >
                    <SearchIcon />
                </IconButton>
            </Tooltip>

            <Dialog
                open={isOpen}
                onClose={() => setIsOpen(false)}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: searchDialogStyles,
                    'data-testid': 'search-dialog'
                }}
            >
                <DialogTitle sx={{ fontWeight: 900, fontSize: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid black', mb: 2 }}>
                    GLOBAL SEARCH
                    <IconButton onClick={() => setIsOpen(false)} aria-label="Close search"><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth autoFocus
                        placeholder="Type keywords to find logs..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        variant="outlined"
                        sx={{ mt: 2, '& .MuiOutlinedInput-root': { fontSize: '1.5rem', height: '4rem', borderRadius: '16px', '& fieldset': { borderWidth: '3px', borderColor: 'black !important' } } }}
                    />
                    <Box sx={{ mt: 5, maxHeight: '500px', overflowY: 'auto', pr: 2 }}>
                        {isSearching ? (
                            <Typography sx={{ textAlign: 'center', p: 4, fontWeight: 800 }}>SEARCHING...</Typography>
                        ) : results.length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {results.map((res, i) => (
                                    <Paper
                                        key={i}
                                        onClick={() => handleSelect(res.date)}
                                        data-testid={`search-result-${res.date}`}
                                        sx={{
                                            p: 3, cursor: 'pointer', transition: 'all 0.2s', border: '3px solid black', borderRadius: '16px',
                                            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 0 black' }, boxShadow: '0 4px 0 black'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                            <Typography sx={{ fontWeight: 900, color: 'primary.main', fontSize: '1.25rem' }}>{res.date}</Typography>
                                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.5 }}>{res.fileName}</Typography>
                                        </Box>
                                        <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, fontStyle: 'italic', lineHeight: '1.5' }}>"{res.snippet}"</Typography>
                                    </Paper>
                                ))}
                            </Box>
                        ) : (
                            <Typography sx={{ opacity: 0.6, textAlign: 'center', p: 4, fontWeight: 800 }}>
                                {query.length >= 3 ? `NO RESULTS FOR "${query.toUpperCase()}"` : 'TYPE AT LEAST 3 CHARACTERS...'}
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default GlobalSearch;
