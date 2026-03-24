import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Skeleton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Fade,
    Grid,
    Divider,
    Stack,
    LinearProgress
} from '@mui/material';
import { useAppContext } from '../../context/AppContext';
import { loadAllEntries } from '../../utils/DataManager';
import { useNavigate } from 'react-router-dom';
import ContributionGraph from './ContributionGraph';

// Sub-components
import { StatContent } from './components/SummaryTiles';
import DashboardWidget from './components/DashboardWidget';
import WeeklyChart from './WeeklyChart';
import RecentActivityContent from './components/RecentActivity';
import TodoSummaryContent from './components/TodoSummary';
import {
    EventAvailable,
    Speed as BalanceIcon,
    History as RecentIcon,
    LocalFireDepartment as StreakIcon,
    MenuBook as TotalWordsIcon
} from '@mui/icons-material';

const STREAM_COLORS = {
    clientWork: '#80b621',
    practiceDevelopment: '#4a6b13',
    businessDevelopment: '#eb8449'
};

const Dashboard = () => {
    const { selectedDirectory, refreshTrigger, showNotification } = useAppContext();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalDays: 0,
        totalWords: 0,
        currentStreak: 0,
        balanceScore: 0,
        streamBreakdown: { clientWork: 0, practiceDevelopment: 0, businessDevelopment: 0 },
        recentEntries: []
    });
    const [loading, setLoading] = useState(true);
    const [allEntries, setAllEntries] = useState([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState(null);

    const calculateStreaks = (uniqueDates) => {
        if (uniqueDates.length === 0) return { current: 0 };
        const sortedDates = [...uniqueDates].sort().reverse();
        let currentStreak = 0;
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
        return { current: currentStreak };
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
                
                const streamBreakdown = { clientWork: 0, practiceDevelopment: 0, businessDevelopment: 0 };
                let totalWords = 0;

                resolvedEntries.forEach(entry => {
                    if (entry.streamCounts) {
                        streamBreakdown.clientWork += entry.streamCounts.clientWork;
                        streamBreakdown.practiceDevelopment += entry.streamCounts.practiceDevelopment;
                        streamBreakdown.businessDevelopment += entry.streamCounts.businessDevelopment;
                        totalWords += entry.totalWords;
                    }
                });

                // Balance Score: 100 is perfect 33/33/33 split
                const counts = Object.values(streamBreakdown);
                const sum = counts.reduce((a, b) => a + b, 0);
                let balanceScore = 0;
                if (sum > 0) {
                    const percentages = counts.map(c => (c / sum) * 100);
                    const ideal = 33.33;
                    const variance = percentages.reduce((acc, p) => acc + Math.abs(p - ideal), 0);
                    balanceScore = Math.max(0, Math.round(100 - (variance / 1.33))); // Normalized
                }

                setStats({
                    totalDays: uniqueDates.length,
                    totalWords,
                    currentStreak: streaks.current,
                    balanceScore,
                    streamBreakdown,
                    recentEntries: resolvedEntries.slice(0, 5)
                });
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedDirectory, refreshTrigger]);

    const handleEntryClick = (dateStr) => {
        navigate('/', { state: { initialDate: dateStr } });
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

    return (
        <Fade in={true} timeout={600}>
            <Box className="dashboard-page" sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 10 }}>
                <Typography variant="h1" sx={{ fontSize: '3rem', mb: 1, fontWeight: 950 }}>DASHBOARD</Typography>
                
                <Box sx={{ width: '100%' }}>
                    <Grid container spacing={3}>
                        {/* Top Stats */}
                        <DashboardWidget title="ACTIVE DAYS" icon={<EventAvailable color="primary" />} xs={3}>
                            <StatContent value={stats.totalDays} subtitle="Days Logged" loading={loading} />
                        </DashboardWidget>
                        
                        <DashboardWidget title="TOTAL WORDS" icon={<TotalWordsIcon color="secondary" />} xs={3}>
                            <StatContent value={stats.totalWords.toLocaleString()} subtitle="Across all streams" loading={loading} />
                        </DashboardWidget>

                        <DashboardWidget title="STREAK" icon={<StreakIcon sx={{ color: '#eb8449' }} />} xs={3}>
                            <StatContent value={`${stats.currentStreak}D`} subtitle="Consecutive Days" loading={loading} />
                        </DashboardWidget>

                        <DashboardWidget title="BALANCE SCORE" icon={<BalanceIcon color="primary" />} xs={3}>
                            <StatContent value={`${stats.balanceScore}%`} subtitle="Stream Focus Balance" loading={loading} />
                        </DashboardWidget>

                        {/* Weekly Distribution */}
                        <DashboardWidget title="Weekly Intensity (Words)" xs={8}>
                            {loading ? <Skeleton variant="rectangular" height={220} /> : <WeeklyChart entries={allEntries} />}
                        </DashboardWidget>

                        {/* Stream Mix */}
                        <DashboardWidget title="Stream Breakdown" xs={4}>
                            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3, px: 2 }}>
                                {loading ? (
                                    <Skeleton variant="rectangular" height={150} />
                                ) : (
                                    <>
                                        <StreamBar label="Client Work" value={stats.streamBreakdown.clientWork} total={stats.totalWords} color={STREAM_COLORS.clientWork} />
                                        <StreamBar label="Practice Dev" value={stats.streamBreakdown.practiceDevelopment} total={stats.totalWords} color={STREAM_COLORS.practiceDevelopment} />
                                        <StreamBar label="Business Dev" value={stats.streamBreakdown.businessDevelopment} total={stats.totalWords} color={STREAM_COLORS.businessDevelopment} />
                                    </>
                                )}
                            </Box>
                        </DashboardWidget>

                        {/* Annual Graph */}
                        <DashboardWidget title="Annual Archive Pipeline" xs={12}>
                            {loading ? <Skeleton variant="rectangular" height={150} /> : <ContributionGraph entries={allEntries} />}
                        </DashboardWidget>

                        <DashboardWidget title="TODO SUMMARY" xs={6}>
                            <TodoSummaryContent />
                        </DashboardWidget>

                        <DashboardWidget title="RECENT SESSIONS" icon={<RecentIcon />} xs={6}>
                            <RecentActivityContent
                                loading={loading}
                                recentEntries={stats.recentEntries}
                                onEntryClick={handleEntryClick}
                                onDeleteClick={(entry) => {
                                    setEntryToDelete(entry);
                                    setIsDeleteModalOpen(true);
                                }}
                            />
                        </DashboardWidget>
                    </Grid>
                </Box>

                <Dialog
                    open={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    PaperProps={{
                        sx: { borderRadius: '24px', border: '4px solid black', p: 3, boxShadow: '8px 8px 0px #000' }
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
                        <Button variant="outlined" onClick={() => setIsDeleteModalOpen(false)} sx={{ px: 4, borderWidth: 2, fontWeight: 700, borderColor: 'black', color: 'black' }}>
                            KEEP CONTRIBUTION
                        </Button>
                        <Button variant="contained" color="error" onClick={confirmDelete} sx={{ px: 4, bgcolor: 'error.main', border: '2px solid black', boxShadow: '4px 4px 0px black', fontWeight: 700 }}>
                            PERMANENTLY DELETE
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Fade >
    );
};

const StreamBar = ({ label, value, total, color }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 900 }}>{label}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 900 }}>{Math.round(percentage)}%</Typography>
            </Stack>
            <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{
                    height: 12,
                    borderRadius: 6,
                    border: '2px solid black',
                    bgcolor: 'white',
                    '& .MuiLinearProgress-bar': {
                        bgcolor: color,
                    }
                }}
            />
            <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.6 }}>{value.toLocaleString()} words total</Typography>
        </Box>
    );
};

export default Dashboard;
