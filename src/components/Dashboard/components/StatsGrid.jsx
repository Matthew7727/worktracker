import React from 'react';
import { Grid, Paper, Typography, Box, Stack, Divider, Chip, Skeleton } from '@mui/material';
import { PieChart as TagIcon, Terminal as ArchiveIcon, EmojiEvents as TrophyIcon } from '@mui/icons-material';
import WeeklyChart from '../WeeklyChart';
import { boldBorder } from '../Dashboard.styles';

const MatrixCard = ({ loading, topTags }) => (
    <Paper sx={{ ...boldBorder, p: 3, height: '100%' }}>
        <Stack direction="row" spacing={2} alignItems="center" mb={3}>
            <TagIcon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: 900 }}>Matrix</Typography>
        </Stack>
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
    </Paper>
);

const PersonaCard = ({ loading, persona }) => (
    <Paper
        sx={{
            ...boldBorder,
            p: 3,
            height: '100%',
            bgcolor: 'primary.main',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}
    >
        <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
            <TrophyIcon sx={{ fontSize: '10rem' }} />
        </Box>
        <ArchiveIcon sx={{ fontSize: '3rem', mb: 2 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 900, letterSpacing: '0.2em', opacity: 0.8, mb: 1 }}>SYSTEM PERSONA</Typography>
        <Typography variant="h4" sx={{ fontWeight: 950, lineHeight: 1.1 }}>{loading ? '...' : persona}</Typography>
    </Paper>
);

const StatsGrid = ({ loading, allEntries, topTags, persona }) => {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
                <Paper sx={{ ...boldBorder, p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h5" sx={{ mb: 4, fontWeight: 900 }}>Weekly Distribution</Typography>
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                        {loading ? <Skeleton variant="rectangular" width="100%" height={200} /> : <WeeklyChart entries={allEntries} />}
                    </Box>
                </Paper>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
                <MatrixCard loading={loading} topTags={topTags} />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
                <PersonaCard loading={loading} persona={persona} />
            </Grid>
        </Grid>
    );
};

export default StatsGrid;
