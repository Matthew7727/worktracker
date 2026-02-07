import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Paper,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Stack,
    Fade
} from '@mui/material';
import {
    ChevronLeft,
    ChevronRight,
    Save,
    Add,
    Delete,
    AccessTime,
    LocalOffer
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAppContext } from '../../context/AppContext';
import { getDailyFilePath } from '../../utils/fileHelpers';
import { parseMarkdown, stringifyMarkdown } from '../../utils/markdownParser';
import { loadAllEntries } from '../../utils/DataManager';
import { useLocation } from 'react-router-dom';

const DailyEditor = () => {
    const { selectedDirectory, refreshTrigger, showNotification } = useAppContext();
    const location = useLocation();
    const [currentDate, setCurrentDate] = useState(() => {
        if (location.state && location.state.initialDate) {
            return new Date(location.state.initialDate);
        }
        return new Date();
    });

    const [entries, setEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState(null);

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    useEffect(() => {
        const loadEntries = async () => {
            if (!selectedDirectory) return;
            setIsLoading(true);
            try {
                const allEntries = await loadAllEntries(selectedDirectory);
                const dateStr = currentDate.toISOString().split('T')[0];
                const dayEntries = allEntries.filter(e => e.date === dateStr);

                if (dayEntries.length > 0) {
                    setEntries(dayEntries.map(e => ({
                        ...e,
                        isSaving: false,
                        newTag: ''
                    })));
                } else {
                    setEntries([{
                        id: 'new-' + Date.now(),
                        content: '',
                        tags: [],
                        isSaving: false,
                        newTag: '',
                        isNew: true
                    }]);
                }
            } catch (error) {
                console.error("Failed to load entries:", error);
                setEntries([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadEntries();
    }, [currentDate, selectedDirectory, refreshTrigger]);

    const handleSaveEntry = async (entryId) => {
        if (!selectedDirectory) return;
        setEntries(prev => prev.map(e => e.id === entryId ? { ...e, isSaving: true } : e));

        try {
            const entry = entries.find(e => e.id === entryId);
            let filePath = entry.path;

            if (!filePath || entry.isNew) {
                const now = new Date();
                const hhmmss = now.getHours().toString().padStart(2, '0') +
                    now.getMinutes().toString().padStart(2, '0') +
                    now.getSeconds().toString().padStart(2, '0');
                filePath = getDailyFilePath(selectedDirectory, currentDate, hhmmss);
            }

            if (window.electronAPI) {
                const updatedMetadata = {
                    ...entry.metadata,
                    tags: entry.tags,
                    lastModified: new Date().toISOString()
                };
                const fileContent = stringifyMarkdown(entry.content, updatedMetadata);
                const result = await window.electronAPI.writeFile(filePath, fileContent);

                if (result.success) {
                    setEntries(prev => prev.map(e => e.id === entryId ? {
                        ...e,
                        isSaving: false,
                        isNew: false,
                        path: filePath,
                        id: filePath.split(/[\\/]/).pop().replace('.md', '')
                    } : e));
                    showNotification('Contribution archived successfully', 'success');
                } else {
                    setEntries(prev => prev.map(e => e.id === entryId ? { ...e, isSaving: false } : e));
                    showNotification(`Save Error: ${result.error}`, 'error');
                }
            }
        } catch (error) {
            console.error("Failed to save entry:", error);
            setEntries(prev => prev.map(e => e.id === entryId ? { ...e, isSaving: false } : e));
            showNotification('Failed to save to system', 'error');
        }
    };

    const handleDeleteEntry = async () => {
        if (!entryToDelete || !selectedDirectory) return;
        setIsLoading(true);
        try {
            const result = await window.electronAPI.deleteFile(entryToDelete.path);
            if (result.success) {
                setEntries(prev => prev.filter(e => e.id !== entryToDelete.id));
                showNotification('Entry purged from archive', 'info');
                if (entries.length <= 1) {
                    setEntries([{
                        id: 'new-' + Date.now(),
                        content: '',
                        tags: [],
                        isSaving: false,
                        newTag: '',
                        isNew: true
                    }]);
                }
            }
        } catch (error) {
            console.error('Failed to delete entry:', error);
            showNotification('Purge failed', 'error');
        } finally {
            setIsLoading(false);
            setIsDeleteModalOpen(false);
            setEntryToDelete(null);
        }
    };

    const handleAddBlankEntry = () => {
        const newEntry = {
            id: 'new-' + Date.now(),
            content: '',
            tags: [],
            isSaving: false,
            newTag: '',
            isNew: true,
            date: currentDate.toISOString().split('T')[0]
        };
        setEntries([newEntry, ...entries]);
        showNotification('New draft created', 'info');
    };

    const updateEntryContent = (id, newContent) => {
        setEntries(prev => prev.map(e => e.id === id ? { ...e, content: newContent } : e));
    };

    const handleAddTag = (id) => {
        const entry = entries.find(e => e.id === id);
        if (entry.newTag.trim() && !entry.tags.includes(entry.newTag.trim())) {
            setEntries(prev => prev.map(e => e.id === id ? {
                ...e,
                tags: [...e.tags, e.newTag.trim()],
                newTag: ''
            } : e));
        }
    };

    const handleRemoveTag = (id, tagToRemove) => {
        setEntries(prev => prev.map(e => e.id === id ? {
            ...e,
            tags: e.tags.filter(t => t !== tagToRemove)
        } : e));
    };

    const handleTagInputKeyDown = (id, e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag(id);
        }
    };

    const handlePrevDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 1);
        setCurrentDate(newDate);
    };

    const handleNextDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 1);
        setCurrentDate(newDate);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'arrowleft': handlePrevDay(); break;
                    case 'arrowright': handleNextDay(); break;
                    case 't': setCurrentDate(new Date()); break;
                    case 'n': handleAddBlankEntry(); break;
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentDate]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '24px', border: '3px solid black' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <IconButton onClick={handlePrevDay} sx={{ border: '2px solid black' }}>
                        <ChevronLeft />
                    </IconButton>

                    <DatePicker
                        value={currentDate}
                        onChange={(val) => setCurrentDate(val)}
                        slotProps={{
                            textField: {
                                size: 'small',
                                sx: {
                                    width: '200px',
                                    '& fieldset': { border: 'none' },
                                    '& .MuiInputBase-root': { bgcolor: 'rgba(0,0,0,0.04)', borderRadius: '12px', fontWeight: 900 }
                                }
                            }
                        }}
                    />

                    <IconButton onClick={handleNextDay} sx={{ border: '2px solid black' }}>
                        <ChevronRight />
                    </IconButton>
                </Stack>

                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleAddBlankEntry}
                    sx={{
                        fontWeight: 900,
                        px: 4,
                        boxShadow: '0 4px 14px rgba(138, 63, 252, 0.3)'
                    }}
                >
                    Add Contribution
                </Button>
            </Paper>

            <Typography variant="h2" sx={{ my: 4, fontWeight: 950 }}>
                {formatDate(currentDate)}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, pb: 8 }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : entries.length === 0 ? (
                    <Paper sx={{ p: 8, textAlign: 'center', borderStyle: 'dashed', border: '3px dashed black', opacity: 0.6, borderRadius: '24px' }}>
                        <Typography variant="h6" gutterBottom>No contributions logged for this day yet.</Typography>
                        <Button variant="text" onClick={handleAddBlankEntry}>Add your first entry</Button>
                    </Paper>
                ) : (
                    entries.map((entry, index) => (
                        <Fade in={true} timeout={500 + index * 100} key={entry.id}>
                            <Paper
                                sx={{
                                    p: 4,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 3,
                                    border: '3px solid black',
                                    borderColor: entry.isNew ? 'primary.main' : 'black',
                                    borderRadius: '24px',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        bgcolor: 'rgba(0,0,0,0.01)',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        {entry.time && (
                                            <Chip
                                                icon={<AccessTime sx={{ fontSize: '1.2rem !important' }} />}
                                                label={entry.time}
                                                sx={{
                                                    bgcolor: 'rgba(0, 114, 195, 0.05)',
                                                    color: 'secondary.main',
                                                    border: '1px solid currentColor',
                                                    fontWeight: 900,
                                                    fontSize: '1rem'
                                                }}
                                            />
                                        )}
                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                            {entry.tags.map(tag => (
                                                <Chip
                                                    key={tag}
                                                    label={tag}
                                                    onDelete={() => handleRemoveTag(entry.id, tag)}
                                                    color="secondary"
                                                    variant="outlined"
                                                    sx={{ borderWidth: '2px', fontWeight: 900, '&:hover': { borderWidth: '2px' } }}
                                                />
                                            ))}
                                        </Stack>
                                    </Stack>
                                    <Stack direction="row" spacing={2}>
                                        <IconButton
                                            onClick={() => {
                                                if (entry.isNew) {
                                                    setEntries(prev => prev.filter(e => e.id !== entry.id));
                                                } else {
                                                    setEntryToDelete(entry);
                                                    setIsDeleteModalOpen(true);
                                                }
                                            }}
                                            sx={{
                                                border: '2px solid black',
                                                color: 'error.main',
                                                '&:hover': { bgcolor: 'error.main', color: 'white' }
                                            }}
                                        >
                                            <Delete />
                                        </IconButton>
                                        <Button
                                            variant="contained"
                                            startIcon={entry.isSaving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                                            onClick={() => handleSaveEntry(entry.id)}
                                            disabled={entry.isSaving}
                                            sx={{ px: 4 }}
                                        >
                                            {entry.isSaving ? 'SAVING...' : 'SAVE'}
                                        </Button>
                                    </Stack>
                                </Box>

                                <Stack direction="row" spacing={2} alignItems="center">
                                    <TextField
                                        size="small"
                                        placeholder="Add tag..."
                                        value={entry.newTag || ''}
                                        onChange={(e) => setEntries(prev => prev.map(ent => ent.id === entry.id ? { ...ent, newTag: e.target.value } : ent))}
                                        onKeyDown={(e) => handleTagInputKeyDown(entry.id, e)}
                                        InputProps={{
                                            startAdornment: <LocalOffer sx={{ mr: 1, fontSize: '1rem', opacity: 0.5 }} />
                                        }}
                                        sx={{ width: '180px' }}
                                    />
                                </Stack>

                                <TextField
                                    multiline
                                    rows={6}
                                    fullWidth
                                    placeholder="Describe what you accomplished..."
                                    value={entry.content}
                                    onChange={(e) => updateEntryContent(entry.id, e.target.value)}
                                    variant="filled"
                                    InputProps={{
                                        disableUnderline: true,
                                        sx: {
                                            fontSize: '1.2rem',
                                            lineHeight: 1.8,
                                            borderRadius: '16px',
                                            bgcolor: 'rgba(0,0,0,0.02)',
                                            p: 3,
                                            '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                                        }
                                    }}
                                />
                            </Paper>
                        </Fade>
                    ))
                )}
            </Box>

            <Dialog
                open={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                PaperProps={{
                    sx: { borderRadius: '24px', border: '4px solid black', p: 3 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 950, fontSize: '2rem', textAlign: 'center', borderBottom: '3px solid black', mb: 3 }}>
                    CONFIRM ARCHIVE PURGE
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>Are you absolutely sure?</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        This specific contribution will be purged from the archive.<br />
                        This action cannot be reversed.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
                    <Button variant="outlined" onClick={() => setIsDeleteModalOpen(false)} sx={{ px: 4 }}>
                        KEEP IT
                    </Button>
                    <Button variant="contained" color="error" onClick={handleDeleteEntry} sx={{ px: 4, bgcolor: 'error.main', border: 'none' }}>
                        DELETE FOREVER
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DailyEditor;
