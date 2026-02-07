import React from 'react';
import { Box, Typography, Paper, Stack, List, ListItem, Chip, IconButton, Skeleton, Button, Grid } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { boldBorder } from '../Dashboard.styles';

const RecentActivity = ({ loading, recentEntries, onEntryClick, onDeleteClick }) => {
    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 950 }}>Recent Activity</Typography>
            <Paper sx={{ ...boldBorder, p: 4 }}>
                {loading ? (
                    <Stack spacing={2}><Skeleton height={80} /><Skeleton height={80} /></Stack>
                ) : recentEntries.length > 0 ? (
                    <Grid container spacing={2}>
                        {recentEntries.map((entry) => (
                            <Grid item xs={12} key={entry.id}>
                                <ListItem
                                    disablePadding
                                    sx={{
                                        p: 3,
                                        borderRadius: '16px',
                                        bgcolor: 'rgba(0,0,0,0.02)',
                                        border: '2px solid transparent',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        '&:hover': { borderColor: 'black', bgcolor: 'white' },
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                    onClick={() => onEntryClick(entry.date)}
                                >
                                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                        <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                                            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 900 }}>{entry.date}</Typography>
                                            {entry.time && (
                                                <Chip
                                                    label={entry.time}
                                                    size="small"
                                                    sx={{ fontWeight: 900, bgcolor: 'secondary.light', color: 'secondary.main' }}
                                                />
                                            )}
                                        </Stack>
                                        <Typography
                                            variant="body2"
                                            noWrap
                                            sx={{ opacity: 0.7, fontStyle: 'italic', fontWeight: 600 }}
                                        >
                                            {entry.content || 'No content'}
                                        </Typography>
                                        <Stack direction="row" spacing={1} mt={1.5}>
                                            {entry.tags?.map(tag => (
                                                <Chip
                                                    key={tag}
                                                    label={tag}
                                                    size="small"
                                                    sx={{ fontWeight: 900, border: '2px solid black' }}
                                                />
                                            ))}
                                        </Stack>
                                    </Box>
                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteClick(entry);
                                        }}
                                        sx={{
                                            ml: 2,
                                            border: '2px solid black',
                                            '&:hover': { bgcolor: 'error.main', color: 'white', borderColor: 'error.main' }
                                        }}
                                    >
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </ListItem>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Box sx={{ p: 4, textAlign: 'center', opacity: 0.5 }}>
                        <Typography sx={{ mb: 2, fontWeight: 700 }}>No entries found yet.</Typography>
                        <Button variant="outlined" onClick={() => onEntryClick(new Date().toISOString().split('T')[0])}>Log something</Button>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default RecentActivity;
