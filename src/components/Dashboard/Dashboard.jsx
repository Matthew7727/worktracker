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
    Fade
} from '@mui/material';
import { useAppContext } from '../../context/AppContext';
import { loadAllEntries } from '../../utils/DataManager';
import { useNavigate } from 'react-router-dom';
import ContributionGraph from './ContributionGraph';

// Sub-components
import SummaryTiles from './components/SummaryTiles';
import StatsGrid from './components/StatsGrid';
import RecentActivity from './components/RecentActivity';
import { boldBorder } from './Dashboard.styles';

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
            <Box className="dashboard-page" sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Typography variant="h1">Dashboard</Typography>

                <SummaryTiles stats={stats} loading={loading} />

                <StatsGrid
                    loading={loading}
                    allEntries={allEntries}
                    topTags={stats.topTags}
                    persona={stats.persona}
                />

                <Paper sx={{ ...boldBorder, p: 4 }}>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 900 }}>Annual Archive Pipeline</Typography>
                    {loading ? <Skeleton variant="rectangular" height={150} /> : <ContributionGraph entries={allEntries} />}
                </Paper>

                <RecentActivity
                    loading={loading}
                    recentEntries={stats.recentEntries}
                    onEntryClick={handleEntryClick}
                    onDeleteClick={(entry) => {
                        setEntryToDelete(entry);
                        setIsDeleteModalOpen(true);
                    }}
                />

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
