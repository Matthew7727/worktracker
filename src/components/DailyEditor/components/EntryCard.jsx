import React, { useState, useRef } from 'react';
import {
    Paper, Box, Stack, Typography, IconButton, Button,
    Chip, TextField, CircularProgress, Tooltip, Collapse
} from '@mui/material';
import {
    Save, Delete, AccessTime, LocalOffer,
    FormatBold, FormatItalic, Abc, Title,
    List as ListIcon, Link as LinkIcon, Edit, KeyboardArrowDown, KeyboardArrowUp,
    Code as CodeIcon, FormatStrikethrough, FormatQuote,
    FormatAlignLeft, FormatAlignCenter, FormatAlignRight
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import { cardStyles, entryBodyStyles, markdownToolbarStyles, toolbarBtnStyles } from '../DailyEditor.styles';
import { injectMarkdown } from '../../../utils/markdownHelpers';

const EntryCard = ({ entry, onSave, onDelete, onUpdateContent, onUpdateTags, onAddTag, onRemoveTag }) => {
    const [isEditing, setIsEditing] = useState(entry.isNew || false);
    const [isExpanded, setIsExpanded] = useState(false);
    const textareaRef = useRef(null);

    const handleToolbarAction = (type) => {
        const textarea = textareaRef.current?.querySelector('textarea');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const { newText, newCursor } = injectMarkdown(entry.content, start, end, type);
        onUpdateContent(entry.id, newText);

        // Reset focus and cursor after state update
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newCursor, newCursor);
        }, 0);
    };

    const handleSave = async () => {
        await onSave(entry.id);
        setIsEditing(false);
    };

    const handleLinkClick = (e, url) => {
        e.preventDefault();
        if (window.electronAPI && window.electronAPI.openExternal) {
            window.electronAPI.openExternal(url);
        } else {
            window.open(url, '_blank');
        }
    };

    const isLongContent = entry.content.length > 300;
    const displayContent = (!isEditing && !isExpanded && isLongContent)
        ? entry.content.substring(0, 300) + '...'
        : entry.content;

    return (
        <Paper
            sx={{
                ...cardStyles,
                borderColor: entry.isNew ? 'primary.main' : 'black',
            }}
        >
            {/* Header Area */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    {entry.time && (
                        <Chip
                            icon={<AccessTime sx={{ fontSize: '1.2rem !important' }} />}
                            label={entry.time === 'PAST' ? 'PAST' : entry.time}
                            sx={{
                                bgcolor: entry.time === 'PAST' ? 'rgba(211, 47, 47, 0.15)' : 'rgba(128, 182, 33, 0.15)',
                                color: entry.time === 'PAST' ? '#d32f2f' : 'primary.main',
                                border: '1px solid currentColor',
                                fontWeight: 900,
                                fontSize: '1rem'
                            }}
                        />
                    )}
                    {isEditing && (
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
                                startAdornment: <LocalOffer sx={{ mr: 1, fontSize: '0.9rem', opacity: 0.5 }} />,
                                sx: {
                                    height: '32px',
                                    fontSize: '0.85rem',
                                    fontWeight: 800,
                                    borderRadius: '8px',
                                    bgcolor: 'rgba(0,0,0,0.03)',
                                    '& fieldset': { border: 'none', borderColor: 'transparent' },
                                    '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.1)' },
                                    '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                                }
                            }}
                            sx={{ width: '130px' }}
                        />
                    )}
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {entry.tags.map(tag => (
                            <Chip
                                key={tag}
                                label={tag}
                                onDelete={isEditing ? () => onRemoveTag(entry.id, tag) : undefined}
                                color="secondary"
                                variant="outlined"
                                sx={{ borderWidth: '2px', fontWeight: 900, '&:hover': { borderWidth: '2px' } }}
                            />
                        ))}
                    </Stack>
                </Stack>
                <Stack direction="row" spacing={2}>
                    {!isEditing && (
                        <IconButton
                            onClick={() => setIsEditing(true)}
                            aria-label="Edit contribution"
                            sx={{ border: '2px solid black', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
                        >
                            <Edit />
                        </IconButton>
                    )}
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
                    {isEditing && (
                        <Button
                            variant="contained"
                            startIcon={entry.isSaving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                            onClick={handleSave}
                            disabled={entry.isSaving}
                            sx={{ px: 4 }}
                        >
                            {entry.isSaving ? 'SAVING...' : 'SAVE'}
                        </Button>
                    )}
                </Stack>
            </Box>

            {/* Markdown Toolbar (Only when editing) */}
            <Collapse in={isEditing}>
                <Box sx={{ ...markdownToolbarStyles, flexWrap: 'wrap', mt: 2 }}>
                    <Tooltip title="Bold">
                        <IconButton size="small" sx={toolbarBtnStyles} onClick={() => handleToolbarAction('bold')}><FormatBold /></IconButton>
                    </Tooltip>
                    <Tooltip title="Italic">
                        <IconButton size="small" sx={toolbarBtnStyles} onClick={() => handleToolbarAction('italic')}><FormatItalic /></IconButton>
                    </Tooltip>
                    <Tooltip title="Strikethrough">
                        <IconButton size="small" sx={toolbarBtnStyles} onClick={() => handleToolbarAction('strikethrough')}><FormatStrikethrough /></IconButton>
                    </Tooltip>
                    <Box sx={{ width: '2px', height: '20px', bgcolor: 'rgba(0,0,0,0.1)', mx: 0.5 }} />
                    <Tooltip title="Align Left">
                        <IconButton size="small" sx={toolbarBtnStyles} onClick={() => handleToolbarAction('align-left')}><FormatAlignLeft /></IconButton>
                    </Tooltip>
                    <Tooltip title="Align Center">
                        <IconButton size="small" sx={toolbarBtnStyles} onClick={() => handleToolbarAction('align-center')}><FormatAlignCenter /></IconButton>
                    </Tooltip>
                    <Tooltip title="Align Right">
                        <IconButton size="small" sx={toolbarBtnStyles} onClick={() => handleToolbarAction('align-right')}><FormatAlignRight /></IconButton>
                    </Tooltip>
                    <Box sx={{ width: '2px', height: '20px', bgcolor: 'rgba(0,0,0,0.1)', mx: 0.5 }} />
                    <Tooltip title="Heading">
                        <IconButton size="small" sx={toolbarBtnStyles} onClick={() => handleToolbarAction('heading')}><Title /></IconButton>
                    </Tooltip>
                    <Tooltip title="List">
                        <IconButton size="small" sx={toolbarBtnStyles} onClick={() => handleToolbarAction('list')} aria-label="Add list item"><ListIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Blockquote">
                        <IconButton size="small" sx={toolbarBtnStyles} onClick={() => handleToolbarAction('blockquote')}><FormatQuote /></IconButton>
                    </Tooltip>
                    <Tooltip title="Code">
                        <IconButton size="small" sx={toolbarBtnStyles} onClick={() => handleToolbarAction('code')}><CodeIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Link">
                        <IconButton size="small" sx={toolbarBtnStyles} onClick={() => handleToolbarAction('link')}><LinkIcon /></IconButton>
                    </Tooltip>
                </Box>
            </Collapse>

            {/* Content Area */}
            <Box sx={{ position: 'relative' }}>
                {isEditing ? (
                    <TextField
                        ref={textareaRef}
                        multiline
                        rows={6}
                        fullWidth
                        placeholder="Describe what you accomplished..."
                        value={entry.content}
                        onChange={(e) => onUpdateContent(entry.id, e.target.value)}
                        variant="filled"
                        InputProps={entryBodyStyles}
                    />
                ) : (
                    <Box
                        onClick={() => setIsEditing(true)}
                        sx={{
                            ...entryBodyStyles.sx,
                            cursor: 'pointer',
                            minHeight: '100px',
                            position: 'relative',
                            overflow: 'hidden',
                            // Tighten up paragraph spacing
                            '& p': { mb: 0.5, mt: 0, '&:last-child': { mb: 0 } },
                            '& ul, & ol': { pl: 3, mb: 1, mt: 0 },
                            '& li': { mb: 0.2 },
                            '& div': { mb: 1 } // For alignment divs
                        }}
                    >
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkBreaks]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                a: ({ ...props }) => (
                                    <a
                                        {...props}
                                        onClick={(e) => handleLinkClick(e, props.href)}
                                        style={{ color: '#80b621', textDecoration: 'underline', cursor: 'pointer' }}
                                    />
                                )
                            }}
                        >
                            {displayContent || '*Click to add content...*'}
                        </ReactMarkdown>

                        {isLongContent && (
                            <Button
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(!isExpanded);
                                }}
                                startIcon={isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                sx={{
                                    fontWeight: 800,
                                    mt: 1,
                                    color: 'primary.main',
                                    '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                                }}
                            >
                                {isExpanded ? 'Show Less' : 'Read More'}
                            </Button>
                        )}
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

export default EntryCard;
