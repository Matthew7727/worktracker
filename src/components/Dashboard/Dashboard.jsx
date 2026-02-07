import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Skeleton,
    List,
    ListItem,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Stack,
    Fade,
    Divider,
    Tooltip
} from '@mui/material';
import {
    Delete,
    TrendingUp,
    EventAvailable,
    LocalFireDepartment as StreakIcon,
    AutoGraph as TotalIcon,
    PieChart as TagIcon,
    EmojiEvents as TrophyIcon,
    Terminal as ArchiveIcon
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';
import { loadAllEntries } from '../../utils/DataManager';
import { useNavigate } from 'react-router-dom';
import ContributionGraph from './ContributionGraph';
import WeeklyChart from './WeeklyChart';

const Dashboard = () => {
    const { selectedDirectory, refreshTrigger, showNotification } = useAppContext();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalDays: 0,
        totalEntries: 0,
        topTags: [],
        recentEntries: [],
        currentStreak: 0,
        longestStreak: 0,
        persona: 'INITIATING...'
    });
    const [loading, setLoading] = useState(true);
    const [allEntries, setAllEntries] = useState([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState(null);

    const handleDeleteClick = (e, entry) => {
        e.stopPropagation();
        setEntryToDelete(entry);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!entryToDelete || !selectedDirectory) return;
        try {
            const result = await window.electronAPI.deleteFile(entryToDelete.path);
            if (result.success) {
                showNotification('Entry purged from history', 'info');
            }
        } catch (error) {
            console.error('Failed to delete:', error);
            showNotification('Deletion failed', 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setEntryToDelete(null);
        }
    };

    const calculateStreaks = (uniqueDates) => {
        if (uniqueDates.length === 0) return { current: 0, longest: 0 };
        const sortedDates = [...uniqueDates].sort().reverse();
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (sortedDates[0] === today || sortedDates[0] === yesterday) {
            currentStreak = 1;
            for (let i = 0; i < sortedDates.length - 1; i++) {
                const d1 = new Date(sortedDates[i]);
                const d2 = new Date(sortedDates[i + 1]);
                const diff = (d1 - d2) / (1000 * 60 * 60 * 24);
                if (diff === 1) currentStreak++;
                else break;
            }
        }

        tempStreak = 1;
        longestStreak = 1;
        for (let i = 0; i < sortedDates.length - 1; i++) {
            const d1 = new Date(sortedDates[i]);
            const d2 = new Date(sortedDates[i + 1]);
            const diff = (d1 - d2) / (1000 * 60 * 60 * 24);
            if (diff === 1) {
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                tempStreak = 1;
            }
        }
        return { current: currentStreak, longest: longestStreak };
    };

    const determinePersona = (totalDays, avgLogs, streak) => {
        if (totalDays === 0) return 'READY FOR ACTION';
        if (streak >= 7) return 'CONSISTENCY KING';
        if (avgLogs >= 3) return 'ARCHIVE ARCHITECT';
        if (totalDays >= 30) return 'LEGACY BUILDER';
        return 'PRODUCTIVITY SCOUT';
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!selectedDirectory) return;
            setLoading(true);
            try {
                const resolvedEntries = await loadAllEntries(selectedDirectory);
                setAllEntries(resolvedEntries);

                const uniqueDates = Array.from(new Set(resolvedEntries.map(e => e.date)));
                const streaks = calculateStreaks(uniqueDates);
                const avgLogs = resolvedEntries.length / (uniqueDates.length || 1);
                const persona = determinePersona(uniqueDates.length, avgLogs, streaks.current);

                const tagCounts = {};
                resolvedEntries.forEach(entry => {
                    if (entry.tags && Array.isArray(entry.tags)) {
                        entry.tags.forEach(tag => {
                            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                        });
                    }
                });

                const sortedTags = Object.entries(tagCounts)
                    .sort(([, countA], [, countB]) => countB - countA)
                    .slice(0, 8)
                    .map(([tag, count]) => ({ tag, count }));

                setStats({
                    totalDays: uniqueDates.length,
                    totalEntries: resolvedEntries.length,
                    topTags: sortedTags,
                    recentEntries: resolvedEntries.slice(0, 5),
                    currentStreak: streaks.current,
                    longestStreak: streaks.longest,
                    persona
                });
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedDirectory, refreshTrigger]);

    const SummaryCard = ({ title, value, icon, subtitle }) => (
        <Paper
            sx={{
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '3px solid black',
                borderRadius: '24px',
                transition: 'all 0.2s',
                '&:hover': { transform: 'scale(1.02)', boxShadow: '0 8px 0 black' }
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" sx={{ letterSpacing: '0.1em', fontWeight: 900, opacity: 0.5 }}>{title}</Typography>
                {icon}
            </Stack>
            <Box sx={{ mt: 2 }}>
                <Typography variant="h2" sx={{ fontWeight: 950, letterSpacing: '-0.04em' }}>
                    {loading ? <Skeleton width="80px" /> : value}
                </Typography>
                {subtitle && (
                    <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.6, textTransform: 'uppercase' }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
        </Paper>
    );

    const handleEntryClick = (dateStr) => {
        navigate('/', { state: { initialDate: dateStr } });
    };

    return (
        <Fade in={true} timeout={600}>
            <Box className="dashboard-page" sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Typography variant="h1">Dashboard</Typography>

                <Grid container spacing={4}>
                    <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard
                            title="ACTIVE DAYS"
                            value={stats.totalDays}
                            icon={<EventAvailable sx={{ color: 'primary.main', fontSize: '2rem' }} />}
                            subtitle="Total archive dates"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard
                            title="TOTAL LOGS"
                            value={stats.totalEntries}
                            icon={<TotalIcon sx={{ color: 'secondary.main', fontSize: '2rem' }} />}
                            subtitle="Discrete contributions"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard
                            title="CURRENT STREAK"
                            value={`${stats.currentStreak}D`}
                            icon={<StreakIcon sx={{ color: '#ff5c00', fontSize: '2rem' }} />}
                            subtitle="Consecutive productivity"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard
                            title="LONGEST STREAK"
                            value={`${stats.longestStreak}D`}
                            icon={<StreakIcon sx={{ color: '#ffb800', fontSize: '2rem' }} />}
                            subtitle="All-time high record"
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={4}>
                    <Grid item xs={12} lg={6}>
                        {/* Weekly Breakdown */}
                        <Paper sx={{ p: 4, borderRadius: '24px', border: '3px solid black', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h5" sx={{ mb: 4, fontWeight: 900 }}>Weekly Distribution</Typography>
                            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                                {loading ? <Skeleton variant="rectangular" width="100%" height={200} /> : <WeeklyChart entries={allEntries} />}
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        {/* Tag distribution / Trending */}
                        <Paper sx={{ p: 4, borderRadius: '24px', border: '3px solid black', height: '100%' }}>
                            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                                <TagIcon color="primary" />
                                <Typography variant="h5" sx={{ fontWeight: 900 }}>Matrix</Typography>
                            </Stack>
                            <Divider sx={{ mb: 2, borderBottomWidth: '2px', borderColor: 'black' }} />
                            <Stack spacing={1.5}>
                                {loading ? (
                                    <Skeleton height={200} />
                                ) : stats.topTags.length > 0 ? (
                                    stats.topTags.map(({ tag, count }) => (
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
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        {/* Persona / Achievement Card */}
                        <Paper
                            sx={{
                                p: 4,
                                borderRadius: '24px',
                                border: '3px solid black',
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
                            <Typography variant="h4" sx={{ fontWeight: 950, lineHeight: 1.1 }}>{loading ? '...' : stats.persona}</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Contribution Graph */}
                <Paper sx={{ p: 4, borderRadius: '24px', border: '3px solid black' }}>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 900 }}>Annual Archive Pipeline</Typography>
                    {loading ? <Skeleton variant="rectangular" height={150} /> : <ContributionGraph entries={allEntries} />}
                </Paper>

                <Grid container spacing={6}>
                    {/* Recent Activity */}
                    <Grid item xs={12}>
                        <Typography variant="h4" sx={{ mb: 3, fontWeight: 950 }}>Recent Activity</Typography>
                        <Paper sx={{ p: 4, borderRadius: '24px', border: '3px solid black' }}>
                            {loading ? (
                                <Stack spacing={2}><Skeleton height={80} /><Skeleton height={80} /></Stack>
                            ) : stats.recentEntries.length > 0 ? (
                                <Grid container spacing={2}>
                                    {stats.recentEntries.map((entry) => (
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
                                                onClick={() => handleEntryClick(entry.date)}
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
                                                    onClick={(e) => handleDeleteClick(e, entry)}
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
                                    <Button variant="outlined" onClick={() => navigate('/')}>Log something</Button>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>

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
                            The entry for <strong>{entryToDelete?.date}</strong> will be purged.<br />
                            This action is irreversible and final.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
                        <Button variant="outlined" onClick={() => setIsDeleteModalOpen(false)} sx={{ px: 4 }}>
                            KEEP CONTRIBUTION
                        </Button>
                        <Button variant="contained" color="error" onClick={confirmDelete} sx={{ px: 4, bgcolor: 'error.main', border: 'none' }}>
                            PERMANENTLY DELETE
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Fade>
    );
};

export default Dashboard;
