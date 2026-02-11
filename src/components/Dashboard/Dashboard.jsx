import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Skeleton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Fade,
    Grid,
    Divider
} from '@mui/material';
import { useAppContext } from '../../context/AppContext';
import { loadAllEntries } from '../../utils/DataManager';
import { useNavigate } from 'react-router-dom';
import ContributionGraph from './ContributionGraph';

// Sub-components
import { StatContent } from './components/SummaryTiles';
import DashboardWidget from './components/DashboardWidget';
import WeeklyChart from './WeeklyChart';
import { MatrixContent, PersonaContent } from './components/StatsCards';
import RecentActivityContent from './components/RecentActivity';
import TodoSummaryContent from './components/TodoSummary';
import {
    EventAvailable,
    AutoGraph as TotalIcon,
    LocalFireDepartment as StreakIcon
} from '@mui/icons-material';

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
            <Box className="dashboard-page" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="h1" sx={{ fontSize: '2.5rem', mb: 1 }}>Dashboard</Typography>
                <Box sx={{ width: '100%' }}>
                    <Grid container spacing={3} justifyContent="center">
                        <DashboardWidget
                            title="ACTIVE DAYS"
                            icon={<EventAvailable sx={{ color: 'primary.main', fontSize: '2rem' }} />}
                            xs={3}
                            contentSx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <StatContent
                                value={stats.totalDays}
                                subtitle="Total archive dates"
                                loading={loading}
                            />
                        </DashboardWidget>
                        <DashboardWidget
                            title="TOTAL LOGS"
                            icon={<TotalIcon sx={{ color: 'secondary.main', fontSize: '2rem' }} />}
                            xs={3}
                            contentSx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '100%' }}>
                            <StatContent
                                value={stats.totalEntries}
                                subtitle="Discrete contributions"
                                loading={loading}
                            />
                        </DashboardWidget>
                        <DashboardWidget
                            title="STREAK"
                            icon={<StreakIcon sx={{ color: '#eb8449ff', fontSize: '2rem' }} />}
                            xs={3}
                            contentSx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <StatContent
                                value={`${stats.currentStreak}D`}
                                subtitle="Consecutive productivity"
                                loading={loading}
                            />
                            <Divider sx={{ my: 1 }} />
                        </DashboardWidget>
                        <DashboardWidget
                            title=" ALL-TIME HIGH"
                            icon={<StreakIcon sx={{ color: '#f50000ff', fontSize: '2rem' }} />}
                            xs={3}
                            contentSx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <StatContent
                                value={`${stats.longestStreak}D`}
                                subtitle="All-time high record"
                                loading={loading}
                            />
                            <Divider sx={{ my: 1 }} />
                        </DashboardWidget>

                        <DashboardWidget title="Weekly Distribution" xs={6}>
                            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                                {loading ? <Skeleton variant="rectangular" width="100%" /> : <WeeklyChart entries={allEntries} />}
                            </Box>
                        </DashboardWidget>
                        <DashboardWidget xs={6}>
                            <TodoSummaryContent />
                        </DashboardWidget>

                        <DashboardWidget title="Tag Matrix" xs={12}>
                            <MatrixContent loading={loading} topTags={stats.topTags} />
                        </DashboardWidget>

                        <DashboardWidget xs={6} sx={{ bgcolor: 'primary.main', color: 'white' }}>
                            <PersonaContent loading={loading} persona={stats.persona} />
                        </DashboardWidget>

                        <DashboardWidget title="Annual Archive Pipeline" xs={6}>
                            {loading ? <Skeleton variant="rectangular" height={150} /> : <ContributionGraph entries={allEntries} />}
                        </DashboardWidget>

                        <DashboardWidget title="Recent Activity" xs={12}>
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
                        <Button variant="outlined" onClick={() => setIsDeleteModalOpen(false)} sx={{ px: 4, borderWidth: 2, fontWeight: 700, borderColor: 'black', color: 'black', '&:hover': { borderWidth: 2, bgcolor: 'action.hover' } }}>
                            KEEP CONTRIBUTION
                        </Button>
                        <Button variant="contained" color="error" onClick={confirmDelete} sx={{ px: 4, bgcolor: 'error.main', border: '2px solid black', boxShadow: '4px 4px 0px black', fontWeight: 700, '&:hover': { transform: 'translate(-2px,-2px)', boxShadow: '6px 6px 0px black' } }}>
                            PERMANENTLY DELETE
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Fade >
    );
};

export default Dashboard;
