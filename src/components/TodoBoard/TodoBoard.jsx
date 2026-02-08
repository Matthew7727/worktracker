
import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    IconButton,
    Paper,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Menu,
    MenuItem
} from '@mui/material';
import {
    Add,
    Delete,
    CheckCircle,
    MoreVert,
    Edit
} from '@mui/icons-material';
import { loadDailyTodos, saveDailyTodos } from '../../utils/todoManager';
import { useAppContext } from '../../context/AppContext';
import DateNavigator from './components/DateNavigator';

const Lane = ({
    title,
    items,
    onAddItem,
    onDeleteItem,
    onToggleItem,
    onRenameLane,
    onDeleteLane
}) => {
    const [newItemText, setNewItemText] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameText, setRenameText] = useState(title);

    const handleAdd = () => {
        if (newItemText.trim()) {
            onAddItem(title, newItemText);
            setNewItemText('');
        }
    };

    const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const startRenaming = () => {
        setIsRenaming(true);
        handleMenuClose();
    };

    const saveRename = () => {
        if (renameText.trim() && renameText !== title) {
            onRenameLane(title, renameText);
        }
        setIsRenaming(false);
    };

    return (
        <Paper
            elevation={0}
            sx={{
                flex: 1,
                minWidth: '300px',
                maxWidth: '350px',
                p: 2,
                bgcolor: 'background.default',
                border: '2px solid',
                borderColor: 'divider',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                {isRenaming ? (
                    <TextField
                        size="small"
                        value={renameText}
                        onChange={(e) => setRenameText(e.target.value)}
                        onBlur={saveRename}
                        onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                        autoFocus
                    />
                ) : (
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{title}</Typography>
                )}

                <IconButton size="small" onClick={handleMenuClick}>
                    <MoreVert />
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={startRenaming}>
                        <Edit fontSize="small" sx={{ mr: 1 }} /> Rename
                    </MenuItem>
                    <MenuItem onClick={() => { onDeleteLane(title); handleMenuClose(); }} sx={{ color: 'error.main' }}>
                        <Delete fontSize="small" sx={{ mr: 1 }} /> Delete Lane
                    </MenuItem>
                </Menu>
            </Box>

            <Stack spacing={1} sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
                {items.map((item, index) => (
                    <Paper
                        key={index}
                        variant="outlined"
                        sx={{
                            p: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            borderColor: item.completed ? 'success.main' : 'divider',
                            bgcolor: item.completed ? 'action.selected' : 'background.paper',
                            transition: 'all 0.2s'
                        }}
                    >
                        <IconButton
                            size="small"
                            onClick={() => onToggleItem(title, index)}
                            color={item.completed ? 'success' : 'default'}
                        >
                            <CheckCircle />
                        </IconButton>
                        <Typography
                            variant="body2"
                            sx={{
                                flex: 1,
                                textDecoration: item.completed ? 'line-through' : 'none',
                                color: item.completed ? 'text.secondary' : 'text.primary',
                                fontWeight: 600
                            }}
                        >
                            {item.text}
                        </Typography>
                        <IconButton size="small" onClick={() => onDeleteItem(title, index)}>
                            <Delete fontSize="small" />
                        </IconButton>
                    </Paper>
                ))}
            </Stack>

            <Box
                sx={{ display: 'flex', gap: 1, position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
                onMouseDown={(e) => e.stopPropagation()}
                className="nodrag"
            >
                <TextField
                    size="small"
                    fullWidth
                    placeholder="New Task..."
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    sx={{ bgcolor: 'background.paper', borderRadius: '8px' }}
                    autoComplete="off"
                />
                <Button
                    variant="contained"
                    sx={{ minWidth: '40px', px: 0 }}
                    onClick={handleAdd}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <Add />
                </Button>
            </Box>
        </Paper>
    );
};



// ... (Lane component remains unchanged)

const TodoBoard = () => {
    const { selectedDirectory } = useAppContext();
    const [lanes, setLanes] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isAddLaneOpen, setIsAddLaneOpen] = useState(false);
    const [newLaneTitle, setNewLaneTitle] = useState('');

    const loadData = async () => {
        if (!selectedDirectory) return;
        const data = await loadDailyTodos(selectedDirectory, currentDate);
        setLanes(data || []);
    };

    useEffect(() => {
        loadData();
    }, [selectedDirectory, currentDate]);

    const saveData = (newLanes) => {
        setLanes(newLanes);
        saveDailyTodos(selectedDirectory, currentDate, newLanes);
    };

    const handlePrevDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 1);
        setCurrentDate(newDate);
    };

    const handleNextDay = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const nextDate = new Date(currentDate);
        nextDate.setDate(currentDate.getDate() + 1);
        nextDate.setHours(0, 0, 0, 0);

        if (nextDate <= today) {
            setCurrentDate(nextDate);
        }
    };

    // ... (Item handlers remain unchanged)

    const handleAddItem = (laneTitle, text) => {
        const newLanes = lanes.map(lane => {
            if (lane.title === laneTitle) {
                return {
                    ...lane,
                    items: [...lane.items, { text, completed: false }]
                };
            }
            return lane;
        });
        saveData(newLanes);
    };

    const handleToggleItem = (laneTitle, index) => {
        const newLanes = lanes.map(lane => {
            if (lane.title === laneTitle) {
                const newItems = [...lane.items];
                newItems[index].completed = !newItems[index].completed;
                return { ...lane, items: newItems };
            }
            return lane;
        });
        saveData(newLanes);
    };

    const handleDeleteItem = (laneTitle, index) => {
        const newLanes = lanes.map(lane => {
            if (lane.title === laneTitle) {
                const newItems = [...lane.items];
                newItems.splice(index, 1);
                return { ...lane, items: newItems };
            }
            return lane;
        });
        saveData(newLanes);
    };

    const handleAddLane = () => {
        if (newLaneTitle.trim()) {
            // Check for duplicate
            if (lanes.some(l => l.title === newLaneTitle.trim())) {
                alert('Lane already exists!');
                return;
            }
            const newLanes = [...lanes, { title: newLaneTitle.trim(), items: [] }];
            saveData(newLanes);
            setNewLaneTitle('');
            setIsAddLaneOpen(false);
        }
    };

    const handleRenameLane = (oldTitle, newTitle) => {
        if (lanes.some(l => l.title === newTitle)) {
            alert('Lane already exists!');
            return;
        }
        const newLanes = lanes.map(lane => {
            if (lane.title === oldTitle) {
                return { ...lane, title: newTitle };
            }
            return lane;
        });
        saveData(newLanes);
    };

    const handleDeleteLane = (title) => {
        if (window.confirm(`Delete lane "${title}" and all its tasks?`)) {
            const newLanes = lanes.filter(l => l.title !== title);
            saveData(newLanes);
        }
    };

    return (
        <Box sx={{ height: 'calc(100vh - 140px)', p: 3, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>Daily Tasks</Typography>

                <DateNavigator
                    currentDate={currentDate}
                    onPrevDay={handlePrevDay}
                    onNextDay={handleNextDay}
                    onDateChange={(val) => setCurrentDate(val)}
                >
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setIsAddLaneOpen(true)}
                        sx={{ fontWeight: 700 }}
                    >
                        Add Category
                    </Button>
                </DateNavigator>
            </Box>

            <Box sx={{ display: 'flex', gap: 3, height: '100%', overflowX: 'auto', pb: 2 }}>
                {lanes.map(lane => (
                    <Lane
                        key={lane.title}
                        title={lane.title}
                        items={lane.items}
                        onAddItem={handleAddItem}
                        onToggleItem={handleToggleItem}
                        onDeleteItem={handleDeleteItem}
                        onRenameLane={handleRenameLane}
                        onDeleteLane={handleDeleteLane}
                    />
                ))}
            </Box>

            <Dialog
                open={isAddLaneOpen}
                onClose={() => setIsAddLaneOpen(false)}
                disableEnforceFocus
                disableRestoreFocus
                sx={{ zIndex: 9999 }}
            >
                <DialogTitle sx={{ fontWeight: 900 }}>Add New Category</DialogTitle>
                <DialogContent>
                    <TextField
                        // autoFocus removed to prevent potential focus stealing loops
                        margin="dense"
                        label="Category Name"
                        fullWidth
                        variant="outlined"
                        value={newLaneTitle}
                        onChange={(e) => setNewLaneTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddLane()}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsAddLaneOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddLane} variant="contained">Add</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TodoBoard;
