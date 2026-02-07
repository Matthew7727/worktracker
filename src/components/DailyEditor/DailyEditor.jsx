limport React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    Fade
} from '@mui/material';
import { useAppContext } from '../../context/AppContext';
import { getDailyFilePath } from '../../utils/fileHelpers';
import { stringifyMarkdown } from '../../utils/markdownParser';
import { loadAllEntries } from '../../utils/DataManager';
import { useLocation } from 'react-router-dom';

// Sub-components
import DateNavigation from './components/DateNavigation';
import EntryCard from './components/EntryCard';

const DailyEditor = () => {
    const { selectedDirectory, refreshTrigger, showNotification } = useAppContext();
    const location = useLocation();

    // State
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

    // Helpers
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    // Data Loading
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

    // Handlers
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
                    showNotification(`Save Error: ${result.error}`, 'error');
                }
            }
        } catch (error) {
            console.error("Failed to save entry:", error);
            showNotification('Failed to save to system', 'error');
        } finally {
            setEntries(prev => prev.map(e => e.id === entryId ? { ...e, isSaving: false } : e));
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
                    handleAddBlankEntry();
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

    const handleUpdateContent = (id, content) => {
        setEntries(prev => prev.map(e => e.id === id ? { ...e, content } : e));
    };

    const handleUpdateTagsInput = (id, val) => {
        setEntries(prev => prev.map(e => e.id === id ? { ...e, newTag: val } : e));
    };

    const handleAddTag = (id) => {
        const entry = entries.find(e => e.id === id);
        if (entry.newTag.trim() && !entry.tags.includes(entry.newTag.trim())) {
            setEntries(prev => prev.map(e => e.id === id ? {
                ...e,
                tags: [...e.tags, entry.newTag.trim()],
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

    // Navigation handlers
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

    // Shortcuts
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
            <DateNavigation
                currentDate={currentDate}
                onPrevDay={handlePrevDay}
                onNextDay={handleNextDay}
                onDateChange={(val) => setCurrentDate(val)}
                onAddEntry={handleAddBlankEntry}
            />

            <Typography variant="h2" sx={{ my: 4, fontWeight: 950 }}>
                {formatDate(currentDate)}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, pb: 8 }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    entries.map((entry, index) => (
                        <Fade in={true} timeout={500 + index * 100} key={entry.id}>
                            <Box>
                                <EntryCard
                                    entry={entry}
                                    onSave={handleSaveEntry}
                                    onDelete={(e) => {
                                        if (e.isNew) {
                                            setEntries(prev => prev.filter(ent => ent.id !== e.id));
                                        } else {
                                            setEntryToDelete(e);
                                            setIsDeleteModalOpen(true);
                                        }
                                    }}
                                    onUpdateContent={handleUpdateContent}
                                    onUpdateTags={handleUpdateTagsInput}
                                    onAddTag={handleAddTag}
                                    onRemoveTag={handleRemoveTag}
                                />
                            </Box>
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
