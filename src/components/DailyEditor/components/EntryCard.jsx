import React from 'react';
import { Paper, Box, Stack, Typography, IconButton, Button, Chip, TextField, CircularProgress } from '@mui/material';
import { Save, Delete, AccessTime, LocalOffer } from '@mui/icons-material';
import { cardStyles, entryBodyStyles } from '../DailyEditor.styles';

const EntryCard = ({ entry, onSave, onDelete, onUpdateContent, onUpdateTags, onAddTag, onRemoveTag }) => {
    return (
        <Paper
            sx={{
                ...cardStyles,
                borderColor: entry.isNew ? 'primary.main' : 'black',
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
                                onDelete={() => onRemoveTag(entry.id, tag)}
                                color="secondary"
                                variant="outlined"
                                sx={{ borderWidth: '2px', fontWeight: 900, '&:hover': { borderWidth: '2px' } }}
                            />
                        ))}
                    </Stack>
                </Stack>
                <Stack direction="row" spacing={2}>
                    <IconButton
                        onClick={() => onDelete(entry)}
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
                        onClick={() => onSave(entry.id)}
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
                    onChange={(e) => onUpdateTags(entry.id, e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            onAddTag(entry.id);
                        }
                    }}
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
                onChange={(e) => onUpdateContent(entry.id, e.target.value)}
                variant="filled"
                InputProps={entryBodyStyles}
            />
        </Paper>
    );
};

export default EntryCard;
