import React from 'react';
import { Paper, Typography, Box, Stack, Divider, Chip, Skeleton } from '@mui/material';
import { PieChart as TagIcon, Terminal as ArchiveIcon, EmojiEvents as TrophyIcon } from '@mui/icons-material';

export const MatrixContent = ({ loading, topTags }) => (
    <Box sx={{ height: '200px', display: 'flex', flexDirection: 'column' }}>
        <Divider sx={{ mb: 2, borderBottomWidth: '2px', borderColor: 'black' }} />
        <Stack spacing={1.5}>
            {loading ? (
                <Skeleton height={200} />
            ) : topTags.length > 0 ? (
                topTags.map(({ tag, count }) => (
                    <Box key={tag} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>{tag}</Typography>
                        <Chip
                            label={`${count}x`}
                            size="small"
                            sx={{
                                fontWeight: 900,
                                bgcolor: 'primary.main',
                                color: 'white',
                                height: '20px'
                            }}
                        />
                    </Box>
                ))
            ) : (
                <Typography sx={{ opacity: 0.5, fontStyle: 'italic' }}>No tags yet.</Typography>
            )}
        </Stack>
    </Box>
);

export const PersonaContent = ({ loading, persona }) => (
    <Box>
        <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
            <TrophyIcon sx={{ fontSize: '10rem' }} />
        </Box>
        <ArchiveIcon sx={{ fontSize: '3rem', mb: 2 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 900, letterSpacing: '0.2em', opacity: 0.8, mb: 1 }}>SYSTEM PERSONA</Typography>
        <Typography variant="h4" sx={{ fontWeight: 950, lineHeight: 1.1 }}>{loading ? '...' : persona}</Typography>
    </Box>
);
