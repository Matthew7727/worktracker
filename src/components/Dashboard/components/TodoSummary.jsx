
import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Stack, CircularProgress } from '@mui/material';
import { Checklist, RadioButtonUnchecked, HourglassEmpty, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { loadDailyTodos } from '../../../utils/todoManager';
import { useAppContext } from '../../../context/AppContext';
import { boldBorder } from '../Dashboard.styles';

const TodoSummary = () => {
    const { selectedDirectory, refreshTrigger } = useAppContext();
    const navigate = useNavigate();
    const [counts, setCounts] = useState({ todo: 0, inProgress: 0, done: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTodos = async () => {
            if (!selectedDirectory) return;
            // Load for today
            const today = new Date(); // In real app, might want to be timezone aware or use a helper
            const lanes = await loadDailyTodos(selectedDirectory, today);

            const newCounts = { todo: 0, inProgress: 0, done: 0 };
            lanes.forEach(lane => {
                const count = lane.items.length;
                const title = lane.title.toLowerCase();
                if (title.includes('done') || title.includes('complete')) newCounts.done += count;
                else if (title.includes('progress')) newCounts.inProgress += count;
                else newCounts.todo += count; // Default to todo
            });
            setCounts(newCounts);
            setLoading(false);
        };
        fetchTodos();
    }, [selectedDirectory, refreshTrigger]);

    return (
        <Paper
            sx={{
                ...boldBorder,
                p: 3,
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
            }}
            onClick={() => navigate('/todos')}
        >
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Checklist sx={{ fontSize: 32 }} />
                <Typography variant="h5" sx={{ fontWeight: 900 }}>Today's Tasks</Typography>
            </Stack>

            {loading ? (
                <CircularProgress size={20} />
            ) : (
                <Stack direction="row" spacing={3} justifyContent="space-around">
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" sx={{ fontWeight: 900 }}>{counts.todo}</Typography>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ opacity: 0.7 }}>
                            <RadioButtonUnchecked fontSize="small" />
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>TO DO</Typography>
                        </Stack>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main' }}>{counts.inProgress}</Typography>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ opacity: 0.7, color: 'primary.main' }}>
                            <HourglassEmpty fontSize="small" />
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>DOING</Typography>
                        </Stack>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" sx={{ fontWeight: 900, color: 'success.main' }}>{counts.done}</Typography>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ opacity: 0.7, color: 'success.main' }}>
                            <CheckCircle fontSize="small" />
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>DONE</Typography>
                        </Stack>
                    </Box>
                </Stack>
            )}
        </Paper>
    );
};

export default TodoSummary;
