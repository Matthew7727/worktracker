
import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Stack, CircularProgress } from '@mui/material';
import { Checklist, RadioButtonUnchecked, HourglassEmpty, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getTodoStats } from '../../../utils/todoManager';
import { useAppContext } from '../../../context/AppContext';

const TodoSummary = () => {
    const { selectedDirectory, refreshTrigger } = useAppContext();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        today: { total: 0, completed: 0, byCategory: [] },
        month: { completed: 0 },
        year: { completed: 0 }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTodos = async () => {
            if (!selectedDirectory) return;
            const data = await getTodoStats(selectedDirectory);
            setStats(data);
            setLoading(false);
        };
        fetchTodos();
    }, [selectedDirectory, refreshTrigger]);

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Checklist sx={{ fontSize: 32 }} />
                <Typography variant="h5" sx={{ fontWeight: 900 }}>Daily Objectives</Typography>
            </Stack>

            {loading ? (
                <CircularProgress size={20} sx={{ alignSelf: 'center' }} />
            ) : (
                <>
                    <Box sx={{ mb: 3, flex: 1 }}>
                        {stats.today.byCategory.length === 0 ? (
                            <Typography variant="body1" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                No tasks for today yet.
                            </Typography>
                        ) : (
                            <Stack spacing={1.5}>
                                {stats.today.byCategory.map((cat, idx) => (
                                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                            {cat.title}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: cat.completed === cat.total && cat.total > 0 ? 'success.main' : 'text.secondary' }}>
                                                {cat.completed}/{cat.total}
                                            </Typography>
                                            {cat.completed === cat.total && cat.total > 0 && <CheckCircle fontSize="small" color="success" />}
                                        </Box>
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Box>

                    <Box sx={{ pt: 2, borderTop: '2px dashed', borderColor: 'divider' }}>
                        <Stack direction="row" justifyContent="space-between">
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary' }}>MONTH</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 900 }}>{stats.month.completed}</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary' }}>YEAR</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 900 }}>{stats.year.completed}</Typography>
                            </Box>
                        </Stack>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default TodoSummary;
