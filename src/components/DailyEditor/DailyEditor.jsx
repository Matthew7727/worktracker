import React, { useState, useEffect } from 'react';
import { Button, DatePicker, DatePickerInput, TextArea, InlineLoading, Tag, TextInput, Modal, DismissibleTag } from '@carbon/react';
import { ChevronLeft, ChevronRight, Save, Add, TrashCan } from '@carbon/icons-react';
import { useAppContext } from '../../context/AppContext';
import { getDailyFilePath } from '../../utils/fileHelpers';
import { parseMarkdown, stringifyMarkdown } from '../../utils/markdownParser';
import { loadAllEntries } from '../../utils/DataManager';

import { useLocation } from 'react-router-dom';

const DailyEditor = () => {
    const { selectedDirectory, refreshTrigger } = useAppContext();
    const location = useLocation();
    const [currentDate, setCurrentDate] = useState(() => {
        if (location.state && location.state.initialDate) {
            return new Date(location.state.initialDate);
        }
        return new Date();
    });

    // Multi-entry state
    const [entries, setEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState(null);

    // Date formatting helpers
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    // Load all entries for the selected date
    useEffect(() => {
        const loadEntries = async () => {
            if (!selectedDirectory) return;

            setIsLoading(true);
            try {
                // Get all entries from DataManager (already filtered/sorted)
                const allEntries = await loadAllEntries(selectedDirectory);

                // Filter to only this date
                const dateStr = currentDate.toISOString().split('T')[0];
                const dayEntries = allEntries.filter(e => e.date === dateStr);

                if (dayEntries.length > 0) {
                    setEntries(dayEntries.map(e => ({
                        ...e,
                        isSaving: false,
                        statusMessage: '',
                        newTag: ''
                    })));
                } else {
                    // Start with one empty entry for fresh days
                    setEntries([{
                        id: 'new-' + Date.now(),
                        content: '',
                        tags: [],
                        isSaving: false,
                        statusMessage: '',
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

        setEntries(prev => prev.map(e => e.id === entryId ? { ...e, isSaving: true, statusMessage: '' } : e));

        try {
            const entry = entries.find(e => e.id === entryId);
            let filePath = entry.path;

            // Generate path for new entries
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
                        statusMessage: 'Saved successfully',
                        id: filePath.split(/[\\/]/).pop().replace('.md', '')
                    } : e));
                    setTimeout(() => {
                        setEntries(prev => prev.map(e => e.id === entryId ? { ...e, statusMessage: '' } : e));
                    }, 3000);
                } else {
                    setEntries(prev => prev.map(e => e.id === entryId ? { ...e, isSaving: false, statusMessage: `Error: ${result.error}` } : e));
                }
            }
        } catch (error) {
            console.error("Failed to save entry:", error);
            setEntries(prev => prev.map(e => e.id === entryId ? { ...e, isSaving: false, statusMessage: 'Failed to save' } : e));
        }
    };

    const handleDeleteEntry = async () => {
        if (!entryToDelete || !selectedDirectory) return;

        setIsLoading(true);
        try {
            const result = await window.electronAPI.deleteFile(entryToDelete.path);
            if (result.success) {
                setEntries(prev => prev.filter(e => e.id !== entryToDelete.id));
                if (entries.length <= 1) {
                    // If last entry deleted, bring back an empty one
                    setEntries([{
                        id: 'new-' + Date.now(),
                        content: '',
                        tags: [],
                        isSaving: false,
                        statusMessage: '',
                        newTag: '',
                        isNew: true
                    }]);
                }
            }
        } catch (error) {
            console.error('Failed to delete entry:', error);
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
            statusMessage: '',
            newTag: '',
            isNew: true,
            date: currentDate.toISOString().split('T')[0]
        };
        setEntries([newEntry, ...entries]);
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

    // Shared date handlers
    const handleDateChange = (dates) => {
        if (dates && dates.length > 0) setCurrentDate(dates[0]);
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

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'arrowleft':
                        e.preventDefault();
                        handlePrevDay();
                        break;
                    case 'arrowright':
                        e.preventDefault();
                        handleNextDay();
                        break;
                    case 't':
                        e.preventDefault();
                        setCurrentDate(new Date());
                        break;
                    case 'n':
                        e.preventDefault();
                        handleAddBlankEntry();
                        break;
                    default:
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handlePrevDay, handleNextDay]);

    return (
        <div className="daily-editor animate-slide-up" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header with Date Controls */}
            <div className="daily-header light-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem', marginBottom: '0.5rem' }}>
                <div className="date-controls" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <Button
                        kind="ghost"
                        hasIconOnly
                        renderIcon={ChevronLeft}
                        iconDescription="Previous Day (Ctrl + ←)"
                        onClick={handlePrevDay}
                        style={{ borderRadius: '50%' }}
                    />

                    <div style={{ position: 'relative' }}>
                        <DatePicker
                            datePickerType="single"
                            value={currentDate}
                            onChange={handleDateChange}
                            dateFormat="m/d/Y"
                        >
                            <DatePickerInput
                                id="date-picker-input-id"
                                placeholder="mm/dd/yyyy"
                                labelText=""
                                hideLabel
                                value={currentDate.toLocaleDateString()}
                                size="md"
                                style={{ width: '160px', textAlign: 'center', border: 'none', background: '#f4f4f4', borderRadius: '8px', fontWeight: 600 }}
                            />
                        </DatePicker>
                    </div>

                    <Button
                        kind="ghost"
                        hasIconOnly
                        renderIcon={ChevronRight}
                        iconDescription="Next Day (Ctrl + →)"
                        onClick={handleNextDay}
                        style={{ borderRadius: '50%' }}
                    />
                </div>

                <Button
                    renderIcon={Add}
                    onClick={handleAddBlankEntry}
                    kind="primary"
                    style={{
                        background: 'var(--accent-gradient)',
                        border: 'none',
                        padding: '0 2rem',
                        boxShadow: '0 4px 14px 0 rgba(138, 63, 252, 0.3)'
                    }}
                >
                    Add Contribution
                </Button>
            </div>

            <div style={{ padding: '0 0.5rem' }}>
                <h3 style={{ fontSize: '3rem', fontWeight: 900, margin: '2rem 0', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
                    {formatDate(currentDate)}
                </h3>
            </div>

            {/* Entries List */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0 0.5rem 2rem 0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '3rem'
            }}>
                {isLoading ? (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <InlineLoading description="Loading your day..." />
                    </div>
                ) : entries.length === 0 ? (
                    <div className="light-panel" style={{ padding: '4rem', textAlign: 'center', opacity: 0.6 }}>
                        <p>No contributions logged for this day yet.</p>
                        <Button kind="ghost" onClick={handleAddBlankEntry}>Add your first entry</Button>
                    </div>
                ) : (
                    entries.map((entry) => (
                        <div key={entry.id} className="entry-card light-panel" style={{
                            padding: '2.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2rem',
                            position: 'relative',
                            borderWidth: '2px',
                            background: 'white',
                            borderColor: entry.isNew ? 'var(--accent-primary)' : 'var(--text-primary)'
                        }}>
                            {/* Entry Metadata & Actions */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    {entry.time && <span style={{ fontWeight: 800, fontSize: '1.1rem', background: 'var(--accent-gradient-subtle)', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--accent-secondary)' }}>{entry.time}</span>}
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        {entry.tags.map(tag => (
                                            <DismissibleTag
                                                key={tag}
                                                type="cyan"
                                                onClose={() => handleRemoveTag(entry.id, tag)}
                                                text={tag}
                                                size="md"
                                                style={{ fontWeight: 800, borderRadius: '8px', border: '2px solid' }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <Button
                                        kind="danger--ghost"
                                        size="lg"
                                        hasIconOnly
                                        renderIcon={TrashCan}
                                        iconDescription="Delete"
                                        style={{
                                            borderRadius: '12px',
                                            border: '2px solid var(--text-primary)',
                                            width: '3.5rem',
                                            height: '3.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        onClick={() => {
                                            if (entry.isNew) {
                                                setEntries(prev => prev.filter(e => e.id !== entry.id));
                                            } else {
                                                setEntryToDelete(entry);
                                                setIsDeleteModalOpen(true);
                                            }
                                        }}
                                    />
                                    <Button
                                        kind="primary"
                                        size="lg"
                                        renderIcon={Save}
                                        onClick={() => handleSaveEntry(entry.id)}
                                        disabled={entry.isSaving}
                                        style={{
                                            padding: '0 2.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}
                                    >
                                        {entry.isSaving ? 'SAVING...' : 'SAVE'}
                                    </Button>
                                </div>
                            </div>

                            {/* Tag Input */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <TextInput
                                    id={`tag-input-${entry.id}`}
                                    labelText="Add Tags"
                                    hideLabel
                                    placeholder="Add tag..."
                                    size="sm"
                                    value={entry.newTag || ''}
                                    onChange={(e) => setEntries(prev => prev.map(ent => ent.id === entry.id ? { ...ent, newTag: e.target.value } : ent))}
                                    onKeyDown={(e) => handleTagInputKeyDown(entry.id, e)}
                                    style={{ maxWidth: '120px' }}
                                />
                                {entry.statusMessage && (
                                    <span style={{ fontSize: '0.85rem', color: 'var(--accent-secondary)', fontWeight: 800 }}>
                                        {entry.statusMessage}
                                    </span>
                                )}
                            </div>

                            {/* Content Area */}
                            <TextArea
                                labelText="Achievement Detail"
                                hideLabel
                                placeholder="Describe what you accomplished..."
                                value={entry.content}
                                onChange={(e) => updateEntryContent(entry.id, e.target.value)}
                                rows={4}
                                style={{
                                    fontFamily: 'var(--font-family)',
                                    fontSize: '1.2rem',
                                    lineHeight: '1.8',
                                    background: 'rgba(0,0,0,0.02)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 400 /* NOT BOLD AS REQUESTED */
                                }}
                            />
                        </div>
                    ))
                )}
            </div>

            <Modal
                open={isDeleteModalOpen}
                onRequestClose={() => setIsDeleteModalOpen(false)}
                onRequestSubmit={handleDeleteEntry}
                modalHeading="CONFIRM DELETION"
                primaryButtonText="DELETE FOREVER"
                secondaryButtonText="KEEP IT"
                danger
                className="premium-delete-modal"
            >
                <div style={{ padding: '2rem 0', textAlign: 'center' }}>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 900,
                        color: 'var(--text-primary)',
                        marginBottom: '1rem',
                        textTransform: 'uppercase'
                    }}>
                        Are you absolutely sure?
                    </div>
                    <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        This specific contribution will be purged from the archive.<br />
                        This action cannot be reversed.
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default DailyEditor;
